class Drupalorg::API < Tracker::RemoteAPI
  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/www\.drupal\.org\/node\/(\d+)(\/.+)?$/)
      {
        issue_url: "https://bitbucket.org/#{matches[1]}/#{matches[2]}/issues/#{matches[3]}",
        issue_number: matches[1].to_i,
        issue_title: nil,
        issue_class: Drupalorg::Issue,
        tracker_url: "https://www.drupal.org/node/#{matches[1]}",
        tracker_class: Drupalorg::Project
      }
    elsif matches = url.match(/^https:\/\/www\.drupal\.org\/project\/([^\/]+)\/?$/)
      {
        tracker_url: "https://www.drupal.org/project/#{matches[1]}",
        tracker_name: "#{matches[1]}",
        tracker_class: Drupalorg::Project
      }
    end
  end

  def self.generate_base_url()
    "https://www.drupal.org/api-d7/node"
  end

  def self.generate_issue_detail_path(issue)
    "/#{issue.id}.json"
  end

  def self.generate_issue_list_path(params = {})
    "/node.json?field_project=" + params.id
  end

  def self.generate_issue_comments_path(params = {})
    "/comment.json?node=" + params.id
  end

  def self.parse_single_issue(response = "")
    issue = JSON.parse(response)
    {
      number: issue['nid'],
      title: issue['title'],
      state: issue['field_issue_status'],
      priority: issue['field_issue_priority'],
      body: issue['body']['value'],
      can_add_bounty: self.class.status_to_can_add_bounty(issue['status']),
      url: issue['url'],
      owner: issue['field_issue_assigned']['id'], # @todo check if empty and look up user.
      author: issue['author']['id'], # @todo look up user.
      remote_created_at: DateTime.parse(issue['created']),
      remote_updated_at: DateTime.parse(issue['changed'])
    }
  end

  def self.status_to_can_add_bounty(status)
    [
      "1", # 'Active',
      #"2", # 'Fixed',
      #"3", # 'Closed (Duplicate)',
      "4", # 'Postponed',
      #"5", # 'Closed (Won't Fix)',
      #"6", # 'Closed (Works as designed)',
      #"7", # 'Closed (Fixed)',
      "8", # 'Needs Review',
      "13", # 'Needs Work',
      #"14", # 'RTBC',
      "15", # 'Patch (to be ported)',
      "16", # 'Postponed (Needs more info)',
      #"18", # 'Closed (Cannot Reproduce)'
    ].include?(status)
  end
end
