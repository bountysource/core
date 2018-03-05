class Bugzilla::API < Tracker::RemoteAPI

  def self.generate_base_url(tracker_url)
    tracker_url.gsub(/\/buglist\.cgi\?product\=.+$/, '/')
  end

  def self.generate_product_name_param(tracker_url)
    uri = URI.parse(tracker_url)
    params = Rack::Utils.parse_nested_query(uri.query).with_indifferent_access
    params[:product]
  end

  def self.generate_issue_path(params = {})
    "show_bug.cgi?" + params.to_param
  end

  def self.generate_issue_list_path(params = {})
    "buglist.cgi?" + params.to_param
  end

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    # extract some stuff from HTML
    return nil unless html.match(/id="bugzilla-body"/)

    # extract base_url and ensure we're at an action
    path, query = url.split('?',2)
    base_url, slash, action = path.rpartition('/')
    base_url += slash

    params = Rack::Utils.parse_nested_query(query).with_indifferent_access

    doc = Nokogiri::HTML(html)

    # Try to get name from various locations
    bugzilla_name = doc.css('link[rel="search"]').attribute('title').text.gsub(/\s*Bugzilla\s*/,'')
    bugzilla_name = doc.css('#title').text.gsub(%r{\s*bugzilla\s*}i,'').strip if bugzilla_name.blank?

    if action == 'show_bug.cgi' && params[:id]
      product_name = doc.css('#field_container_product').text.strip

      # Try a slightly more hacky method if that failed to find the Product name
      if product_name.blank?
        product_uri = URI.parse(doc.css("a[href^=describecomponents]").attr('href').text)
        product_uri_params = Rack::Utils.parse_nested_query(product_uri.query)
        product_name = product_uri_params["product"]
      end

      tracker_uri = URI.parse("#{base_url}buglist.cgi")
      tracker_uri.query = { product: product_name }.to_param
      tracker_url = tracker_uri.to_s

      issue_uri = URI.parse("#{base_url}show_bug.cgi")
      issue_uri.query = { id: params[:id] }.to_param
      issue_url = issue_uri.to_s

      issue_title = (doc.css('#subtitle p').text.strip rescue nil)
      issue_title = (doc.css("#bug_title").text.strip rescue nil) if issue_title.blank?
      issue_title = (doc.css('meta').find { |m| m.attribute('property').value == 'og:title' }.attribute('content').value.gsub(/^\d+ [-–] /,'') rescue nil) if issue_title.blank?
      issue_title = (doc.css('#subtitle').text.strip rescue nil) if issue_title.blank?

      {
        issue_url: issue_url,
        issue_number: params[:id],
        issue_title: issue_title,
        issue_class: Bugzilla::Issue,
        tracker_url: tracker_url,
        tracker_name: "#{bugzilla_name} - #{product_name}".gsub(/^ - /,''),
        tracker_class: Bugzilla::Tracker
      }
    else
      product_name = params[:product]
      if product_name.blank?
        product_name = doc.css(".search_description li").find { |node| node.text.include?("Product:") }.text.strip.match(%r{\Aproduct:\s*(.*)\Z}i)[1]
      end

      tracker_uri = URI.parse("#{base_url}buglist.cgi")
      tracker_uri.query = { product: product_name }.to_param
      tracker_url = tracker_uri.to_s

      {
        tracker_url: tracker_url,
        tracker_name: "#{bugzilla_name} - #{product_name}".gsub(/^ - /,''),
        tracker_class: Bugzilla::Tracker
      }
    end
  end

  # TODO: gsub describecomponents to buglist

protected

  def self.parse_single_issue(response = "")
    doc = Nokogiri::XML(response)
    doc.xpath('//bug').map do |bug|
      reporter = bug.xpath('reporter').first.attributes['name'].try(:value)
      reporter = bug.xpath('reporter').text if reporter.blank?

      owner = bug.xpath('assigned_to').first.attributes['name'].try(:value)
      owner = bug.xpath('assigned_to').text if owner.blank?

      # sometimes bugzilla doesn't give us a commentid, so we autoincrement instead
      commentid=0
      comments = bug.xpath('long_desc').map do |comment|
        who = comment.xpath('who').first.attributes['name'].try(:value)
        who = comment.xpath('who').text if who.blank?
        hash = {
          remote_id: comment.xpath('commentid').text.to_i,
          body_html: comment.xpath('thetext').text,
          created_at: DateTime.parse(comment.xpath('bug_when').text),
          author_name: who
        }
        hash[:remote_id] = commentid if hash[:remote_id].blank? || hash[:remote_id] == 0
        commentid += 1
        hash
      end

      # The issue body is rolled into comments... k.
      body = comments.shift[:body_html] unless comments.empty?

      {
        number: bug.xpath('bug_id').text,
        title: bug.xpath('short_desc').text,
        body: body,
        state: bug.xpath('bug_status').text.downcase,
        author_name: reporter,
        owner: owner,
        remote_created_at: DateTime.parse(bug.xpath('creation_ts').first.text),
        remote_updated_at: DateTime.parse(bug.xpath('delta_ts').first.text),
        remote_type: bug.xpath('bug_severity').text,
        can_add_bounty: status_to_can_add_bounty(bug.xpath('bug_status').text.strip.downcase),
        priority: bug.xpath("//priority").text.try(:capitalize),
        severity: bug.xpath("//bug_severity").text.try(:capitalize),
        votes_count: bug.xpath("//votes").text,
        comments: comments
      }
    end
  end

  # Turn the status string into a bool for the can_add_bounty value
  def self.status_to_can_add_bounty(status)
    !%w(resolved verified closed).include?(status)
  end

  def self.parse_issue_list(base_url, response = "")
    result = []
    csv = CSV.parse(response, {headers: true}) do |content|
      result << {
        number: content['bug_id'],
        title: content['short_desc'],
        state: content['bug_status'].downcase,
        url: File.join(base_url, 'show_bug.cgi?id=' + content['bug_id']),
        can_add_bounty: status_to_can_add_bounty(content['bug_status'].strip.downcase),
        severity: content['bug_severity'].try(:capitalize),
        priority: content['priority'].try(:capitalize)
      }
    end
    result
  end

end
