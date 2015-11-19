class Mantis::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    doc = Nokogiri::HTML(html)

    # this seems to be a good fingerprint
    search_elem = doc.css('link[rel=search]')
    return nil unless search_elem.length > 0 && search_elem.attr('title').try(:text) == "MantisBT: Text Search"

    tracker_url = search_elem.attr('href').value.gsub("browser_search_plugin.php?type=text",'')

    retval = {
      tracker_url: tracker_url,
      tracker_name: tracker_url.match(/https?:\/\/([^\/]+)/)[1],
      tracker_class: Mantis::Tracker
    }

    if url.match(/\/view\.php\?id=(\d+)/)
      number = $1.to_i
      retval.merge!(
        issue_url: tracker_url + "view.php?id=#{number}",
        issue_number: number,
        issue_class: Mantis::Issue
      )
    end

    return retval
  end

end
