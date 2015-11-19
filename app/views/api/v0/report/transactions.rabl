child(@transactions => :transactions) do
  extends "api/v0/transactions/partials/base"
  extends "api/v0/transactions/partials/splits"
end

node(:gross) { @transactions.sum(:gross) }
node(:processing_fee) { @transactions.sum(:processing_fee) }
node(:liability) { @transactions.sum(:liability) }
node(:bountysource_fee) { @transactions.sum(:fee) }