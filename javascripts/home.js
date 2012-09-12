with (scope('Home', 'App')) {

  route('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');
    BountySource.overview(function(response) {
      var data = (response.data||{});
      render({ into: 'before-content' },
        section({ id: 'homepage' },
          div({ 'class': 'box', style: 'float: left; margin-right: 10px' },
            div({ 'class': 'inner bigbox', style: 'width: 694px; height: 250px' },
              h1(span({ style: 'font-weight: bold' }, 'Bounty'), 'Source is a funding platform for open-source bugs and features.'),
              div({ 'class': 'h1-line'}, div()),

              div({ 'class': 'devbox' },
                h2('Developers:'),
                p('Earn money by contributing to open-source.')
              ),

              div({ 'class': 'backerbox' },
                h2('Backers:'),
                p('Support the projects that have supported you.')
              ),

              div({ style: 'clear: both '}),

              div({ 'class': 'begin-box' },
                div({ style: 'margin-left: 70px; margin-right: 40px; float: left; text-align: center; '},
                  a({ 'class': 'blue', style: 'width: 200px; display: block', href: '#bounties' }, 'Browse All Projects')
                ),
                div({ style: 'font-size: 30px; line-height: 40px; float: left; padding: 0 5px'}, 'or'),

                div({ style: 'width: 330px; float: left; text-align: center'},
                  form({ action: function(form_data) { set_route('#repos/search?query='+escape(form_data.query)) } },
                    text({ name: 'query', placeholder: 'Project Name' }),
                    submit({ value: 'Search', 'class': 'green', style: 'width: 80px' })
                  )
                )
              )
            )
          ),


          div({ 'class': 'box', style: 'float: left' },
            div({ 'class': 'inner stats', style: 'width: 150px; height: 250px' },
              h2(data.total_active_issues),
              h3({ 'class': 'blue-line' }, 'Open Contest' + (data.total_active_issues == 1 ? '' : 's')),

              h2('$' + data.total_unclaimed),
              h3({ 'class': 'orange-line' }, 'Active Bounties'),

              h2('$' + data.total_paid_last_month),
              h3({ 'class': 'green-line' }, 'Payout Last Month')
            )
          ),
          div({ style: 'clear: both; padding-bottom: 10px' }),

          div({ 'class': 'box' },
            div({ 'class': 'inner leaderboard' },
              section({ style: 'width: 390px'},
                div({ style: 'text-align: center' }, img({ src: 'images/icon-info.png' })),
                h2('Staff Picks'),
                ul(
                  li(img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/bc869afa522e2f02c5a3346a9cdfb1b1.png', style: 'width: 32px; height: 32px' }), 'Badger'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'BountySource'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'TextMate'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Rails'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Node.js'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'EventMachine')
                )
              ),
              section({ style: 'width: 200px'},
                div({ style: 'text-align: center' }, img({ src: 'images/icon-check.png' })),
                h2('Top Backers'),
                ul(
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Bob'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Pat'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Sue')
                )
              ),
              section({ style: 'width: 200px; margin-right: 0'},
                div({ style: 'text-align: center' }, img({ src: 'images/icon-info.png' })),
                h2('Top Developers'),
                ul(
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Bob'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Pat'),
                  li(img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px' }), 'Sue')
                )
              ),
              div({ style: 'clear: both' })

            )
          )

        )
      );
    })
  });
}
