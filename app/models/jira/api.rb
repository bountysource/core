class Jira::API

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    return nil unless html =~ /body id="jira"/

    if matches = url.match(/^(.*?\/browse\/)(.+?)-(\d+)$/)
      doc = Nokogiri::HTML(html)
      issue_title = doc.css('h1').text
      {
        issue_url: "#{$1}#{$2}-#{$3}",
        issue_number: $3.to_i,
        issue_title: issue_title,
        issue_class: Jira::Issue,
        tracker_url: "#{$1}#{$2}",
        tracker_name: $2,
        tracker_class: Jira::Tracker
      }
    elsif url.match(/^(.*?\/browse\/)([^-\/]+)$/)
      {
        tracker_url: "#{$1}#{$2}",
        tracker_name: $2,
        tracker_class: Jira::Tracker
      }
    end
  end

  def self.generate_base_url(tracker_url)
    tracker_url.gsub(/browse\/.+$/, '')
  end

  def self.generate_issue_path(tracker_url, number)
    tracker_token = tracker_url.match(/browse\/(.*?)$/)[1]
    # yeah I know it is double name, ask JIRA
    "si/jira.issueviews:issue-xml/#{tracker_token}-#{number}/#{tracker_token}-#{number}.xml"
  end

  def self.generate_issue_list_path(params = {})
    "sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?" + params.to_param
  end

protected

  def self.fetch_issue_list(options={})
    options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
    options[:html] ||= HTTParty.get(options[:url], timeout: 5).body
    parse_issue_list(options[:html])
  end

  def self.parse_issue_list(response="")
    synced_at = Time.now
    doc = Nokogiri::XML(response)
    {
      issues: doc.xpath('//channel/item').map { |item|
        {
          synced_at: synced_at,
          url: item.xpath('link').inner_text,
          number: item.xpath('key').inner_text.split("-").last, # format: <PROJECT_NAME>-UID
          title: item.xpath('title').inner_text.gsub(/^\[.*?\] /,''),
          state: item.xpath('status').inner_text.downcase,
          priority: item.xpath('priority').inner_text,
          body: item.xpath('description').inner_text,
          author_name: item.xpath('reporter').inner_text,
          owner: item.xpath('assignee').inner_text,
          votes_count: item.xpath('votes').inner_text,
          watchers_count: item.xpath('watches').inner_text,
          can_add_bounty: %w(open reopened inprogress notyetstarted started).include?(item.xpath('status').inner_text.gsub(/ /,'').downcase),
          remote_created_at: Time.parse(item.xpath('created').inner_text),
          remote_updated_at: Time.parse(item.xpath('updated').inner_text),
          comments: item.xpath('comments/comment').map { |comment|
            {
              remote_id: comment.attributes['id'].value.to_i,
              body_html: comment.inner_text,
              created_at: DateTime.parse(comment.attributes['created'].value),
              author_name: comment.attributes['author'].value
            }
          }
        }
      },
      total_issues: doc.xpath('//channel/issue/@total').to_s.to_i
    }
  end

end
