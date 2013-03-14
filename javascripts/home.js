with (scope('Home', 'App')) {

  route('#not_found', function() {
    render(
      h1("Oops! That page wasn't found!"),
      p('If you know what you were expecting, please send us an email: ', a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'))
    );
  });

  define('cards_per_page', 4);
  define('fundraiser_cards_container',        div({ 'class': 'card-row-wrapper' }));
  define('featured_projects_cards_container', div({ 'class': 'card-row-wrapper' }));
  define('all_projects_cards_container',      div({ 'class': 'card-row-wrapper' }));

  route('#', function() {
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

        div({ id: 'card-rows-container' },
          fundraiser_cards_container,
          featured_projects_cards_container,
          all_projects_cards_container
        )
      )
    );

    // get all fundraiser cards, render them
    BountySource.get_fundraiser_cards(function(response) {
      if (response.meta.success) {
        var fundraisers = response.data;

        render({ into: fundraiser_cards_container },
          cards_row('Featured Fundraisers', fundraisers, Fundraiser.card)
        );
      }
    });

    // get all tracker cards, render them
    BountySource.get_project_cards(function(response) {
      if (response.meta.success) {
        var featured_projects = response.data.featured_trackers,
            all_projects      = response.data.all_trackers;

        console.log('featured_projects', featured_projects);
        console.log('all_projects', all_projects);

        if (featured_projects && featured_projects.length > 0) {
          render({ into: featured_projects_cards_container },
            cards_row('Featured Projects', featured_projects, Project.card)
          );
        }

        if (all_projects && all_projects.length > 0) {
          render({ into: all_projects_cards_container },
            cards_row('Open Bounties by Project', all_projects, Project.card)
          );
        }
      }
    });
  });

  define('cards_row', function(title, cards_data, card_template_method) {
    var cards_row = div({ 'class': 'card-row', id: 'fundraiser-cards-row' },
      cards_data.map(function(card) { return card_template_method(card) })
    );

    // need to insert blank cards to fill space?
    if (cards_data.length % cards_per_page != 0) {
      // build a fake card, get its width
      var placeholder = div({ style: 'width: 238px;' });
      for (var i=0; i<(cards_per_page - cards_data.length % cards_per_page); i++) {
        cards_row.appendChild(div({ 'class': 'card', style: 'opacity: 0; margin-right: 10px; height: 0;' }));
      }
    }

    // add pagination data to row element
    cards_row['data-page-count'] = Math.ceil(cards_data.length / cards_per_page);
    cards_row['data-page-index'] = 0;

    return [
      card_row_header(title, cards_row, { show_nav_buttons: cards_data.length > cards_per_page }),
      cards_row
    ];
  });

  define('card_row_header', function(title, row_element, options) {
    options = options || {};
    options.show_nav_buttons = options.show_nav_buttons || false;

    var previous_button = div({ 'class': 'card-nav-button previous disabled' }, div('←')),
        next_button     = div({ 'class': 'card-nav-button next' }, div('→'));

    previous_button.addEventListener('click', curry(card_nav_button_listener, row_element, next_button));
    next_button.addEventListener('click',     curry(card_nav_button_listener, row_element, previous_button));

    return div({ 'class': 'card-row header' },
      options.show_nav_buttons && previous_button,
      div({ 'class': 'card-nav-title' }, title),
      options.show_nav_buttons && next_button
    );
  });

  define('card_nav_button_listener', function(row_element, other_button, event) {
    var button_element  = this,
        scroll_amount   = 992,
        num_pages       = parseInt(row_element['data-page-count']),
        page_index      = parseInt(row_element['data-page-index']);

    if (!has_class(button_element, 'disabled')) {
      add_class(row_element, 'transition');

      if (has_class(button_element, 'previous') && (page_index - 1) >= 0) {
        remove_class(other_button, 'disabled');

        setTimeout(function() {
          remove_class(row_element, 'transition');

          row_element.scrollLeft -= scroll_amount;
          page_index -= 1;

          if (page_index == 0) add_class(button_element, 'disabled');

          // assign the variables back to the row element
          row_element['data-page-index'] = page_index;
        }, 100);
      } else if (has_class(button_element, 'next') && (page_index + 1) <= num_pages) {
        remove_class(other_button, 'disabled');

        setTimeout(function() {
          remove_class(row_element, 'transition');

          // adjust page index
          row_element.scrollLeft += scroll_amount;
          page_index += 1;

          if (page_index == (num_pages - 1)) add_class(button_element, 'disabled');

          // assign the variables back to the row element
          row_element['data-page-index'] = page_index;
        }, 100);
      } else {
        remove_class(row_element, 'transition');
      }
    }
  });

  // render the homepage box, which always has recent signups at the bottom
  define('recent_people_div', function() {
    var recent_people_div = div({ style: 'margin-top: 10px;' });

    BountySource.recent_people(function(response) {
      if (response.meta.success) {
        // expand the top box
        add_class(Home.top_box, 'loaded');

        // if logged in, don't make the box as large
        if (logged_in()) {
          add_class(Home.top_box, 'small');
          response.data.people = response.data.people.slice(0,17);
        };

        render({ into: recent_people_div },
          div({ style: 'color: #888; margin-bottom: 5px; text-align: center; font-style: italic; font-size: 14px;' },
            "Welcome the newest of our " + formatted_number(response.data.total_count) + " members:"
          ),
          response.data.people.map(function(person) {
            return a({ href: person.frontend_path }, img({ 'class': 'recent-person-avatar', src: person.image_url }));
          })
        );
      }
    });

    return recent_people_div;
  });

}
