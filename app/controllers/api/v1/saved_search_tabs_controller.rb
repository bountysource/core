class Api::V1::SavedSearchTabsController < ApplicationController
  before_action :find_person

  def index
    if @person
      @saved_search_tabs = SavedSearchTab.find_user_tabs(@person)
    else
      @saved_search_tabs = SavedSearchTab.default
    end
  end

  def create
    SavedSearchTab.create(person: @person, saved_search: params[:form_data], name: params[:name])
  end
end