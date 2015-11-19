class Money
  # utility function to display whole number of currency, e.g. $10
  def display_whole_amount
    self.symbol + self.to_s.to_i.to_s
  end

  # utility function to display "dollars" & "cents", e.g. $10.50
  def display_amount
    self.symbol + self.to_s
  end
end
