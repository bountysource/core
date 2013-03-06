with (scope('Issue', 'App')) {

  route('#issues/:issue_id/bounties/:bounty_id/receipt', function(issue_id, bounty_id) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_bounty(bounty_id, function(response) {
      console.log(response)
      var bounty = response.data;

      render({ into: target_div },
        breadcrumbs(
          a({ href: '#' }, 'Home'),
          a({ href: bounty.issue.tracker.frontend_path }, bounty.issue.tracker.name),
          a({ href: bounty.issue.frontend_path }, truncate(bounty.issue.title,40)),
          'Bounty Receipt'
        ),

        div({ style: 'text-align: center;' },
          h2(money(bounty.amount), " Bounty Placed"),
          h3(bounty.issue.tracker.name),
          h3('Issue #', bounty.issue.number, ' - ', bounty.issue.title),

          div(
            Facebook.create_share_button({
              link:         bounty.issue.frontend_url,
              name:         bounty.issue.tracker.name,
              caption:      money(bounty.amount)+' bounty placed on issue #'+bounty.issue.number+' - '+bounty.issue.title,
              description:  "BountySource is the funding platform for open-source software. Create a bounty to help get this issue resolved, or submit a pull request to earn the bounty yourself!",
              picture:      bounty.issue.tracker.image_url || ''
            }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

            Twitter.create_share_button({
              url:  bounty.issue.frontend_url,
              text: money(bounty.amount)+" bounty placed",
              via:  'BountySource'
            }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet')),

            // TODO fix it! --- CAB
            false && Github.issue_comment_form(bounty.issue, {
              default_text: "I placed a " + money(bounty.amount) + " bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: " + BountySource.www_host+Issue.get_href(bounty.issue)
            })
          )
        )
      );
    });
  });

}

