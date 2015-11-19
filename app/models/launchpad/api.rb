class Launchpad::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/bugs\.launchpad.net\/((?:ubuntu\/\+source\/)?[^\/]+)\/\+bug\/(\d+)\/?$/)
      {
        issue_url: "https://bugs.launchpad.net/#{matches[1]}/+bug/#{matches[2]}",
        issue_number: matches[2].to_i,
        issue_title: nil,
        issue_class: Launchpad::Issue,
        tracker_url: "https://bugs.launchpad.net/#{matches[1]}",
        tracker_name: url_path_to_tracker_name(matches[1]),
        tracker_class: Launchpad::Tracker
      }
    elsif matches = url.match(/^https:\/\/(?:bugs\.)?launchpad.net\/((?:ubuntu\/\+source\/)?[^\/]+)\/?$/)
      {
        tracker_url: "https://bugs.launchpad.net/#{matches[1]}",
        tracker_name: url_path_to_tracker_name(matches[1]),
        tracker_class: Launchpad::Tracker
      }
    end
  end

  def self.generate_issue_list_path(params = {})
    "/+bugs?" + params.to_param
  end

protected

  # turns "ubuntu/+source/foobar" into "foobar (ubuntu)"
  def self.url_path_to_tracker_name(path)
    if path =~ /ubuntu\/\+source\//
      path.gsub(/ubuntu\/\+source\//,'') + ' (Ubuntu)'
    else
      path
    end
  end

  def self.parse_single_issue(response = "")
    page = Nokogiri::HTML(response)
    status = page.css('#affected-software .highlight .status-content .value').text.downcase
    owner_info = page.css('#affected-software .highlight .yui3-activator-data-box .person')
    ticket_info = {
      title: page.css('h1#edit-title').text.strip.truncate(255),
      state: status,
      can_add_bounty: status_to_can_add_bounty(status),
      priority: page.css('#affected-software .highlight .importance-content .value').text.strip.downcase,
      body: page.css('#edit-description .yui3-editable_text-text').inner_html,
      owner: owner_info ? owner_info.text : nil,
      author_name: page.css('#registration.registering a.person').text.strip,
      remote_created_at: DateTime.parse(page.css('#registration.registering span').attribute('title').value),
      remote_updated_at: DateTime.parse(page.css('#registration.registering span').attribute('title').value),
      comments: [],
      votes_count: (page.css('#affectsmetoo').text.match(/\d+/)[0] rescue nil)
    }
    page.css('.boardComment').map do |node|
      # ignore description updates, etc
      next unless node.attribute('itemtype').to_s == "http://schema.org/UserComments"

      id = node.css('.boardCommentDetails .bug-comment-index').text.gsub('#', '').strip
      unless id.blank? # some entry is not comment
        ticket_info[:comments] << {
          remote_id: id.to_i,
          body_html: node.css('.boardCommentBody > ul').to_s + node.css('.boardCommentBody .comment-text').inner_html + node.css('table.bug-activity').to_s,
          created_at: DateTime.parse(node.css('.boardCommentDetails time').attribute('title').value),
          author_name: node.css('.boardCommentDetails .person, .boardCommentDetails .person-inactive').text.strip
        }
      end
    end

    # # set issue url and make sure we have correct tracker
    # ticket_info[:url] = response.match(/href="(https:\/\/bugs\.launchpad\.net\/(.*?)\/\+bug\/\d+)\/\+editstatus"/)[1] or raise "url not extracted from launchpad HTML"
    # ticket_info[:tracker] = tracker_from_issue_url(ticket_info[:url])

    ticket_info
  end

  def self.parse_issue_list(base_url, response = "")
    page = Nokogiri::HTML(response)
    page.css('#client-listing .buglisting-row').map do |row|
      issue_url = row.css('a.bugtitle').attribute('href').value
      tracker = tracker_from_issue_url(issue_url)

      status = row.css('.status').text
      {
        number: row.css('.bugnumber').text.gsub('#', ''),
        title: row.css('.bugtitle').text.strip.truncate(255),
        state: status,
        priority: row.css('.importance').text,
        can_add_bounty: status_to_can_add_bounty(status),
        url: issue_url,
        tracker: tracker
      }
    end
  end

  def self.tracker_from_issue_url(issue_url)
    url_info = extract_info_from_url(issue_url)
    Tracker.magically_turn_url_into_tracker_or_issue(url_info[:tracker_url])
  end

  # https://help.launchpad.net/Bugs/Statuses
  def self.status_to_can_add_bounty(status)
    ['new', 'incomplete', 'confirmed', 'in progress', 'triaged'].include?(status.downcase.strip)
  end
end
