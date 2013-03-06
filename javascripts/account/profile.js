with (scope('Profile','App')) {
  define('get_href', function(person) {
    return '#users/'+person.id;
  });

  route('#users/:profile_id', function(profile_id) {
    var target_div = ('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        '...'
      ),
      target_div
    );

    BountySource.get_user_profile(profile_id, function(response) {
      if (response.meta.success) {
        var profile = response.data;

        render(
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            profile.display_name
          ),

          messages(),

          div({ id: 'profile' },
            div({ id: 'head' },
              img({ id: 'avatar-url', src: profile.image_url, style: 'width: 80px; height: 80px; vertical-align: middle;' }),
              span({ id: 'display-name', style: 'font-size: 40px; vertical-align: middle;' }, profile.display_name)
            ),

            div({ style: 'display: inline-block; width: 50%; vertical-align: top; padding: 10px;' },
              div(
                strong({ style: 'margin: 15px 0;' }, 'Joined: '), formatted_date(profile.created_at)
              ),
              profile.github_user && [
                profile.github_user.location && div({ style: 'margin: 15px 0;' },
                  strong('Location: '), span(profile.github_user.location)
                ),
                profile.github_user.company && div({ style: 'margin: 15px 0;' },
                  strong('Company: '), span(profile.github_user.company)
                ),
                profile.github_user.bio && div({ style: 'margin: 15px 0;' },
                  strong('Bio: '), span({ style: 'white-space: pre-wrap;' }, profile.github_user.bio)
                ),
                profile.github_user.followers && div({ style: 'margin: 15px 0'},
                  strong('Followers: '), formatted_number(profile.github_user.followers)
                ),
                profile.github_user.following && div({ style: 'margin: 15px 0'},
                  strong('Following: '), formatted_number(profile.github_user.following)
                )
              ]
            ),

            div({ style: 'display: inline-block; width: 45%; vertical-align: top;' },
              (profile.fundraisers.length > 0) && div({ id: 'fundraisers' },
                strong('Fundraisers Created'),
                ul(
                  profile.fundraisers.map(function(fundraiser) {
                    return li(
                      a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 120))
                    )
                  })
                )
              ),

              (profile.bounties.length > 0) && div({ id: 'bounties' },
                strong('Bounties Placed'),
                ul(
                  profile.bounties.map(function(bounty) {
                    return li(
                      a({ href: bounty.issue.frontend_path }, truncate(bounty.issue.title, 120))
                    )
                  })
                )
              )
            )
          )
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('profile_info', function(info) {
    return ul({ style: 'display: inline-block; vertical-align: middle; list-style-type: none; padding: 10px; margin-left: 15px; background: #eee; border-radius: 15px;' },
      profile_info_li('Joined: ', strong(formatted_date(info.created_at))),
      info.github_user.followers && [
        profile_info_li('Followers: ', strong(formatted_number(info.github_user.followers))),
        profile_info_li('Following: ', strong(formatted_number(info.github_user.following)))
      ]
    );
  });

  define('profile_info_li', function() {
    return li({ style: 'display: inline-block; padding: 0 15px;' }, arguments);
  })
}