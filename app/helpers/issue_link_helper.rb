module IssueLinkHelper
  def issue_link(issue, options={})
    href = issue_href(issue, options[:params])
    inner_html = options[:inner_html] || issue.title
    %(<a href="#{href}">#{inner_html}</a>).html_safe
  end

  def issue_href(issue, params={})
    uri = URI.parse("#{Api::Application.config.www_url}issues/#{issue.to_param}")
    uri.query = params.to_param unless params.blank?
    uri.to_s
  end
end