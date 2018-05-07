# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string(255)      not null
#  title                    :text
#  labels                   :string(255)
#  code                     :boolean          default(FALSE)
#  state                    :string(255)
#  body                     :text
#  remote_updated_at        :datetime
#  remote_id                :integer
#  tracker_id               :integer
#  solution_id              :integer
#  featured                 :boolean          default(FALSE), not null
#  remote_created_at        :datetime
#  synced_at                :datetime
#  comment_count            :integer          default(0)
#  sync_in_progress         :boolean          default(FALSE), not null
#  bounty_total             :decimal(10, 2)   default(0.0), not null
#  type                     :string(255)      default("Issue"), not null
#  remote_type              :string(255)
#  priority                 :string(255)
#  milestone                :string(255)
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string(255)
#  owner                    :string(255)
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string(255)
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#  category                 :integer
#
# Indexes
#
#  index_issues_on_comment_count                  (comment_count)
#  index_issues_on_delta                          (delta)
#  index_issues_on_featured                       (featured)
#  index_issues_on_remote_id                      (remote_id)
#  index_issues_on_solution_started               (solution_started)
#  index_issues_on_tracker_id_and_bounty_total    (tracker_id,bounty_total)
#  index_issues_on_type                           (type)
#  index_issues_on_url                            (url) UNIQUE
#  index_issues_on_votes_count                    (votes_count)
#  index_issues_on_watchers_count                 (watchers_count)
#  index_issues_partial_author_linked_account_id  (author_linked_account_id) WHERE (author_linked_account_id IS NOT NULL)
#  index_issues_partial_bounty_total              (bounty_total) WHERE (bounty_total > (0)::numeric)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count) WHERE (COALESCE(thumbs_up_count, 0) > 0)
#

class Mantis::Issue < ::Issue
  belongs_to :tracker, class_name: "Mantis::Tracker", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 30.minutes.ago
  end

  def remote_sync(options={})
    # print view
    return if rest_api
    return if soap_api
    return if get_from_print_bug_page
  end

  def rest_api
    rest_url = url.gsub('view.php?id=', 'api/rest/issues/')
    response = JSON.parse(RestClient.get(rest_url))["issues"].first

    updates = update_from_rest_and_soap(response)

    updates[:remote_created_at] = parse_date(response["created_at"])
    updates[:remote_updated_at] = parse_date(response["updated_at"])

    # do updates
    update_attributes!(updates)

    # sync comments
    if response["notes"]
      comments = response["notes"].map do |comment|
        {
          remote_id: comment["id"],
          author_name: comment["reporter"]["name"],
          created_at: comment["created_at"],
          body_html: comment["text"]
        }
      end
      sync_comments_from_array(comments)
    end
    return true
  rescue RestClient::ExceptionWithResponse
    return nil
  end

  def soap_api
    soap_url = tracker.url + "api/soap/mantisconnect.php?wsdl"
    client = Savon.client(wsdl: soap_url)
    response = client.call(:mc_issue_get, message: {username: "", password: "", "issue_id"=> "#{url.match(/view\.php\?id=(\d+)/)[1].to_i}"}).body
    response = response[:mc_issue_get_response][:return]
    response = response.with_indifferent_access

    updates = update_from_rest_and_soap(response)

    updates[:remote_created_at] = response["date_submitted"]
    updates[:remote_updated_at] = response["last_updated"]

    # do updates
    update_attributes!(updates)

    # sync comments
    if response["notes"]
      comments = response["notes"]["item"].kind_of?(Array) ? response["notes"]["item"] : [response["notes"]["item"]]
      comments = comments.map do |comment|
        {
          remote_id: comment["id"],
          author_name: comment["reporter"]["name"],
          created_at: comment["date_submitted"],
          body_html: comment["text"]
        }
      end
      sync_comments_from_array(comments)
    end
    return true
  rescue Savon::Error
    return nil
  end

  def get_from_print_bug_page
    http_request = HTTParty.get(url.gsub('view.php?id=', 'print_bug_page.php?bug_id='))
    if http_request.code == 404
      return nil
    else
      doc = Nokogiri::HTML(http_request)
      updates = { synced_at: Time.now }
      updates[:number] = url.match(/view\.php\?id=(\d+)/)[1].to_i
      updates[:title] = doc.css('td.print-category:contains("Summary"), th.print-category:contains("Summary")').first.next_element.text.gsub(/^\d+: /,'')
      updates[:state] = doc.css('td.print-category:contains("Status"), th.print-category:contains("Summary")').first.next_element.text
      updates[:severity] = doc.css('td.print-category:contains("Severity"), th.print-category:contains("Summary")').first.next_element.text
      updates[:priority] = doc.css('td.print-category:contains("Priority"), th.print-category:contains("Summary")').first.next_element.text
      updates[:can_add_bounty] = self.class.can_add_bounty_from_state(updates[:state])
      updates[:author_name] = doc.css('td.print-category:contains("Reporter"), th.print-category:contains("Summary")').first.next_element.text

      body = ""
      ['Description', 'Steps To Reproduce', 'Additional Information'].each do |section|
        tmp_text = doc.css("td.print-category:contains(\"#{section}\"), th.print-category:contains(\"#{section}\")").first.next_element.inner_html
        body += "<h1>#{section}</h1>#{tmp_text}" unless tmp_text.blank?
      end
      updates[:body] = body

      td = doc.css('td.print:contains("Date Submitted")').first
      idx = td.parent.children.find_index(td)
      txt = td.parent.next_element.children[idx].text
      updates[:remote_created_at] = parse_date(txt)


      td = doc.css('td.print:contains("Last Update")').first
      idx = td.parent.children.find_index(td)
      txt = td.parent.next_element.children[idx].text
      updates[:remote_updated_at] = parse_date(txt)

      # do updates
      update_attributes!(updates)

      # sync comments
      comments = doc.css('td.nopad[width="20%"]').map do |td|
        {
          remote_id: td.css('td')[0].text.gsub(/[^\d]/,''),
          author_name: td.css('td')[1].text.gsub(/[^a-zA-Z0-9]/,''),
          created_at: Time.parse(td.css('td')[2].text),
          body_html: td.next_element.css('td').inner_html
        }
      end
      sync_comments_from_array(comments)
      return true
    end
  end

  def parse_date(txt)
    if /\d{4}-\d{2}-\d{2}/.match(txt)
      Time.parse(txt)
    elsif /\d{2}-\d{2}-\d{2}/.match(txt)
      Time.strptime(txt, '%d-%m-%y %k:%M')
    else
      Time.now
    end
  end

  def self.can_add_bounty_from_state(state)
    !%w(closed resolved).include?(state)
  end

  # need to convert remote_id to integer in line 201 for mantis issue, not sure about other, thus create a temp function here
  def sync_comments_from_array(comment_list)
    comment_list.map!(&:with_indifferent_access)
    comment_map = comments.where(remote_id: comment_list.map { |c| c[:remote_id] }).inject({}) { |h,c| h[c.remote_id] = c; h }
    comment_list.each do |comment_hash|
      if comment_map.has_key?(comment_hash[:remote_id].to_i) #convert remote_id to int
        comment_map[comment_hash[:remote_id].to_i].update_attributes!(comment_hash)
      else
        comment_map[comment_hash[:remote_id].to_i] = self.comments.create!(comment_hash)
      end
    end

    # Remove deleted or duplicate comments... anything that's not in our comment_map from above
    comments.where("id not in (?)", comment_map.values.map(&:id)).delete_all

    update_comment_cache_counters
  end
private
  def update_from_rest_and_soap(response)
    updates = {synced_at: Time.now}
    updates[:number] = url.match(/view\.php\?id=(\d+)/)[1].to_i
    updates[:title] = response["summary"]
    updates[:state] = response["status"]["name"]
    updates[:severity] = response["severity"]["name"]
    updates[:priority] = response["priority"]["name"]
    updates[:can_add_bounty] = self.class.can_add_bounty_from_state(updates[:state])
    updates[:author_name] = response["reporter"]["name"]

    body = ""
    ['description', 'steps_to_reproduce', 'additional_information'].each do |section|
      tmp_text = response[section]
      body += "<h1>#{section.titleize}</h1>#{tmp_text}" unless tmp_text.blank?
    end
    updates[:body] = body

    return updates
  end
end
