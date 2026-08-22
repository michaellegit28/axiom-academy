# Axiom Academy — build-time content index
# Exposes metadata-driven chapters, quizzes and flashcards to Liquid as site.content_index.

Jekyll::Hooks.register :site, :post_read do |site|
  entries = []

  {
    "chapters" => site.collections["chapters"],
    "quizzes" => site.collections["quizzes"],
    "flashcards" => site.collections["flashcards"]
  }.each do |type, collection|
    next unless collection

    collection.docs.each do |doc|
      data = doc.data
      next unless data["domain"] && data["contentId"]

      entries << {
        "contentId" => data["contentId"].to_s,
        "contentType" => data["contentType"].to_s.empty? ? type.singularize : data["contentType"].to_s,
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

  site.data["content_index"] = entries.sort_by { |entry| [entry["domain"], entry["contentType"], entry["title"]] }
end
