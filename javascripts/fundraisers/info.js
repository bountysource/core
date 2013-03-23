with (scope('Info', 'Fundraiser')) {
  // Note: fundraiser identifier will either be just an ID, or and ID with a concatenated title string
  route('#fundraisers/:fundraiser_id/info', function(fundraiser_id) {
    var target_div = div({ id: 'fundraiser-info' }, 'Loading...');

    render(target_div);

    BountySource.get_fundraiser_info(fundraiser_id, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;

        var rewards_with_pledges  = [],
            remaining_rewards     = [];

        for (var i=0; i<fundraiser.rewards.length; i++) {
          if (fundraiser.rewards[i].pledges.length > 0)
            rewards_with_pledges.push(fundraiser.rewards[i]);
          else
            remaining_rewards.push(fundraiser.rewards[i]);
        }

        render({ into: target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 100)),
            'Pledges'
          ),

          Columns.create({ show_side: false }),

          Columns.main(
            response.data.rewards.length <= 0 && info_message(
              "You haven't added any rewards to your fundraiser. ",
              a({ href: fundraiser.frontend_edit_path+'/rewards' }, "Add some now!")
            ),

            rewards_with_pledges.length > 0 && [
              h3('Rewards with Pledges'),
              rewards_with_pledges.map(reward_table)
            ],

            remaining_rewards.length > 0 && [
              br,
              h3('Rewards without Pledges'),
              remaining_rewards.map(reward_table)
            ]
          ),

          Columns.side()
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('reward_table', function(reward) {
    return div({ 'class': 'reward-info' },
      div({ 'class': 'reward-description' },
        div(reward.amount == 0 ? '♡' : money(reward.amount)),
        p(reward.description)
      ),
      div({ 'class': 'pledge-table' },
        reward.fulfillment_details && div(
          h4('Fulfillment details:'),
          p(reward.fulfillment_details),
          br
        ),

        reward.pledges.length <= 0 && div(
          div({ style: 'font-style: italic;' }, 'No pledges have been made for this reward.')
        ),

        reward.pledges.length > 0 && table(
          tr(
            th('Backer'),
            th('Pledge Amount'),
            reward.fulfillment_details && th('Survey Response')
          ),

          reward.pledges.map(function(pledge) {
            return tr(
              td({ style: 'height: 30px;' },
                a({ href: pledge.person.frontend_path }, pledge.person.display_name)
              ),
              td(
                money(pledge.amount)
              ),
              reward.fulfillment_details && td({ style: 'white-space: pre-wrap; padding: 5px 0;' },
                pledge.survey_response
              )
            )
          })
        )
      )
    );
  });
}