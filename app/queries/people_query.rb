class PeopleQuery
  attr_reader :relation

  def initialize(relation = Person.all)
    @relation = relation
  end

  def inactive_since(datetime)
    scoped = relation
      .joins(account: {splits: :txn})
      .where.not(transactions: {type: 'Transaction::InternalTransfer::InactivityFee'})
      .select('people.id, people.email, sum(splits.amount) as balance')
      .group('people.id')
      .having('sum(splits.amount) > 0')
      .having('max(splits.created_at) < ?', datetime)
    scoped
  end
end