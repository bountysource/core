with (scope('Profile','App')) {
  define('get_href', function(person) {
    return '#users/'+person.id;
  });

  route('#users/:profile_id', function(profile_id) {
    var target_div = ('Loading...');

    render(target_div);

    BountySource.get_user_profile(profile_id, function(response) {
      if (response.meta.success) {
        var profile = response.data;
        var activity_table = div('Loading...');

        render(
          div({ style: 'float: left; vertical-align: top; width: 25%;' },
            img({ id: 'profile-avatar', src: profile.image_url }),
            br,
            div({ style: 'font-size: 25px; margin-top: 10px; text-align: center;' }, profile.display_name),
            br,

            profile.location && p(profile.location),
            profile.public_email && p(a({ href: 'mailto:'+profile.public_email }, profile.public_email)),
            profile.url && p(a({ href: profile.url, target: '_blank' }, profile.url)),

            h4('Linked Accounts'),
            profile.github_account && div({ 'class': 'profile-linked-account' },
              a({ href: 'https://github.com/'+profile.github_account.login, target: '_blank' }, img({ src: 'images/github.png' })),
              a({ href: 'https://github.com/'+profile.github_account.login, target: '_blank' }, profile.github_account.login)
            ),

            profile.twitter_account && div({ 'class': 'profile-linked-account' },
              a({ href: 'https://twitter.com/'+profile.twitter_account.login, target: '_blank' }, img({ src: 'images/twitter.png' })),
              a({ href: 'https://twitter.com/'+profile.twitter_account.login, target: '_blank' }, profile.twitter_account.login)
            ),

            profile.facebook_account && div({ 'class': 'profile-linked-account' },
              a({ href: 'https://facebook.com/'+profile.facebook_account.login, target: '_blank' }, img({ src: 'images/facebook.png' })),
              a({ href: 'https://facebook.com/'+profile.facebook_account.login, target: '_blank' }, profile.facebook_account.login)
            ),

            profile.gittip_account && div({ 'class': 'profile-linked-account' },
              a({ href: 'https://gittip.com/'+profile.gittip_account.login, target: '_blank' }, img({ src: 'images/gittip.png' })),
              a({ href: 'https://gittip.com/'+profile.gittip_account.login, target: '_blank' }, profile.gittip_account.login)
            )
          ),

          div({ style: 'float: right; vertical-align: top; width: 70%;' },
            // Activity feed
            div({ style: 'font-size: 18px; font-weight: normal; margin-bottom: 15px;' }, 'What has ' + profile.display_name + ' been up to?'),
            activity_table
          ),

          div({ style: 'clear: both;' })
        );

        // render the activity table!
        BountySource.api('/users/'+profile_id+'/activity', function(response) {
          if (response.meta.success) {
            render({ into: activity_table },
              table(
                response.data.map(function(data) {

                  // build the body
                  var activity_content = p({ style: 'margin: 5px 0;' });

                  if (data.type == 'pledge') {
                    render({ into: activity_content },
                      span("Pledged ", money(data.amount), " to ", a({ href: data.target_path }, data.target_name)),
                      span({ style: 'color: gray; font-style: italic; font-size: 80%; margin-left: 10px;' }, time_ago_in_words(data.created_at) + ' ago')
                    );
                  } else if (data.type == 'bounty') {
                    render({ into: activity_content },
                      span("Placed a ", money(data.amount), " bounty on ", a({ href: data.target_path }, data.target_name)),
                      span({ style: 'color: gray; font-style: italic; font-size: 80%; margin-left: 10px;' }, time_ago_in_words(data.created_at) + ' ago')
                    );
                  } else if (data.type == 'tracker_plugin') {
                    render({ into: activity_content },
                      span("Installed the GitHub Plugin for ", a({ href: data.target_path }, data.target_name)),
                      span({ style: 'color: gray; font-style: italic; font-size: 80%; margin-left: 10px;' }, time_ago_in_words(data.created_at) + ' ago')
                    );
                  }

                  return tr(
                    td({ style: 'width: 25px; text-align: center;' },
                      a({ href: data.target_path },
                        img({ src: data.image_url, style: 'width: 100%; margin: 5px 0; vertical-align: middle;' })
                      )
                    ),
                    td(activity_content)
                  );
                }),

                // joined at row always present
                tr(
                  td({ style: 'width: 30px; text-align: center;' }, img({ src: 'images/bountysource-icon.png', style: 'width: 100%; vertical-align: middle;' })),
                  td(p('Joined the Bountysource family ' + formatted_date(profile.created_at)))
                )
              )
            );
          } else {
            render({ into: activity_table }, "You've reached the end of the world!");
          }
        });
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('expand_content', function(id) {
    var e = document.getElementById(id);
    is_visible(e) ? hide(e) : show(e);
  });
}