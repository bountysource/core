with (scope('Home', 'App')) {

  route('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');

    // reset variable
    define('page_state', { can_load_more_cards: true, current_cards: [] });

    render({ into: 'before-content' },
      section({ id: 'homepage' },
        (logged_in() ? homepage_box_authed : homepage_box)(),
      
        div({ id: 'column-container' },
          div({ 'class': 'card-column' }),
          div({ 'class': 'card-column' }),
          div({ 'class': 'card-column' }),
          div({ 'class': 'card-column' })
        ),
        div({ style: 'clear: both' }),
        div({ id: 'card-loader-div' }, 'Loading...')
      )
    );

    add_more_cards();
    check_scroll_to_see_if_we_need_more_cards();
  });

  define('homepage_box', function() {
    var recent_people_div = div();
    BountySource.recent_people(function(response) {
      render({ into: recent_people_div },
        response.data.map(function(person) {
          return div({ 'class': 'recent_signups' },
            a({ href: '#users/'+person.display_name }, img({ src: person.avatar_url }))
          );
        }),
        
        div({ style: 'clear: both' })
      )
    });
    
    return div({ style: "background: #f2f3f2; border: 10px solid white; box-shadow: 0 0 5px #ccc8be; margin-bottom: 15px"},

      h1('The funding platform for open-source software.'),

      div({ style: 'text-align: center; padding: 30px 0 0 0' },
        span({ style: 'font-size: 20px; color: #888; margin-right: 20px; font-style: italic' }, 'Sign in with...'),
        a({ 'class': "btn-auth btn-github large hover", style: 'margin-right: 20px', href: Github.auth_url() }, "GitHub"),
        //a({ 'class': "btn-auth btn-facebook large", style: 'margin-right: 20px' }, "Facebook"),
        a({ 'class': "btn-auth btn-email large", style: 'margin-right: 20px', href: '#create_account' }, "Email Address")
        //div({ style: 'margin-bottom: 10px' }, a({ 'class': "btn-auth btn-google" }, "Sign in with Google"))
      ),

      div({ style: "padding: 30px 10px 10px 10px" },
        div({ style: 'color: #888; font-style: italic; margin-bottom: 5px' }, "Recently joined:"),
        recent_people_div
      ),
      div({ style: 'clear: both' })
    );
  });


  define('homepage_box_authed', function() {
    return div({ style: "background: #f2f3f2; border: 10px solid white; box-shadow: 0 0 5px #ccc8be; margin-bottom: 15px"},

      h1('The funding platform for open-source software.'),

      div({ style: 'text-align: center; padding: 30px 0 30px 0;' },
        span({ style: 'font-size: 20px; color: #888; margin-right: 20px; font-style: italic' }, 'Get started...'),
        
        button({ 'class': 'blue', style: 'width: 200px', onClick: curry(set_route, '#bounties') }, 'Browse All Bounties'),

        span({ style: 'font-size: 20px; color: #888; margin-right: 20px; font-style: italic; padding: 0 25px'}, 'or'),

        form({ style: 'display: inline', action: function(form_data) { set_route('#repos/search?query='+escape(form_data.query)) } },
          text({ name: 'query', style: 'width: 150px; line-height: 24px; padding: 0 15px; height: 40px; border: 1px solid #9dce5c;', placeholder: 'Project Name' }),
          submit({ value: 'Search', 'class': 'green', style: 'width: 80px; margin-left: 3px;' })
        )
      )
    );
  });


  define('add_more_cards', function() {
    if (!page_state.can_load_more_cards) return;

    show('card-loader-div');
    
//    _gaq.push(['_trackEvent', 'Homepage', 'Show More Cards']);

    page_state.can_load_more_cards = false;
    BountySource.get_more_cards(page_state.current_cards, function(response) {
      var col_container = document.getElementById('column-container');

      for (var j=0; j < response.data.length; j++) {
        var card = response.data[j];
        page_state.current_cards.push(card.id)

        var target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(card.funding_goal ? fundraiser_card(card) : bounty_card(card));
      }

      hide('card-loader-div');

      // if we didn't get a full response, give up
      if (response.data.length == 50) page_state.can_load_more_cards = true;
    });
  });

  define('bounty_card', function(card) {
    return div({ 'class': 'card' },
      div({ style: 'padding: 7px; background: #EEE; margin-bottom: 5px;' },
        a({ href: '#repos/' + card.repository.full_name }, img({ style: 'float: left; width: 40px; margin-bottom: 5px; margin-right: 10px; border-radius: 6px', src: card.image_url })),
        div({ style: 'margin-left: 50px; margin-top: 8px; font-size: 16px; font-weight: bold' }, a({ href: '#repos/' + card.repository.full_name, style: 'color: #333' }, card.repository.display_name)),

        div({ style: 'clear: both' }),

        // languages
        (card.repository.languages.length > 0) && div({ style: 'font-size: 12px; color: gray;' },
          'Languages: ' + card.repository.languages.map(function(l) { return l.name }).join(', ')
        )
      ),

      div({ style: 'clear: both' }),

      // title, description, and comment count
      div({ style: 'margin: 15px 5px;' },
        div({ style: '' }, a({ href: card.href, style: 'color: inherit;' }, card.title)),
        p({ style: 'color: #999; font-size: 80%; overflow: hidden;' }, abbreviated_text(card.description, 100)),
        (card.comment_count > 0) && div({ style: 'text-align: right;' },
          span({ style: 'vertical-align: middle; margin-right: 5px; color: #D8A135; font-size: 16px;' }, formatted_number(card.comment_count)),  img({ style: 'vertical-align: middle;', src: 'images/icon-comments.png' })
        )
      ),

      div({ style: 'clear: both' }),

      div({ style: 'border-top: 1px solid #eee; padding-top: 10px; padding-bottom; 5px;' },
        div({ style: 'display: inline-block; width: 50%; vertical-align: middle;'},
          (card.account_balance > 0) && div(
            span({ style: 'display: inline; vertical-align: middle; font-size: 25px;' }, money(card.account_balance))
          )
        ),
        div({ style: 'display: inline-block; width: 50%; text-align: right; vertical-align: middle;' },
          a({ href: card.href, style: 'display: inline; padding: 5px 15px; vertical-align: middle;' }, 'Back this!')
        )
      ),

      div({ style: 'clear: both' })
    );
  });

  define('fundraiser_card', function(card) {
    var funding_percentage = parseFloat(100 * (card.account_balance / card.funding_goal));

    return div({ 'class': 'card' },
      div({ style: 'padding: 7px; background: #EEE;' },
        a({ href: card.href, style: 'display: inline-block; vertical-align: middle; margin-right: 10px;' }, img({ style: 'width: 40px; border-radius: 6px', src: card.image_url })),
        div({ style: 'font-size: 16px; font-weight: bold; display: inline-block; vertical-align: middle;' }, a({ href: card.href, style: 'color: #333;' }, card.title))
      ),

      div({ style: 'clear: both' }),

      // title, description, and comment count
      div({ style: 'margin: 15px 5px;' },
        p({ style: 'color: #999; overflow: hidden;' }, card.description)
      ),

      div({ style: 'clear: both' }),

      div({ style: 'border-top: 1px solid #eee; padding-top: 10px;' },
        // fake 1% to show something on the bar
        (card.account_balance > 0) && div({ style: 'margin-bottom: 10px;' },
          progress_bar({ percentage: funding_percentage < 1 ? 1 : funding_percentage })
        ),

        div({ style: 'display: inline-block; width: 50%; vertical-align: middle;'},
          (card.account_balance > 0) && div(
            span({ style: 'vertical-align: middle; font-size: 25px;' }, money(card.account_balance)),
            span({ style: 'font-size: 14px; margin: 3px 0 0 5px; display: block;' }, 'of ', money(card.funding_goal))
          )
        ),
        div({ style: 'display: inline-block; width: 50%; text-align: right; vertical-align: middle;' },
          a({ href: card.href, style: 'display: inline; padding: 5px 15px; vertical-align: middle;' }, 'Pledge!')
        )
      ),

      div({ style: 'clear: both' })
    );
  });

//  define('card_div', function(card) {
//    return div({ 'class': 'card' },
//      div({ 'class': 'inner' },
//        card.repository ? [
//          a({ href: '#repos/' + card.repository.full_name }, img({ style: 'float: left; width: 40px; margin-bottom: 10px; margin-right: 10px; border-radius: 6px', src: card.image_url })),
//          div({ style: 'margin-left: 50px; margin-top: 8px; font-size: 16px; font-weight: bold' }, a({ href: '#repos/' + card.repository.full_name, style: 'color: #333' }, card.repository.display_name))
//        ] : [
//          a({ href: card.href }, img({ style: 'float: left; width: 40px; margin-bottom: 10px; margin-right: 10px; border-radius: 6px', src: card.image_url })),
//          div({ style: 'margin-left: 50px; margin-top: 8px; font-size: 16px; font-weight: bold' }, a({ href: card.href, style: 'color: #333' }, 'Fundraiser'))
//        ],
//        div({ style: 'clear: both' }),
//
//        div(a({ href: card.href }, card.title)),
//
//        p({ style: 'color: #999; font-size: 90%' }, abbreviated_text(card.description, 100)),
//
//        a({ href: card.href, style: 'text-decoration: none; color: black;' },
//          div({ style: "text-align: center; font-size: 24px; background: #eee; padding: 10px 0; line-height: 25px;" }, money(card.account_balance), card.funding_goal && [" of ", money(card.funding_goal)] )
//        )
//      )
//    );
//  });

  define('check_scroll_to_see_if_we_need_more_cards', function() {
    if (get_route() != '#') return;
    
    var pageHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;
    var scrollPos = document.documentElement.scrollTop || window.pageYOffset;
    if ((pageHeight - (scrollPos + clientHeight) < 100)) add_more_cards();
    
    setTimeout(check_scroll_to_see_if_we_need_more_cards, 500);
  });


  // route('#', function() {
  //   // render nothing, then hide the content for now... we're using before-content!!
  //   render('');
  //   hide('content');
  // 
  //   var default_avatar_url = 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png';
  // 
  //   var stats_container, leaderboard_container;
  //   
  //   render({ into: 'before-content' },
  //     section({ id: 'homepage' },
  // 
  //       div({ style: 'float: left; margin-right: 10px' },
  // 
  //         div({ 'class': 'box' },
  //           div({ 'class': 'inner bigbox', style: 'width: 724px; height: 100px' },
  //             h1(span({ style: 'font-weight: bold' }, 'Bounty'), 'Source is a funding platform for open-source bugs and features.'),
  //             div({ 'class': 'h1-line'}, div()),
  // 
  //             div({ 'class': 'begin-box' },
  //               div({ style: 'margin-left: 70px; margin-right: 40px; float: left; text-align: center; '},
  //                 a({ 'class': 'blue', style: 'width: 200px; display: block', href: '#bounties' }, 'Browse All Bounties')
  //               ),
  //               div({ style: 'font-size: 30px; line-height: 40px; float: left; padding: 0 5px'}, 'or'),
  // 
  //               div({ style: 'width: 330px; float: left; text-align: center'},
  //                 form({ action: function(form_data) { set_route('#repos/search?query='+escape(form_data.query)) } },
  //                   text({ name: 'query', placeholder: 'Project Name' }),
  //                   submit({ value: 'Search', 'class': 'green', style: 'width: 80px; margin-left: 3px;' })
  //                 )
  //               )
  //             )
  //           )
  //         ),
  // 
  //         div({ 'class': 'faq-box', style: 'margin-right: 10px' },
  //           div({ 'class': 'inner' },
  //             h1("BACKERS"),
  //             p("Want to help fund your favorite open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/backers' }, "Learn More")
  //           )
  //         ),
  // 
  //         div({ 'class': 'faq-box', style: 'margin-right: 10px' },
  //           div({ 'class': 'inner' },
  //             h1("DEVELOPERS"),
  //             p("Want to earn money working on open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/developers' }, "Learn More")
  //           )
  //         ),
  // 
  //         div({ 'class': 'faq-box' },
  //           div({ 'class': 'inner' },
  //             h1("COMMITTERS"),
  //             p("Are you a committer on an open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/committers' }, "Learn More")
  //           )
  //         ),
  // 
  //         div({ style: 'clear: both' })
  // 
  //         // div({ 'class': 'box', style: 'margin-top: 10px' },
  //         //   div({ 'class': 'inner bigbox', style: 'width: 694px' },
  //         // 
  //         // 
  //         //   )
  //         // )
  //       ),
  // 
  //       div({ 'class': 'box', style: 'float: right' },
  //         stats_container=div({ 'class': 'inner stats', style: 'width: 120px; height: 278px' })
  //       ),
  //       
  //       div({ style: 'clear: both; padding-bottom: 30px' }),
  // 
  //       div({ 'class': 'box' },
  //         leaderboard_container=div({ 'class': 'inner leaderboard' })
  //       )
  //     )
  //   );
  // 
  //   BountySource.overview(function(response) {
  //     var data = (response.data||{});
  //     render({ into: stats_container },
  //       h2(a({ href: '#bounties' }, money(data.total_unclaimed))),
  //       h3({ 'class': 'orange-line' }, a({ href: '#bounties' }, 'Active Bount' + (data.total_unclaimed == 1 ? 'y' : 'ies'))),
  // 
  //       h2(a({ href: '#bounties' }, formatted_number(data.total_active_issues))),
  //       h3({ 'class': 'blue-line' }, a({ href: '#bounties' }, data.total_active_issues == 1 ? 'Issue with Bounty' : 'Issues with Bounties')),
  // 
  //       h2(a({ href: '#bounties' }, formatted_number(data.total_bounties_created_this_month))),
  //       h3({ 'class': 'green-line' }, a({ href: '#bounties' }, 'Bount' + (data.total_bounties_created_this_month == 1 ? 'y' : 'ies') + ' This Month'))
  //     );
  // 
  //     render({ into: leaderboard_container }, 
  //       section({ style: 'margin-right: 30px'},
  //         h2('Featured Projects'),
  //         ul(
  //           data.projects.featured.map(function(repo) {
  //             return li(img({ src: (repo.user.avatar_url),
  //                             style: 'width: 32px; height: 32px' }),
  //               a({ href: Repository.get_href(repo), style: 'color: #222' }, repo.display_name))
  //           })
  //         )
  //       ),
  //       section({ style: 'margin-right: 30px'},
  //         h2('Featured Fundraisers'),
  //         ul(
  //           data.fundraisers.featured.map(function(fundraiser) {
  //             return li(img({ src: (fundraiser.image_url),
  //               style: 'width: 32px; height: 32px' }),
  //               a({ href: Fundraiser.get_href(fundraiser), style: 'color: #222' }, fundraiser.title))
  //           })
  //         )
  //       ),
  //       section(
  //         h2('Top Backers and Developers'),
  //         ul(
  //           data.backers.most_total_bounties.map(function(backer) {
  //             return li(img({ src: backer.avatar_url, style: 'width: 32px; height: 32px' }), backer.display_name)
  //           })
  //         )
  //       ),
  //       div({ style: 'clear: both' })
  //     );
  //   })
  // });
  
}