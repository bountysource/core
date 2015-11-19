def create_bounty(amount, options={})
  amount  = Money.new(amount * 100, 'USD').amount
  person  = options.delete(:person) || create(:person_with_money_in_account, money_amount: amount)
  issue   = options.delete(:issue) || create(:issue)
  bs_fee  = amount * Api::Application.config.bountysource_tax
  from_personal = options.delete(:personal)

  bounty = issue.bounties.create person: person, amount: amount

  if from_personal
    Transaction.build do |tr|
      tr.description = "TEST | Create $#{Money.new(amount*100)} Bounty(#{bounty.id}) - Total: $#{amount + bs_fee} Fee: $#{bs_fee}"
      tr.splits.create([
        { amount: -amount, account: person.account },
        { amount: +amount, item: bounty },
      ])
    end
  else
    total = amount + bs_fee

    Transaction.build do |tr|
      tr.description = "TEST | Create $#{Money.new(amount*100)} Bounty(#{bounty.id}) - Total: $#{amount + bs_fee} Fee: $#{bs_fee}"
      tr.splits.create([
                         { amount: -total, account: Account::Paypal.instance },
                         { amount: +amount, item: issue },
                         { amount: +bs_fee, account: Account::BountySourceFeesBounty.instance, item: bounty }
                       ])
    end
  end

  # add on extra attributes passed through options
  bounty.update_attributes options

  issue.reload and person.reload

  # update the cached bounty total column
  issue.update_bounty_total

  bounty
end

def create_pledge(amount, options={})
  person          = options.delete(:person) || create(:person_with_money_in_account, money_amount: amount)
  fundraiser      = options.delete(:fundraiser) || create(:fundraiser)
  reward          = options.delete(:reward)
  from_personal   = options.delete(:personal)

  pledge = fundraiser.pledges.create person: person, amount: amount, reward: reward

  if from_personal
    Transaction.build do |tr|
      tr.splits.create!([
        { amount: -amount, account: person.account, item: pledge },
        { amount: +amount, item: pledge }
      ])
    end
  else
    bs_fee = amount * Api::Application.config.bountysource_tax

    Transaction.build do |tr|
      tr.splits.create!([
                          { amount: -amount, account: Account::Paypal.instance, item: pledge },
                          { amount: +(amount - bs_fee), item: pledge },
                          { amount: +bs_fee, account: Account::BountySourceFeesPledge.instance, item: pledge }
                        ])
    end
  end

  # update total pledged
  fundraiser.update_total_pledged

  # run breach check on fundraiser
  fundraiser.check_for_breach
  pledge.claim_reward

  pledge
end