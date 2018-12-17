class Gitlab::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    path = url.gsub('https://gitlab.com/','')
    project_id = CGI.escape(url.gsub('https://gitlab.com/','').chomp('/'))
    if matches = url.match(/^https:\/\/gitlab\.com\/(.+)\/issues?\/(\d+)(\/.+)?$/)
      tracker_name = matches[1]
      issue_id = matches[2]
      {
        issue_url: "https://gitlab.com/#{tracker_name}/issues/#{issue_id}",
        issue_number: matches[2].to_i,
        issue_title: nil,
        issue_class: Gitlab::Issue,
        tracker_url: "https://gitlab.com/#{tracker_name}",
        tracker_name: tracker_name,
        tracker_class: Gitlab::Tracker
      }
    elsif self.fetch_tracker(url: "https://gitlab.com/api/v4/projects/#{project_id}")
      {
        tracker_url: url,
        tracker_name: path,
        tracker_class: Gitlab::Tracker
      }
    else
      nil
    end
  end

  def self.generate_issue_list_path(params = {})
    "/issues?" + params.to_param
  end

  def self.generate_base_url(tracker)
    project_id = CGI.escape(tracker.url.gsub('https://gitlab.com/',''))
    "https://gitlab.com/api/v4/projects/#{project_id}"
  end

  def self.generate_issue_detail_path(issue)
    "/issues/#{issue.number}"
  end

  def self.generate_issue_comments_path(issue)
    "/issues/#{issue.number}/notes"
  end

  def self.fetch_issues(options={})
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    response = HTTParty.get(options[:url], headers: {'Private-Token' => ENV['GITLAB_PERSONAL_ACCESS_TOKEN']}, timeout: 10)
    {
      data: parse_issues_attributes(response.body),
      total_pages: response.headers["x-total-pages"]&.to_i,
    }
  end

  def self.fetch_tracker(options={})
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], headers: {'Private-Token' => ENV['GITLAB_PERSONAL_ACCESS_TOKEN']}, timeout: 10).body
    parse_tracker_attributes(options[:html])
  end

  def self.fetch_issue_comments(options={})
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], headers: {'Private-Token' => ENV['GITLAB_PERSONAL_ACCESS_TOKEN']}, timeout: 10).body
    parse_issue_comments(options[:html])
  end

  private

  def self.parse_issues_attributes(response = "")
    issues_response = JSON.parse(response)
    return nil unless issues_response.dig(0, 'id').present?
    issues_response.map do |issue_data|
      linked_account = LinkedAccount::Gitlab.find_or_create_from_api_response(
        author_name: issue_data.dig("author", "name"),
        author_image_url: issue_data.dig("author", "avatar_url"),
        remote_id: issue_data.dig("author", "id")
      )
      extract_issue_data(issue_data, linked_account)
    end
  end

  def self.parse_tracker_attributes(response = "")
    tracker_response = JSON.parse(response)
    return nil unless tracker_response['id'] && tracker_response['web_url']
    {
      remote_id: tracker_response['id'],
      url: tracker_response['web_url'],
      remote_name: tracker_response['name'],
      watchers: tracker_response['star_count'],
      forks: tracker_response['forks_count'],
      has_issues: tracker_response['issues_enabled'],
      has_wiki: tracker_response['wiki_enabled'],
      open_issues: tracker_response['open_issues_count'] && !tracker_response['open_issues_count'].zero?,
      description: tracker_response['description'],
      remote_description: tracker_response['description'],
      image_url: tracker_response['avatar_url'],
      type: 'Gitlab::Tracker'
    }

  end

  def self.parse_single_issue(response = "")
    issue = JSON.parse(response)

    linked_account = LinkedAccount::Gitlab.find_or_create_from_api_response(
      author_name: issue.dig("author", "name"),
      author_image_url: issue.dig("author", "avatar_url"),
      remote_id: issue.dig("author", "id")
    )

    extract_issue_data(issue, linked_account)
  end

  def self.extract_issue_data(issue_data, linked_account)
    {
      number: issue_data['iid'],
      title: issue_data['title'],
      state: issue_data['state'],
      body_markdown: issue_data['description'],
      can_add_bounty: issue_data['state'] == 'opened',
      url: issue_data['web_url'],
      owner: issue_data.dig("author", "name") || '',
      author: linked_account,
      remote_created_at: DateTime.parse(issue_data['created_at']),
      remote_updated_at: DateTime.parse(issue_data['updated_at'])
    }
  end

  def self.parse_issue_comments(response = "")
    data = JSON.parse(response)

    data.map do |comment|
      linked_account = LinkedAccount::Gitlab.find_or_create_from_api_response(
        author_name: comment.dig("author", "name"),
        author_image_url: comment.dig("author", "avatar_url"),
        remote_id: comment.dig("author", "id")
      )

      {
        remote_id: comment.dig('id'),
        body_markdown: comment.dig('body'),
        created_at: DateTime.parse(comment['created_at']),
        author: linked_account
      }
    end
  end
end
