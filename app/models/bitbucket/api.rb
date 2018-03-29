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

  def self.generate_base_url(tracker)
    "https://api.bitbucket.org/1.0/repositories/#{tracker.url.gsub('https://bitbucket.org/','')}/"
  end

  def self.generate_issue_list_path(params = {})
    "/issues?" + params.to_param
  end

  def self.generate_issue_detail_path(issue)
    "/issues/#{issue.number}"
  end

  def self.generate_issue_comments_path(issue)
    "/issues/#{issue.number}/comments"
  end

  def self.fetch_issue_comments(options={})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_comment"
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], timeout: 5).body
    parse_issue_comments(options[:html])
  end

protected

  def self.parse_issue_comments(response = "")
    data = JSON.parse(response)

    data.map do |comment|
      linked_account = LinkedAccount::Bitbucket.find_or_create_from_api_response(
        author_name: comment['author_info'] && comment['author_info']['username'],
        author_image_url: comment['author_info'] && comment['author_info']['avatar']
      )

      {
        remote_id: comment['comment_id'],
        body_html: comment['content'],
        created_at: DateTime.parse(comment['utc_created_on']),
        author: linked_account
      }
    end
  end

  def self.parse_single_issue(response = "")
    issue = JSON.parse(response)

    linked_account = LinkedAccount::Bitbucket.find_or_create_from_api_response(
      author_name: issue['reported_by'] && issue['reported_by']['username'],
      author_image_url: issue['reported_by'] && issue['reported_by']['avatar']
    )

    {
      number: issue['local_id'],
      title: issue['title'],
      state: issue['status'],
      priority: issue['priority'],
      body: issue['content'],
      can_add_bounty: issue['status'] == 'new' || issue['status'] == 'open',
      url: issue['resource_uri'].gsub('/1.0/repositories', 'https://bitbucket.org').gsub('/issue/', '/issues/'),
      owner: issue['reported_by'] ? issue['reported_by']['username'] : '',
      author: linked_account,
      remote_created_at: DateTime.parse(issue['utc_created_on']),
      remote_updated_at: DateTime.parse(issue['utc_last_updated'])
    }
  end

  def self.parse_issue_list(base_url, response = "")
    data = JSON.parse(response)
    data['issues'].map do |issue|
      {
        number: issue['local_id'],
        title: issue['title'],
        state: issue['status'],
        priority: issue['priority'],
        body: issue['content'],
        can_add_bounty: issue['status'] == 'new' || issue['status'] == 'open',
        url: issue['resource_uri'].gsub('/1.0/repositories', 'https://bitbucket.org').gsub('/issue/', '/issues/'), 
        owner: issue['reported_by'] ? issue["reported_by"]["username"] : '', 
        remote_created_at: DateTime.parse(issue['utc_created_on']), 
        remote_updated_at: DateTime.parse(issue['utc_last_updated']) 
      }
    end
  end
end
