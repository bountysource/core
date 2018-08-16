class Api::V1::AdSpacesController < ApplicationController
  def index
    @ad_spaces = AdSpace.where.not(position: nil)
    render "api/v1/ad_spaces/index"
  end
  
end