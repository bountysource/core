class SourceForge::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^http:\/\/(?:www\.)?sourceforge\.net\/p(?:rojects)?\/([^\/]+)\/([a-z\-]+)\/(\d+)\/?$/)
      repo_name = $1
      issue_type = $2
      number = $3
      {
        issue_url: "http://sourceforge.net/p/#{repo_name}/#{issue_type}/#{number}/",
        issue_number: number,
        issue_title: nil,
        issue_class: SourceForge::Issue,
        tracker_url: "http://sourceforge.net/p/#{repo_name}/#{issue_type}/",
        tracker_name: "#{repo_name}-#{issue_type}",
        tracker_class: SourceForge::Tracker
      }
    elsif matches = url.match(/^http:\/\/(?:www\.)?sourceforge\.net\/p(?:rojects)?\/([^?\/]+)\/([a-z\-]+)/)
      repo_name = $1
      issue_type = $2
      {
        tracker_url: "http://sourceforge.net/p/#{repo_name}/#{issue_type}/",
        tracker_name: "#{repo_name}-#{issue_type}",
        tracker_class: SourceForge::Tracker
      }
    end
  end

  # http://sourceforge.net/apps/mediawiki/jedit/index.php?title=Bug_tracker_details#Open
  def self.open_resolutions
    %w(later none postponed remind accepted duplicate)
  end

  # http://sourceforge.net/apps/mediawiki/jedit/index.php?title=Bug_tracker_details#Closed
  def self.closed_resolutions
    %w(accepted duplicate fixed invalid later out-of-date rejected wont-fix works-for-me)
  end

protected

  def self.parse_issue_list(base_url, response)
    page = Nokogiri::HTML(response)
    page.css('table.ticket-list tbody tr').map do |row|
      data = row.css('td')
      {
        number: data[0].text,
        title: data[1].text,
        state: data[3].text,
        owner: data[4].text,
        priority: data[7].text,
        milestone: data[2].text,
        remote_created_at: DateTime.parse(data[5].css('span').attribute('title').value),
        remote_updated_at: DateTime.parse(data[6].css('span').attribute('title').value),
        can_add_bounty: data[3].text != 'closed',
        url: File.join(base_url, "/#{data[0].text}/")
      }
    end
  end

  def self.parse_single_issue(response)
    # Parse a single ticket HTML
    page = Nokogiri::HTML(response)
    basic_info = page.css('div.view_holder .grid-4')
    owner_info = page.css('div.view_holder .grid-5').text.gsub(/\s+/,' ').match(%r{Creator:\s+(.+)})[1].strip rescue nil
    owner_info = nil if owner_info == "nobody"
    state = page.css(".view_holder").text.match(%r{Status:\s+(\S+)})[1]

    # Determined in helper method below
    can_add_bounty = parse_can_add_bounty(state)

    {
      title: page.css("h2.title").text.gsub(%r{\A#\d+}, '').strip,
      state: state,
      can_add_bounty: can_add_bounty,
      priority: page.css(".view_holder").text.match(%r{Priority:\s+(\d+)})[1],
      milestone: basic_info[1].css('a').text,
      body: page.css('#ticket_content .markdown_content').inner_html,
      owner: owner_info,
      author_name: page.css('div.view_holder .grid-5').last.css('a').text,
      remote_created_at: DateTime.parse(basic_info[4].css('span').attr('title').text),

      # TODO this breaks, but isn't really that important
      # remote_updated_at: DateTime.parse(basic_info[5].css('span').attr('title').text)

      comments: page.css('#comment ul li .discussion-post').map do |node|
        {
          remote_id: node.attribute('id').value.to_i(16), # a hex-base id
          body_html: node.css('.markdown_content').inner_html,
          created_at: DateTime.parse(node.css('p.gravatar span').attr('title').value),
          author_name: node.css('p.gravatar a').text
        }
      end
    }
  end

  # Determine from the raw issue state whether or not a bounty can be added to this issue.
  # For more info about SourceForge Issue statuses, reference:
  # http://sourceforge.net/apps/mediawiki/jedit/index.php?title=Bug_tracker_details#Closed
  def self.parse_can_add_bounty(status='')
    case status
    when %r{\A(?:closed|deleted)} then false
    else true
    end
  end
end
