class BountySourceController < ApplicationController
  before_filter :fetch_fundraiser,  only: [:fundraiser]
  before_filter :fetch_issue,       only: [:issue]
  before_filter :authenticate_full_site_password, only: [:home, :fundraiser, :issue]

  helper IssueMetaTagsHelper

  def home
    if Rails.env.development? && (request.path =~ /^\/app\// || request.path =~ /^\/assets\//)
      render text: '404 NOT FOUND', status: :not_found
    else
      render "layouts/bounty_source.html.erb", layout: false
    end
  end

  def fundraiser
    render "fundraiser.html.erb", layout: 'bounty_source.html.erb'
  end

  def issue
    render "issue.html.erb", layout: 'bounty_source.html.erb'
  end

  # this is better than "redirect {}" in routes because this includes anti-cache http headers
  def redirect_to_https
    redirect_to request.original_url.gsub(/^http:/,'https:')
  end

  # this is better than "redirect {}" in routes because this includes anti-cache http headers
  def redirect_to_www
    redirect_to Api::Application.config.www_url + request.fullpath.gsub(/^\//,'')
  end

private
  def fetch_fundraiser
    @fundraiser = Fundraiser.find_by!(id: params[:id])

    if @fundraiser.to_param != params[:id]
      redirect_to "/fundraisers/#{@fundraiser.to_param}"
    end

  rescue ActiveRecord::RecordNotFound
    # do nothing. Render the content without the meta blocks
  end

  def fetch_issue
    @issue = Issue.find_with_merge(params[:id])
    raise ActiveRecord::RecordNotFound unless @issue

    if (@issue.to_param != params[:id])
      redirect_to "/issues/#{@issue.to_param}"
    end

  rescue ActiveRecord::RecordNotFound
    # do nothing. Render the content without the meta blocks
  end

end
