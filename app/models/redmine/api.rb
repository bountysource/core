class Redmine::API < Tracker::RemoteAPI

  def self.generate_base_url(tracker_url)
    tracker_url.gsub(/\/issues\/\d+/, '/')
  end

  def self.generate_issue_list_path(params = {})
    "issues?" + params.to_param
  end

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    return nil unless html.match(/redmine/)

    issue_match = url.match('/issues/(\d+)')
    if issue_match
      issue_number = issue_match[1]

      doc = Nokogiri::HTML(html)
      issue_title = doc.css('subject h3').text.strip

      tracker_url = url.gsub(issue_match[0], '')

      tracker_name = doc.css('head > title').text.gsub(/(.*? - )/, '')

      {
        issue_url: url,
        issue_number: issue_number,
        issue_title: issue_title,
        issue_class: Redmine::Issue,
        tracker_url: tracker_url,
        tracker_name: tracker_name,
        tracker_class: Redmine::Tracker
      }
    end
  end

  def self.parse_single_issue(response = "")
    doc = Nokogiri::HTML(response)

    number = doc.css('#content > h2').text.strip.gsub(/[^\d]/, '')
    title = doc.css('head > title').text.strip
    body = doc.css('.description > .wiki').text.strip
    state = doc.css('.status.attribute .value').text.strip.downcase
    author_name = doc.css('.issue .author .user.active').text.strip

    owner = doc.css('.assigned-to .value').text.strip
    owner = (owner.present? and owner != '-' ? owner : nil)
#binding.pry
    remote_created_at = doc.css('.issue .author a[2]').first['title'].strip
    remote_updated_at = doc.css('.issue .author a[3]').first['title'].strip
    remote_type = nil
    can_add_bounty = status_to_can_add_bounty(state)
    priority = doc.css('.priority.attribute .value').text.strip.capitalize
    severity = nil
    votes_count = nil

    comments = []
    doc.css('#history .journal:not(.has-details)').each do |comment|
      remote_id = comment.css('.journal-link').text.strip.gsub(/[^\d]/, '').to_i
      body_html = comment.css('.wiki').text.strip
      created_at = comment.css('h4 a[4]').first[:title].strip
      comment_author_name = comment.css('.user.active').text.strip

      comments << {
        remote_id: remote_id,
        body_html: body_html,
        created_at: created_at,
        author_name: comment_author_name
      }
    end

    {
      number: number,
      title: title,
      body: body,
      state: state,
      author_name: author_name,
      owner: owner,
      remote_created_at: remote_created_at,
      remote_updated_at: remote_updated_at,
      remote_type: remote_type,
      can_add_bounty: can_add_bounty,
      priority: priority,
      severity: severity,
      votes_count: votes_count,
      comments: comments
    }
  end

  def self.parse_issue_list(base_url, response = "")
    results = []
    doc = Nokogiri::HTML(response)
    doc.css('.issue').each do |issue|
      id = issue.css('.id a').first.text.strip
      state = issue.css('.status').first.text.downcase
      results << {
        number: id.to_i,
        title: issue.css('.subject a').first.text.strip,
        state: state,
        url: File.join(base_url, 'issues/' + id),
        can_add_bounty: status_to_can_add_bounty(state),
        severity: nil,
        priority: issue.css('.priority').first.text.strip
      }
    end
    results
  end

  private

    def self.status_to_can_add_bounty(status)
      ['new', 'assigned', 'pending', 'need more information', 'needs design'].include?(status)
    end
end
