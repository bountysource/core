class PhpTracker::API < Tracker::RemoteAPI

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    if matches = url.match(/^https:\/\/bugs\.php\.net\/bug\.php\?id=(\d+)/)
      number = $1.to_i
      {
        issue_url: "https://bugs.php.net/bug.php?id=#{number}",
        issue_number: number,
        issue_class: PhpTracker::Issue,
        tracker_url: "https://bugs.php.net/",
        tracker_name: "PHP",
        tracker_class: PhpTracker::Tracker
      }
    elsif matches = url.match(/^https:\/\/bugs\.php\.net\/bug\.php\?id=(\d+)/)
      {
        tracker_url: "https://bugs.php.net/",
        tracker_name: "PHP",
        tracker_class: PhpTracker::Tracker
      }
    end
  end

end
