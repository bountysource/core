with (scope('Home', 'App')) {

  // local cache for cards
  define('page_state', {});

  route('#not_found', function() {
    render(
      h1("Oops! That page wasn't found!"),
      p('If you know what you were expecting, please send us an email: ', a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'))
    );
  });

  define('fundraiser_card_row_div', div({ 'class': 'card-row-wrapper', id: 'fundraiser-card-row-wrapper' }));
  define('issue_card_row_div',      div({ 'class': 'card-row-wrapper', id: 'issue-card-row-wrapper' }));

  route ('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');

    Home.top_box = div({ id: 'top-box' },
      h1('The funding platform for open-source software.'),
      h2({ style: 'margin-bottom: 0;' }, 'Improve the open-source projects you love by creating and collecting bounties!'),

      !logged_in() && a({ id: 'learn-more', 'class': 'blue', href: '#faq', style: 'display: inline-block; width: 150px;' }, "Learn More"),

      div({ style: 'clear: both;' }),
      recent_people_div
    );

    // make the box smaller if logged in
    if (logged_in()) add_class(Home.top_box, 'small');

    render({ into: 'before-content' },
      section({ id: 'homepage' },
        Home.top_box,

        fundraiser_card_row_div,
        issue_card_row_div
      )
    );

    BountySource.get_cards(page_state.query, function(response) {
      if (response.meta.success) {
        if (response.data.fundraisers) {
          render({ into: fundraiser_card_row_div },
            div({ 'class': 'card-row header' }, span('Fundraisers')),

            div({ 'class': 'card-row', id: 'fundraiser-card-row' },
              response.data.fundraisers.map(Fundraiser.card)
            )
          );
        }

        if (response.data.issues) {
          render({ into: issue_card_row_div },
            div({ 'class': 'card-row header' }, span('Issues')),

            div({ 'class': 'card-row', id: 'issue-card-row' },
              response.data.issues.map(Issue.card)
            )
          );
        }
      } else {
        throw('cards fail');
      }
    });
  });

  // render the homepage box, which always has recent signups at the bottom
  define('recent_people_div', function() {
    var recent_people_div = div({ style: 'margin-top: 10px;' });
    BountySource.recent_people(function(response) {
      // expand the top box
      add_class(Home.top_box, 'loaded');

      // if logged in, don't make the box as large
      if (logged_in()) add_class(Home.top_box, 'small');

      var recent_people = response.data;

      // show less people if signed in
      if (logged_in()) response.data.people = response.data.people.slice(0,17);

      render({ into: recent_people_div },
        div(
          !logged_in() && div({ style: 'color: #888; margin-bottom: 5px; text-align: center; font-style: italic; font-size: 14px;' },
            "Join ", formatted_number(recent_people.total_count), " others in the BountySource revolution!"
          ),
          (recent_people.people||[]).map(function(person) {
            return a({ href: person.frontend_path }, img({ 'class': 'recent-person-avatar', src: person.image_url }));
          })
        )
      );
    });

    return recent_people_div;
  });

  define('clear_cards', function() {
    // alert('clear cards');
    page_state.current_cards = [];
    page_state.can_load_more_cards = true;
    render({ into: 'column-container' },
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' })
    );
  });

  define('add_more_cards', function() {
    if (!page_state.can_load_more_cards) return;

    show('card-loader-div');
    render({ into: 'card-loader-div'}, 'Loading...');


//    _gaq.push(['_trackEvent', 'Homepage', 'Show More Cards']);

    page_state.can_load_more_cards = false;
    BountySource.get_more_cards(page_state.current_cards, page_state.query, function(response) {

      console.log(response);


      var col_container = document.getElementById('column-container');
      if (!col_container) return;

      if (response.data.length == 0) {
        render({ into: 'card-loader-div' }, 'No results. Try broadening filter');
        return;
      }

      var j, target;
      for (j=0; j < response.data.fundraisers.length; j++) {
        var fundraiser = response.data.fundraisers[j];

        page_state.current_cards.push(fundraiser.card_id);

        target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(Fundraiser.card(fundraiser));
      }

//      for (j=0; j < response.data.repositories.length; j++) {
//        var card = response.data.repositories[j];
//        page_state.current_cards.push(card.card_id);
//
//        target = col_container.childNodes[0];
//        for (var k=1; k < col_container.childNodes.length; k++) {
//          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
//        }
//
//        target.appendChild(Repository.repository_card(card));
//
//      }

      for (j=0; j < response.data.issues.length; j++) {
        var card = response.data.issues[j];
        page_state.current_cards.push(card.card_id);

        target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(Issue.issue_card(card));

      }

      hide('card-loader-div');

      // if we didn't get a full response, give up
      var card_count = response.data.fundraisers.length + response.data.issues.length;
      if (card_count >= 50) page_state.can_load_more_cards = true;
    });
  });


  define('check_scroll_to_see_if_we_need_more_cards', function() {
    if (get_route() != '#') return;

    var pageHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;
    var scrollPos = document.documentElement.scrollTop || window.pageYOffset;
    if ((pageHeight - (scrollPos + clientHeight) < 100)) add_more_cards();

    setTimeout(check_scroll_to_see_if_we_need_more_cards, 500);
  });
}
