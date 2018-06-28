class CryptoPayOutsQuery
  attr_reader :relation

  def initialize(relation = CryptoPayOut.all)
    @relation = relation
  end


  def filter_by_state(state = nil)
    if state == 'pending' 
      @relation = @relation.where(state: 'Pending-Approval')
    elsif state == 'processing'
      @relation = @relation.where(state: ['Seeded', 'In-Progress'])
    elsif state == 'sent'
      @relation = @relation.where(state: 'Completed')
    elsif CryptoPayOut::STATUSES.include?(state)
      @relation = @relation.where(state: state)
    end
    self
  end

  def ordered_by_latest
    @relation.order('created_at desc')
    self
  end

end