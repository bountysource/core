class Mantis::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    doc = Nokogiri::HTML(html)
    # this seems to be a good fingerprint
    search_elem = doc.css('a[href="https://www.mantisbt.org"], a[href="http://www.mantisbt.org"]')
    return nil unless search_elem.length > 0 && search_elem.css('img').attr('alt').try(:value).start_with?("Powered by Mantis")

    tracker_url = doc.css('link[rel=search]').attr('href').value.gsub("browser_search_plugin.php?type=text",'')

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
