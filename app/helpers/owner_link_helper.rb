module OwnerLinkHelper
  def owner_link(item, options={})
    href = owner_href(item.owner, options[:params])
    inner_html = options[:inner_html] || item.owner_display_name
    %(<a href="#{href}">#{inner_html}</a>).html_safe
  end

  def owner_href(owner, params={})
    base = case owner
    when Person then "#{Api::Application.config.www_url}people/#{owner.to_param}"
    when Team then "#{Api::Application.config.www_url}teams/#{owner.slug}"
    else ""
    end

    uri = URI.parse(base)
    uri.query = params.to_param unless params.blank?
    uri.to_s
  end
end
