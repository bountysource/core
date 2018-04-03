class Api::V1::PostbacksController < ApplicationController

  def create
    Postback.create(
      namespace: params[:namespace],
      method: request.method,
      url: request.url,
      raw_post: request.raw_post,
      headers: request.headers.select { |k,v| k =~ /^HTTP_/ }.to_json
    )
    head :ok
  end

  def retrieve
    postbacks = Postback.find_all_by_namespace(params[:namespace])

    json_output = postbacks.map do |postback|
      {
        method: postback.method,
        url: postback.url,
        raw_post: postback.raw_post,
        headers: JSON.parse(postback.headers)
      }
    end

    postbacks.map(&:destroy) if params[:clear]

    render json: json_output.to_json
  end

end
