with (scope('Info', 'Fundraiser')) {
  // Note: fundraiser identifier will either be just an ID, or and ID with a concatenated title string
  route('#account/fundraisers/:fundraiser_id/info', function(fundraiser_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...')
      ),
      target_div
    );

    BountySource.get_fundraiser_pledges_overview(fundraiser_id, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;
        render({ target: 'breadcrumbs-fundraiser-title' }, fundraiser.title);
        render({ into: target_div },
          fundraiser.rewards.map(function(reward) {
            return reward_template(reward);
          })
        );
      } else {
        render({ target: 'breadcrumbs-fundraiser-title' }, 'Oh no!');
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('reward_template', function(reward) {
    var reward_element = div({class: "reward"},
      h2({class: "reward-name"}, (reward.amount ? "$" + reward.amount + " Reward: " : "No Reward:")),
      reward.description && div({style: "font-style: italic"}, reward.description),
      div({class: "reward-info"},
        span("Claimed: " + (reward.amount ? reward.claimed : reward.pledges.length)),
        (reward.limited_to ? span({style: "margin-left: 15px"}, "Limited to: " + reward.limited_to) : "")
      ),
      reward.fulfillment_details && div({class: "survey-question"}, "Fulfillment Details: " + reward.fulfillment_details),
      reward.pledges.length > 0 && table({class: "users"},
        tr(
          th("User"),
          th("Amount"),
          th("Survey Response")
        ),
        reward.pledges.map(function(pledge) {
          return tr(
            td(pledge.person.display_name),
            td('$' + pledge.amount),
            td(pledge.survey_response)
          );
        })
      )
    );
    return reward_element;
  });
}