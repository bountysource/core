class Savannah::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    true
  end

  def self.extract_info_from_url(url, html)
    return nil unless url.match(/^https?:\/\/savannah\.(non)?gnu\.org\//)

    doc = Nokogiri::HTML(html)
    return nil unless group = (doc.css('.realbody .main .topmenuitemmainitem a')[0].attr('href').match(/\A\/projects\/(.*?)\/\Z/)[1] rescue nil)

    retval = {
      tracker_url: "https://savannah.gnu.org/bugs/?group=#{group}",
      tracker_name: group,
      tracker_class: Savannah::Tracker
    }

    if url.match(/^https?:\/\/savannah\.(?:non)?gnu\.org\/bugs\/(index\.php)?\?(\d+)$/)
      number = $2.to_i
      retval.merge!(
        issue_url: "https://savannah.gnu.org/bugs/?#{number}",
        issue_number: number,
        issue_class: Savannah::Issue
      )
    end

    return retval
  end

end
