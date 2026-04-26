require 'bigdecimal'

class Github::BountyIntent
  AMOUNT_PATTERN = /(?:^|\s)(?:\$\+|\+\$|\$)\s*(\d+(?:\.\d{1,2})?)(?=\s|$|[[:punct:]])/

  attr_reader :amount

  def initialize(amount)
    @amount = BigDecimal(amount.to_s)
  end

  def self.extract(text)
    text.to_s.scan(AMOUNT_PATTERN).flatten.map do |amount|
      new(amount)
    end.select(&:valid?)
  end

  def self.queue_from_comment(comment_data, issue:, actor:)
    intents = extract(comment_data.try(:[], 'body'))
    return [] if intents.empty? || issue.blank? || actor.try(:person).blank?

    intents.map { |intent| intent.queue_for(actor.person, issue) }.compact
  end

  def valid?
    amount > 0
  end

  def to_cart_item(issue)
    {
      item_type: 'Bounty',
      amount: amount.to_s('F'),
      currency: 'USD',
      issue_id: issue.id,
      tweet: false
    }
  end

  def queue_for(person, issue)
    cart = person.shopping_cart
    attrs = to_cart_item(issue)
    return nil if duplicate?(cart, attrs)

    cart.add_item(attrs)
  end

  private

  def duplicate?(cart, attrs)
    cart.items.any? do |cart_item|
      item = cart_item.with_indifferent_access
      item[:item_type] == attrs[:item_type] &&
        item[:issue_id].to_i == attrs[:issue_id].to_i &&
        BigDecimal(item[:amount].to_s) == amount
    end
  end
end
