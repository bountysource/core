class Api::V0::BountyClaims::ForceCollectsController < Api::V0::BaseController

  def create
    @bounty_claim = BountyClaim.find(params[:bounty_claim_id])

    @bounty_claim.collect!

    head :ok
  end
end