with (scope('Home', 'App')) {

  // local cache for cards
  define('page_state', {});

  route('#not_found', function() {
    render(
      h1("Oops! That page wasn't found!"),
      p('If you know what you were expecting, please send us an email: ', a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'))
    );
  });

  route ('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');

    Home.top_box = div({ id: 'top-box' },
      h1('The funding platform for open-source software.'),
      h2('Improve the open-source projects you love by creating and collecting bounties!'),
      div({ style: 'clear: both;' }),
      recent_people_div
    );

    render({ into: 'before-content' },
      section({ id: 'homepage' },
        Home.top_box,

        // div({ id: 'card-sections-wrapper' }, 'TODO: sections for cards')

        div({ id: 'column-container' }),
        div({ style: 'clear: both' }),
        div({ id: 'card-loader-div' }, 'Loading...')
      )
    );

    clear_cards();
    add_more_cards();
    check_scroll_to_see_if_we_need_more_cards();
  });

  // render the homepage box, which always has recent signups at the bottom
  define('recent_people_div', function() {
    var recent_people_div = div();
    BountySource.recent_people(function(response) {
      // expand the top box
      add_class(Home.top_box, 'loaded');

      var recent_people = response.data;

      render({ into: recent_people_div },
        div({ style: "padding: 10px" },
          div({ style: 'color: #888; margin-bottom: 5px; text-align: center' }, "Join ", formatted_number(recent_people.total_count), " others in the BountySource revolution!"),

          (recent_people.people||[]).map(function(person) {
            return div({ 'class': 'round-avatar' },
              a({ href: person.frontend_path }, img({ src: person.image_url }))
            );
          }),

          div({ style: 'clear: both' })
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
      var col_container = document.getElementById('column-container');
      if (!col_container) return;

      if (response.data.length == 0) {
        render({ into: 'card-loader-div' }, 'No results. Try broadening filter');
        return;
      }

      var j, target;
      for (j=0; j < response.data.fundraisers.length; j++) {
        var card = response.data.fundraisers[j];
        page_state.current_cards.push(card.card_id);

        target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(Fundraiser.fundraiser_card(card));
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
