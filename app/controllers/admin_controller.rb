class AdminController < ApplicationController
  def home
    render "layouts/admin.html.erb", layout: false
  end
end
