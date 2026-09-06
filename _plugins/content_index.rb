# Axiom Academy — build-time content index
# GitHub Pages-compatible: uses only core Ruby/Jekyll APIs.
# Exposes real chapters, quizzes, and flashcards as site.data.content_index
# and writes the same contract to _site/content-index.json for /search/.
#
# Output contract (validated by CI, consumed by search/index.html):
#   [{ contentId, contentType, domain, title, url,
#      subject, department, exam, topic, subtopic }]
# - domain is always one of: high-school | university | extras
# - url always includes site.baseurl so links work under /axiom-academy/

require "json"

module AxiomContentIndex
  DOMAINS = %w[high-school university extras].freeze

  LAYOUT_TYPES = {
    "chapter" => "chapter",
    "study-reader" => "chapter",
    "quiz" => "quiz",
    "flash" => "flashcard",
    "volume-index" => "volume"
  }.freeze

  module_function

  def with_baseurl(site, url)
    baseurl = site.config["baseurl"].to_s
    path = url.to_s
    return path if baseurl.empty? || path.start_with?(baseurl)

    "#{baseurl}#{path}"
  end

  def domain_from_front_matter(data)
    domain = data["domain"].to_s.strip
    DOMAINS.include?(domain) ? domain : nil
  end

  # Derive the owning domain from the page URL. Study, quiz, flash, and
  # reader routes all carry their domain in the path.
  def domain_from_url(url)
    parts = url.to_s.split("/").reject(&:empty?)
    return nil if parts.empty?

    first = parts[0]
    return first if DOMAINS.include?(first)
    return parts[1] if first == "quiz" && DOMAINS.include?(parts[1])
    return "high-school" if first == "flash"
    return "extras" if first == "read"

    nil
  end

  def type_for_page(data, url)
    explicit = data["contentType"].to_s.strip
    return explicit unless explicit.empty?

    path = url.to_s
    return "quiz" if path.start_with?("/quiz/")
    return "flashcard" if path.start_with?("/flash/")

    LAYOUT_TYPES[data["layout"].to_s] || "page"
  end

  def page_entry(site, page)
    data = page.data
    url = page.url.to_s
    return nil if url.empty?

    domain = domain_from_front_matter(data) || domain_from_url(url)
    return nil unless domain

    title = data["title"].to_s.strip
    return nil if title.empty?

    content_id = data["contentId"].to_s.strip
    content_id = "page:#{url}" if content_id.empty?

    {
      "contentId" => content_id,
      "contentType" => type_for_page(data, url),
      "domain" => domain,
      "title" => title,
      "url" => with_baseurl(site, url),
      "subject" => (data["subject"] || data["high_school_subject"]).to_s,
      "department" => data["department"].to_s,
      "exam" => data["exam"].to_s,
      "topic" => (data["topic"] || data["high_school_topic"]).to_s,
      "subtopic" => (data["subtopic"] || data["high_school_subtopic"]).to_s
    }
  end

  def collection_entry(site, collection_name, doc)
    data = doc.data
    return nil unless data["domain"] && data["contentId"]

    content_type = data["contentType"].to_s.strip
    if content_type.empty?
      content_type = {
        "chapters" => "chapter",
        "quizzes" => "quiz",
        "flashcards" => "flashcard"
      }[collection_name] || "page"
    end

    {
      "contentId" => data["contentId"].to_s,
      "contentType" => content_type,
      "domain" => data["domain"].to_s,
      "title" => data["title"].to_s,
      "url" => with_baseurl(site, doc.url),
      "subject" => data["subject"].to_s,
      "department" => data["department"].to_s,
      "exam" => data["exam"].to_s,
      "topic" => data["topic"].to_s,
      "subtopic" => data["subtopic"].to_s
    }
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  entries = []
  seen_urls = {}

  site.collections.each do |collection_name, collection|
    next unless %w[chapters quizzes flashcards].include?(collection_name)

    collection.docs.each do |doc|
      entry = AxiomContentIndex.collection_entry(site, collection_name, doc)
      next unless entry
      next if seen_urls[entry["url"]]

      seen_urls[entry["url"]] = true
      entries << entry
    end
  end

  site.pages.each do |page|
    entry = AxiomContentIndex.page_entry(site, page)
    next unless entry
    next if seen_urls[entry["url"]]

    seen_urls[entry["url"]] = true
    entries << entry
  end

  site.data["content_index"] = entries.sort_by do |entry|
    [entry["domain"], entry["contentType"], entry["title"]]
  end
end

# Write the generated index into _site so CI can validate and the frontend can consume it.
Jekyll::Hooks.register :site, :post_write do |site|
  output_path = File.join(site.dest, "content-index.json")
  File.write(output_path, JSON.pretty_generate(site.data["content_index"] || []))
end
