class Pivotal::API < Tracker::RemoteAPI

  PIVOTAL_API_KEY = '4ef2eedd8f04ecf183f17de68be90a1a'

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/www\.pivotaltracker\.com\/(?:story\/show|(?:n\/)?projects\/\d+(?:#!)?\/stories)\/(\d+)$/)
      story_data = fetch_story(url: File.join(self.api_base_url, "/stories/#{matches[1]}"))
      tracker_url = "https://www.pivotaltracker.com/projects/#{story_data[:project_id]}"
      tracker_data = fetch_tracker(url: File.join(self.api_base_url, "/projects/#{story_data[:project_id]}"))
      {
        issue_url: "https://www.pivotaltracker.com/story/show/#{matches[1]}",
        issue_number: matches[1].to_i,
        issue_title: story_data[:name],
        issue_class: Pivotal::Issue,
        tracker_url: tracker_url,
        tracker_name: tracker_data[:name],
        tracker_class: Pivotal::Tracker
      }
    elsif matches = url.match(/^https:\/\/www\.pivotaltracker\.com\/(?:n\/)?projects\/(\d+)/)
      tracker_url = "https://www.pivotaltracker.com/projects/#{matches[1]}"
      tracker_data = fetch_tracker(url: File.join(self.api_base_url, "/projects/#{matches[1]}"))
      {
        tracker_url: tracker_url,
        tracker_name: tracker_data[:name],
        tracker_class: Pivotal::Tracker
      }
    end
  end

  def self.api_base_url
    "https://www.pivotaltracker.com/services/v4"
  end

  def self.generate_base_url(tracker)
    tracker_id = tracker.url.match(/\/(\d+)/)[1]
    File.join(self.api_base_url, '/projects/', tracker_id)
  end

  def self.generate_issue_list_path(options = {})
    '/stories?' + options.to_param
  end

  def self.generate_issue_detail_path(issue)
    "/stories/#{issue.number}"
  end

  def self.generate_issue_comments_path(issue)
    "/stories/#{issue.number}/comments"
  end

  def self.required_headers
    {:headers => {"X-TrackerToken" => PIVOTAL_API_KEY}}
  end

  def self.call(options = {})
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    HTTParty.get(options[:url], {timeout: 5}.merge(required_headers)).body
  end

  def self.fetch_tracker(options = {})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_tracker"
    parse_tracker_info(self.call(options))
  end

  def self.fetch_story(options = {})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_story"
    parse_story_info(self.call(options))
  end

  def self.fetch_issue(options={})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_issue"
    parse_single_issue(self.call(options))
  end

  def self.fetch_issue_list(options={})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_issue_list"
    parse_issue_list(options[:url], self.call(options))
  end

  def self.fetch_issue_comments(options={})
    new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_comment"
    parse_issue_comments(self.call(options))
  end

protected
  def self.parse_story_info(response = "")
    data = Nokogiri::XML(response)
    {
      name: data.at_xpath('//story/name').text,
      project_id: data.at_xpath('//story/project_id').text
    }
  end

  def self.parse_tracker_info(response = "")
    data = Nokogiri::XML(response)
    {
      name: data.at_xpath('//project/name').text
    }
  end

  def self.parse_issue_comments(response = "")
    data = Nokogiri::XML(response)
    data.xpath('//comments/comment').map do |comment|
      {
        remote_id: comment.at_xpath('id').text.to_i,
        body_html: comment.at_xpath('text').text,
        created_at: DateTime.parse(comment.at_xpath('created_at').text),
        author_name: comment.at_xpath('author/person/name').text
      }
    end
  end

  def self.parse_single_issue(response = "")
    story = Nokogiri::XML(response).at_xpath('story')
    {
      number: story.at_xpath('id').text,
      title: story.at_xpath('name').text,
      state: story.at_xpath('current_state').text,
      body: story.at_xpath('description').inner_text,
      can_add_bounty: story.at_xpath('current_state').text != 'accepted',
      url: story.at_xpath('url').text,
      owner: story.at_xpath('owned_by/person/name').try(:text),
      author_name: story.at_xpath('requested_by/person/name').try(:text),
      remote_created_at: DateTime.parse(story.at_xpath('created_at').text),
      remote_updated_at: DateTime.parse(story.at_xpath('updated_at').text)
    }
  end

  def self.parse_issue_list(base_url, response = "")
    data = Nokogiri::XML(response)
    data.xpath('//stories/story').map do |story|
      {
        number: story.at_xpath('id').text,
        title: story.at_xpath('name').text,
        state: story.at_xpath('current_state').text,
        body: story.at_xpath('description').inner_text,
        can_add_bounty: story.at_xpath('current_state').text != 'accepted',
        url: story.at_xpath('url').text
      }
    end
  end
end
