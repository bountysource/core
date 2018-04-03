class Bitbucket::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/bitbucket\.org\/([^\/]+)\/([^\/]+)\/issues?\/(\d+)(\/.+)?$/)
      {
        issue_url: "https://bitbucket.org/#{matches[1]}/#{matches[2]}/issues/#{matches[3]}",
        issue_number: matches[3].to_i,
        issue_title: nil,
        issue_class: Bitbucket::Issue,
        tracker_url: "https://bitbucket.org/#{matches[1]}/#{matches[2]}",
        tracker_name: "#{matches[1]}/#{matches[2]}",
        tracker_class: Bitbucket::Tracker
      }
    elsif matches = url.match(/^https:\/\/bitbucket\.org\/([^\/]+)\/([^\/]+)\/?$/)
      {
        tracker_url: "https://bitbucket.org/#{matches[1]}/#{matches[2]}",
        tracker_name: "#{matches[1]}/#{matches[2]}",
        tracker_class: Bitbucket::Tracker
      }
    end
  end

  def self.generate_base_url(tracker_url)
    tracker_url.gsub('https://bitbucket.org/', 'https://api.bitbucket.org/2.0/repositories/')
  end

  def self.issue_list_path
    '/issues'
  end

  def self.generate_issue_detail_path(issue)
    "/issues/#{issue.number}"
  end

  def self.generate_issue_comments_path(issue)
    "/issues/#{issue.number}/comments"
  end

  def self.fetch_issue_list(options = {})
    options[:base_url] ||= options[:url]
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], timeout: 15,
      headers: {
        'User-Agent' => Api::Application.config.chrome_user_agent
      }).body
    parse_issue_list(options[:base_url], options[:html], options)
  end

  def self.fetch_issue_comments(options = {})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_comment"
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], timeout: 15,
      headers: {
        'User-Agent' => Api::Application.config.chrome_user_agent
      }).body
    parse_issue_comments(options[:html])
  end

protected

  def self.parse_issue_comments(response = "")
    data = JSON.parse(response)
    comments = data['values']
    while data['next']
      response = HTTParty.get(data['next'], timeout: 15,
        headers: {
          'User-Agent' => Api::Application.config.chrome_user_agent
        }).body
      data = JSON.parse(response)
      comments.concat(data['values'])
    end

    comments.map do |comment|
      linked_account = LinkedAccount::Bitbucket.find_or_create_from_api_response(
        author_name: comment['user'] && comment['user']['username'],
        author_image_url: comment['user'] && comment['user']['links'] &&
                          comment['user']['links']['avatar'] &&
                          comment['user']['links']['avatar']['href']
      )

      {
        remote_id: comment['id'],
        body_html: comment['content'] && comment['content']['html'],
        author: linked_account,
        created_at: DateTime.parse(comment['created_on'])
      }
    end
  end

  def self.parse_single_issue(response = "")
    issue = JSON.parse(response)

    linked_account = LinkedAccount::Bitbucket.find_or_create_from_api_response(
      author_name: issue['reporter'] && issue['reporter']['username'],
      author_image_url: issue['reporter'] && issue['reporter']['links'] &&
                        issue['reporter']['links']['avatar'] &&
                        issue['reporter']['links']['avatar']['href']
    )

    {
      number: issue['id'],
      title: issue['title'],
      state: issue['status'],
      priority: issue['priority'],
      body: issue['content'] && issue['content']['html'],
      can_add_bounty: issue['status'] == 'new' || issue['status'] == 'open',
      url: issue['links'] && issue['links']['html'] &&
           issue['links']['html']['href'],
      author: linked_account,
      owner: issue['assignee'] ? issue['assignee']['username'] : nil,
      remote_created_at: DateTime.parse(issue['created_on']),
      remote_updated_at: issue['updated_on'] &&
                         DateTime.parse(issue['updated_on'])
    }
  end

  def self.parse_issue_list(base_url, response = "", state = {})
    data = JSON.parse(response)
    state[:next_url] = data['next']
    data['values'].map do |issue|
      {
        number: issue['id'],
        title: issue['title'],
        state: issue['status'],
        priority: issue['priority'],
        body: issue['content'] && issue['content']['html'],
        can_add_bounty: issue['status'] == 'new' || issue['status'] == 'open',
        url: issue['links'] && issue['links']['html'] &&
             issue['links']['html']['href'],
        owner: issue['assignee'] ? issue['assignee']['username'] : nil,
        remote_created_at: DateTime.parse(issue['created_on']),
        remote_updated_at: issue['updated_on'] &&
                           DateTime.parse(issue['updated_on'])
      }
    end
  end
end
