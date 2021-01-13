class AddPactToBountyClaims < ActiveRecord::Migration[5.1]
  def change
    add_reference :bounty_claims, :pact, foreign_key: true
  end
end
