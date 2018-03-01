# == Schema Information
#
# Table name: takedowns
#
#  id                :integer          not null, primary key
#  linked_account_id :integer          not null
#  created_at        :datetime
#  updated_at        :datetime
#

class Takedown < ActiveRecord::Base
  attr_accessible :linked_account
  belongs_to :linked_account, class_name: LinkedAccount::Base

  SANITIZED_HTML = "<i>[This content has been removed due to a takedown request by the author.]</i>"
  DISPLAY_NAME = "[removed]"
  ISSUE_TITLE = "[removed]"

  # in-memory cache for 5 minutes
  def self.linked_account_id_has_takedown?(id)
    if !@takedowns_cached_at || @takedowns_cached_at < 5.minutes.ago
      @takedowns_cached_at = Time.now
      @takedown_linked_account_ids = Takedown.all.pluck(:linked_account_id)
    end
    @takedown_linked_account_ids.include?(id)
  end
end
