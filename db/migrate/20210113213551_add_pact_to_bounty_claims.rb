class AddPactToBountyClaims < ActiveRecord::Migration[5.1]
  def change
    add_reference :bounty_claims, :pact, foreign_key: true

    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE bounty_claims
            ALTER COLUMN issue_id DROP NOT NULL;

          ALTER TABLE bounty_claims
            ADD CONSTRAINT issue_or_pact_notnull
              CHECK (NOT (issue_id IS NULL AND pact_id IS NULL));
        SQL
      end

      dir.down do
        execute <<-SQL
          ALTER TABLE bounty_claims
            DROP CONSTRAINT issue_or_pact_notnull;

          ALTER TABLE bounty_claims
            ALTER COLUMN issue_id SET NOT NULL;
        SQL
      end
    end
  end
end
