with (scope('Profile','App')) {
  route('#users/:display_name', function(display_name) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Users',
        display_name
      ),
      messages(),
      target_div
    );

    BountySource.get_user_profile(display_name, function(response) {
      if (response.meta.success) {
        var profile = response.data;
        render({ into: target_div },
          div({ id: 'profile' },
            div({ id: 'head' },
              img({ id: 'avatar-url', src: profile.avatar_url, style: 'width: 80px; height: 80px; vertical-align: middle;' }),
              span({ id: 'display-name', style: 'font-size: 40px; vertical-align: middle;' }, profile.display_name)
            ),

            profile.fundraisers && div({ id: 'fundraisers' },
              h2('Fundraisers Created'),
              ul(
                profile.fundraisers.map(function(fundraiser) {
                  return li(
                    a({ href: '#fundraisers/'+fundraiser.id }, abbreviated_text(fundraiser.title, 120))
                  )
                })
              )
            ),

            profile.bounties && div({ id: 'bounties' },
              h2('Bounties Placed'),
              ul(
                profile.bounties.map(function(bounty) {
                  return li(
                    a({ href: '#repos/'+bounty.issue.repository.full_name+'/issues/'+bounty.issue.number }, abbreviated_text(bounty.issue.title, 120))
                  )
                })
              )
            )
          )
        );
      } else {
        render({ target: target_div },'');
        render_message(error_message(response.data.error));
      }
    })
  });
}