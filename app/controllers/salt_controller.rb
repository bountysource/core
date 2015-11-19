class SaltController < ApplicationController

  # http_basic_authenticate_with name: "preview", password: "", only: :render_html

  before_filter :authenticate_full_site_password, only: [:render_html]

  def render_html
    if Rails.env.development? && request.fullpath =~ /.html$/
      render text: "Template not found: #{request.fullpath}", status: :not_found
      return
    end

    if request.path =~ /^\/teams\/([^\/]+)$/
      @team = Team.where(slug: $1, accepts_public_payins: true).first
      @support_offering = @team.support_offering || @team.build_support_offering if @team
    end

    render "layouts/salt.html.erb", layout: false
  end

end
