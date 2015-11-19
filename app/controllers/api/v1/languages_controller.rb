class Api::V1::LanguagesController < ApplicationController
  def index
    @languages = Language.order("search_weight DESC")
  end
end
