module TrackerLinkHelper
  def tracker_link(tracker, options={})
    href = tracker_href(tracker, options[:params])
    inner_html = options[:inner_html] || tracker.display_name
    %(<a href="#{href}">#{inner_html}</a>).html_safe
  end

  def tracker_href(tracker, params={})
    uri = URI.parse("#{Api::Application.config.www_url}trackers/#{tracker.to_param}")
    uri.query = params.to_param unless params.blank?
    uri.to_s
  end
end