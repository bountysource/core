# == Schema Information
#
# Table name: saved_search_tabs
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  query      :string(255)      not null
#  person_id  :integer          not null
#  locked     :boolean          default(FALSE)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class SavedSearchTab < ActiveRecord::Base
  attr_accessible :query, :locked, :name, :created_at
  belongs_to :person

  def self.find_user_tabs(user)
    default_tab = self.new(query: "/issues/activity", name: "Suggested Issues", created_at: Time.at(0), locked: true)
    authored_tab = self.new(query: "/issues/authored", name: "Authored", created_at: Time.at(0), locked: true)
    teams = user.teams.map do |team|
      self.new(query: "/teams/#{team.slug}/issues", name: "#{team.name}", created_at: team.created_at, locked: true)
    end

    [default_tab, authored_tab] + teams + self.where(person_id: user.id).to_a
  end

  def self.default
    tabs_input = [{query: '/teams/bountysource/issues', name: "Top Issues" }, {query: '/teams/facebook/issues', name: "Top Facebook Issues"}, {query: '/projects/356/issues', name: "Top Ruby on Rails Issues"}]

    order_index = -1
    tabs_input.map do |item|
      order_index += 1
      self.new(query: item[:query], name: item[:name], created_at: Time.at(order_index), locked: true)
    end
  end

end
