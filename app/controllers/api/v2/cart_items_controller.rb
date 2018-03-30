class Api::V2::CartItemsController < Api::BaseController

  include Api::V2::CartItemsHelper

  before_action :require_cart

  def create
    # If person logged in, make them the default item owner
    if current_user
      params[:owner_id]   = current_user.id
      params[:owner_type] = current_user.class.name
    end

    item = @cart.item_from_attributes(params.to_unsafe_h)
    authorize!(:add_proposal_to_cart, item) if item.is_a?(Proposal)

    @item = @cart.add_item(params.to_unsafe_h)
    @owner = @item.try(:owner)

    render 'api/v2/cart_items/show'
  end

  def update
    index = params[:id].to_i
    item = @cart.item_from_attributes(@cart.items[index])
    raise CanCan::AccessDenied if item.is_a?(Proposal)
    # authorize!(:modify_proposal, item) if item.is_a?(Proposal)

    @item = @cart.update_item(index, params.to_unsafe_h)

    render 'api/v2/cart_items/show'
  end

  def destroy
    index = params[:id].to_i

    @cart.remove_item(index)

    head :no_content
  end

private

  def require_cart
    @cart = ::ShoppingCart.find_by!(uid: params[:uid])
  end

end
