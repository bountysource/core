class Api::V1::InfoSpacesController < ApplicationController
  def index
    @ad_spaces = AdSpace.where.not(position: nil)
    render "api/v1/ad_spaces/index"
  end
end