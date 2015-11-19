module TeamLinkHelper
  def team_link(team, options={})
    href = team_href(team, options[:params])
    inner_html = options[:inner_html] || team.name
    %(<a href="#{href}">#{inner_html}</a>).html_safe
  end

  def team_href(team, params={})
    uri = URI.parse("#{Api::Application.config.www_url}/teams/#{team.slug}")
    uri.query = params.to_param unless params.blank?
    uri.to_s
  end
end
