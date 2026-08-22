# Axiom Academy — build-time content index
# GitHub Pages-compatible: uses only core Ruby/Jekyll APIs.
# Exposes metadata-driven chapters, quizzes and flashcards as site.data.content_index.

Jekyll::Hooks.register :site, :post_read do |site|
  entries = []

  site.collections.each do |collection_name, collection|
    next unless %w[chapters quizzes flashcards].include?(collection_name)

    collection.docs.each do |doc|
      data = doc.data
      next unless data["domain"] && data["contentId"]

      content_type = data["contentType"]
      content_type = {
        "chapters" => "chapter",
        "quizzes" => "quiz",
        "flashcards" => "flashcard"
      }[collection_name] unless content_type && !content_type.to_s.empty?

      entries << {
        "contentId" => data["contentId"].to_s,
        "contentType" => content_type.to_s,
        "domain" => data["domain"].to_s,
        "title" => data["title"].to_s,
        "url" => doc.url.to_s,
        "subject" => data["subject"].to_s,
        "department" => data["department"].to_s,
        "exam" => data["exam"].to_s,
        "topic" => data["topic"].to_s,
        "subtopic" => data["subtopic"].to_s
      }
    end
  end

  site.data["content_index"] = entries.sort_by do |entry|
    [entry["domain"], entry["contentType"], entry["title"]]
  end
end
