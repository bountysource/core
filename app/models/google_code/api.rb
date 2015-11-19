class GoogleCode::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/code.google.com\/p\/([^\/]+)\/issues\/detail\?(?:.*?&)?id\=(\d+)/)
      repo_name = $1
      number = $2.to_i
      {
          issue_url: "https://code.google.com/p/#{repo_name}/issues/detail?id=#{number}",
          issue_number: number,
          issue_class: GoogleCode::Issue,
          tracker_url: "https://code.google.com/p/#{repo_name}/",
          tracker_name: repo_name,
          tracker_class: GoogleCode::Tracker
      }
    elsif matches = url.match(/^https:\/\/code.google.com\/p\/([^\/]+)\//)
      repo_name = $1
      {
          tracker_url: "https://code.google.com/p/#{repo_name}/",
          tracker_name: repo_name,
          tracker_class: GoogleCode::Tracker
      }
    end
  end

  def self.generate_issue_list_path(options = {})
    "/issues/csv?" + options.to_param
  end

protected

  def self.parse_issue_list(base_url, response)
    result = []
    csv = CSV.parse(response, {headers: true}) do |content|
      if content['ID'] =~ /^\d+$/ # there is one useless line in Google CSV
        status = content['Status'].downcase
        result << {
          number: content['ID'],
          title: content['Summary'],
          state: status,
          priority: content['Priority'],
          milestone: content['Milestone'],
          can_add_bounty: status_to_can_add_bounty(status),
          remote_type: content['Type'],
          url: File.join("#{base_url}", "/issues/detail?id=#{content['ID']}")
        }
      end
    end
    result
  end

  def self.parse_single_issue(response)
    # Parse a single ticket HTML
    page = Nokogiri::HTML(response)

    status = page.css('#issuemeta table tr').first.css('td span').text.downcase
    milestone = page.css('#issuemeta').xpath('//td/div/a/b[contains(text(), "Milestone")]').first
    priority = page.css('#issuemeta').xpath('//td/div/a/b[contains(text(), "Priority")]').first

    {
      title: page.css('#issueheader span.h3').text,
      state: status,
      can_add_bounty: status_to_can_add_bounty(status),
      priority: priority ? priority.next.text : "",
      milestone: milestone ? milestone.next.text : "",
      body: page.css('td.issuedescription div.issuedescription pre').inner_html.gsub("\r\n","<br/>"),
      owner: page.css('#issuemeta').xpath('//th[contains(text(), "Owner")]').first.next.text,
      author_name: page.css('div.issuedescription .author a').text,
      remote_created_at: DateTime.parse(page.css('td.issuedescription .author .date').attribute('title').value),
      remote_updated_at: DateTime.parse(page.css('td.issuedescription .author .date').attribute('title').value),
      comments: page.css('div.issuecomment').map do |node|
        {
          remote_id: node.attribute('id').value.gsub('hc', '').to_i,
          body_html: node.css('pre').inner_html.gsub("\r\n","<br/>"),
          created_at: DateTime.parse(node.css('.date').attribute('title').value),
          author_name: node.css('.author .userlink').text
        }
      end
    }
  end

  # Documentation about statuses is available here:
  # https://code.google.com/p/support/wiki/IssueTracker#Statuses_and_issue_life-cycle
  #
  # Note, 'Accepted' is NOT a closed state, per the documentation:
  #
  #   "It it is accepted, it is may be labeled with
  #   a milestone and a priority within that milestone, and it may also be labeled to identify the
  #   part of the product affected or the nature of the cause of the problem."
  #
  # Nothing is said about the issue being resolved.
  def self.status_to_can_add_bounty(status)
    closed_statuses = %w(fixed verified)
    !closed_statuses.include?(status.downcase)
  end

end
