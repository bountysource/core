class SourceForgeNative::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    page = Nokogiri::HTML(html)
    repo_name = page.css('#project_nav_container h1').text.strip.gsub("\n", '')
    if matches = url.match(/^http:\/\/(?:www\.)?sourceforge\.net\/tracker\/?.*func\=detail/)
      param_str = url.split('?').last
      params = CGI.parse(param_str)
      repo_id = params['group_id'].first
      number = params['aid'].first
      type_id = params['atid'].first #special item type id from source forge

      {
        issue_url: "http://sourceforge.net/tracker/?func=detail&aid=#{number}&group_id=#{repo_id}&atid=#{type_id}",
        issue_number: number,
        issue_title: nil,
        issue_class: SourceForgeNative::Issue,
        tracker_url: "http://sourceforge.net/tracker/?group_id=#{repo_id}",
        tracker_name: repo_name,
        tracker_class: SourceForgeNative::Tracker
      }
    elsif matches = url.match(/^http:\/\/(?:www\.)?sourceforge\.net\/tracker\/?.*group_id\=(\d+)/)
      repo_id = $1
      {
        tracker_url: "http://sourceforge.net/tracker/?group_id=#{repo_id}",
        tracker_name: repo_name,
        tracker_class: SourceForgeNative::Tracker
      }
    end
  end

  def self.generate_issue_list_path(options = {})
    html = HTTParty.get(options[:tracker_url]).body rescue ''
    page = Nokogiri::HTML(html)
    # try hard, since sourceforge generate the bug category dynamically for each tracker
    # even the name can be different
    bug_list_path = page.css('ul.clean li a').first.attribute('href').value
    bug_list_path + '&' + options.to_param
  end

protected

  def self.parse_issue_list(base_url, response)
    page = Nokogiri::HTML(response)
    page.css('table.tracker tbody tr').map do |row|
      data = row.css('td')
      {
        number: data[0].text.strip,
        title: data[1].text.strip,
        state: data[2].text.strip.downcase,
        owner: data[4].text.strip,
        author_name: data[5].text.strip,
        priority: data[7].text.strip,
        remote_created_at: DateTime.parse(data[3].text.strip),
        can_add_bounty: data[2].text.strip.downcase != 'closed',
        url: File.join(base_url, data[1].css('a').attribute('href').value)
      }
    end
  end

  def self.parse_single_issue(response)
    # Parse a single ticket HTML
    page = Nokogiri::HTML(response)
    basic_info = page.css('div.yui-g.box')
    owner_info = basic_info.css('div.yui-u').xpath('label[contains(text(), "Assigned")]').first.next.next.text.strip
    owner_info = nil if owner_info == "nobody"

    state = basic_info.css('div.yui-u').xpath('label[contains(text(), "Status")]').first.next.next.text.strip.downcase
    {
      title: page.css('div.yui-gc.box div.yui-u.first span').last.text.strip,
      state: state,
      can_add_bounty: state != 'closed',
      priority: basic_info.css('div.yui-u').xpath('label[contains(text(), "Priority")]').first.next.next.text,
      body: basic_info.xpath('//label[contains(text(), "Details")]').first.next.next.inner_html,
      owner: owner_info,
      author_name: basic_info.css('div.yui-u').xpath('label[contains(text(), "Submitted")]').first.next.next.css('a').text.strip,
      remote_created_at: DateTime.parse(basic_info.css('div.yui-u').xpath('label[contains(text(), "Submitted")]').first.next.next.children.last.text),
      comments: page.css('table.comments tr.artifact_comment').map do |node|
        {
          remote_id: node.attribute('id').value.gsub('artifact_comment_', '').to_i,
          body_html: node.css('.yui-u').last.inner_html.strip.gsub(/(<\!\-\-(?!\-\->).*\-\->)/, ''), # remote the HTML commenting
          created_at: DateTime.parse(node.css('.yui-u.first').text),
          author_name: node.css('.yui-u.first a').text.strip
        }
      end
    }
  end

end
