class Trac::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    # gotchas:
    #  - vlc doesn't have search
    #  - jquery redirects to /newticket

    return nil unless matches = html.match(/rel="help" href="(.*?)wiki\/TracGuide"/)
    base_url = File.join(url.partition(/https?:\/\/[^\/]*/)[1],matches[1])

    # we'll extract the repository name from the <title>
    title = html.match(/<title>([\s\S]*?)<\/title>/)[1]

    # unfortunately the title is in unicode and is being difficult, so we:
    # look at title, look at actual bytes, convert utf-8 encoded endashes to \r, and then split by \r
    bytes = title.bytes.to_a
    i=0
    while i < bytes.length do
      if i+2 <= bytes.length && (bytes[i] == 239 && bytes[i+1] == 191 && bytes[i+2] == 189) || (bytes[i] == 226 && bytes[i+1] == 128 && bytes[i+2] == 147)
        bytes.slice!(i,2)
        bytes[i] = 13
      else
        i+=1
      end
    end
    tracker_name = CGI.unescapeHTML(bytes.pack('c*').split(/\r+/).map { |r| r.strip.split(/\n/).first.strip }.last)


    if matches = url.match(/^.*\/ticket\/(\d+)/)
      #return nil unless html =~ /<link rel="alternate" href=".*?ticket\/\d+\?format=csv"/
      number = $1.to_i
      {
        issue_url: File.join(base_url, "ticket/#{number}"),
        issue_number: number,
        issue_title: 'Loading...',
        issue_class: Trac::Issue,
        tracker_url: base_url,
        tracker_name: tracker_name,
        tracker_class: Trac::Tracker
      }
    else
      {
        tracker_url: base_url,
        tracker_name: tracker_name,
        tracker_class: Trac::Tracker
      }
    end
  end

  def self.generate_issue_list_path(options = {})
    "query?" + { max: 100, page: 1, format: 'csv' }.merge(options).to_param
  end

protected

  def self.parse_issue_list(base_url, response)
    result = []
    csv = CSV.parse(response, {headers: true}) do |content|
      result << {
        number: content[0], # Some sites return the csv ID like this "\xEF\xBB\xBFid":"194"
        title: content['summary'],
        state: content['status'],
        priority: content['priority'],
        milestone: content['milestone'],
        body: content['description'],
        can_add_bounty: status_to_can_add_bounty(content['status']),
        url: File.join(base_url, "ticket/#{content[0]}")
      }
    end
    result
  end

  def self.parse_single_issue(response)
    # Parse a single ticket HTML
    page = Nokogiri::HTML(response)
    owner_elements = page.css('#ticket .properties td[headers="h_owner"]')
    owner_info = owner_elements.children.count > 0 ? owner_elements.children.last.text : owner_elements.text
    reporter_elements = page.css('#ticket .properties td[headers="h_reporter"]')
    reporter_info = reporter_elements.children.count > 0 ? reporter_elements.children.last.text : reporter_elements.text

    # Two possible locations of status. Thanks, Boost.
    # Example of 1st case: https://code.djangoproject.com/ticket/22048
    # Example of 2nd case: https://svn.boost.org/trac/boost/ticket/6700
    status = page.css('#ticket .trac-status a').text

    if status.blank?
      status = page.css('#trac-ticket-title .status').text.match(%r{\A\((\w+)}).try(:[], 1)
    end

    ticket_info = {
      title: page.css('#ticket .summary').text,
      state: page.css('#ticket .trac-status a').text,
      can_add_bounty: status_to_can_add_bounty(status),
      priority: page.css('#ticket .properties td[headers="h_priority"] a').text,
      milestone: page.css('#ticket .properties td[headers="h_milestone"] a').text,
      body: page.css('#ticket .description .searchable').children.to_s.strip,
      owner: owner_info,
      author_name: reporter_info,
      remote_created_at: DateTime.parse(page.css('#ticket .date a.timeline').first.attribute('href').to_s.match(/from=(.*?)T/)[1]),
      remote_updated_at: DateTime.parse(page.css('#ticket .date a.timeline').last.attribute('href').to_s.match(/from=(.*?)T/)[1]),
      votes_count: (page.css('#votes').text.to_i rescue nil)  # if the Votes plugin is installed
    }
    ticket_info[:comments] = []
    page.css('#changelog div.change').each do |node|
      # trac 0.11 vs. 0.12 difference (where ID is)
      remote_id = node.attribute('id').to_s.scan(/\d+/).first || node.css('h3').attribute('id').to_s.scan(/\d+/).first
      ticket_info[:comments] << {
        remote_id: remote_id.to_i,
        body_html: (node.css('ul.changes').to_s + node.css('div.comment.searchable').children.to_s).strip,
        created_at: DateTime.parse(node.css('a.timeline').attribute('href').to_s.match(/from=(.*?)T/)[1]),
        author_name: node.css('h3.change').children.last.to_s.gsub(" by ", "").gsub("\n", "").strip
      } if remote_id
    end
    ticket_info
  end

  # Possible statuses: new, assigned, accepted, closed, reopened.
  def self.status_to_can_add_bounty(status)
    !%w(closed accepted).include?(status.downcase)
  end

end
