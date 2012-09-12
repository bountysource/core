with (scope('Home', 'App')) {

  route('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');
    
    render({ into: 'before-content' },
      section({ id: 'homepage' },
        div({ 'class': 'box', style: 'float: left; margin-right: 10px' },
          div({ 'class': 'inner bigbox', style: 'width: 694px; height: 250px' },
            h1('BountySource is a funding platform for open-source bugs and features.'),
            
            div({ 'class': 'devbox' },
              h2('Developers:'),
              p('Earn money by contributing to open-source.')
            ),

            div({ 'class': 'backerbox' },
              h2('Backers:'),
              p('Improve the projects you already use for free.')
            ),
            
            div({ style: 'clear: both '}),

            div({ 'class': 'begin-box' },
              div({ style: 'margin-left: 70px; margin-right: 40px; float: left; text-align: center; '},
                a({ 'class': 'blue', style: 'width: 200px; display: block', href: '#bounties' }, 'Browse All Projects')
              ),
              div({ style: 'font-size: 30px; line-height: 40px; float: left; padding: 0 10px'}, 'or'),

              div({ style: 'width: 330px; float: left; text-align: center; text-align: center'},
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
            h2('400'),
            h3({ 'class': 'blue-line' }, 'Open Contests'),

            h2('$2,000'),
            h3({ 'class': 'orange-line' }, 'Active Bounties'),

            h2('$4,000'),
            h3({ 'class': 'green-line' }, 'Payout Last Month')
          )
        ),
        div({ style: 'clear: both; padding-bottom: 10px' }),
        
        div({ 'class': 'box' },
          div({ 'class': 'inner leaderboard' },
            h2('More content coming soon!')
          )
        )
        
      )
    );
  });

}