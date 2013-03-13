with (scope('Home', 'App')) {

  route('#not_found', function() {
    render(
      h1("Oops! That page wasn't found!"),
      p('If you know what you were expecting, please send us an email: ', a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'))
    );
  });

  define('cards_per_row', 4);

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
          fundraiser_cards_row,
          project_cards_row
        )
      )
    );
  });

  define('fundraiser_cards_row', function(title) {
    var fundraiser_card_row_wrapper = div({ 'class': 'card-row-wrapper', id: 'fundraiser-card-row-wrapper' });

    BountySource.get_fundraiser_cards(function(response) {
      if (response.meta.success) {
        var fundraiser_cards_row = div({ 'class': 'card-row fundraisers', id: 'fundraiser-cards-row' },
          response.data.map(function(fundraiser) { return Fundraiser.card(fundraiser) })
        );

        render({ into: fundraiser_card_row_wrapper },
          card_row_header('Featured Fundraisers', fundraiser_cards_row, {
            show_nav_buttons: response.data.length > cards_per_row
          }),
          fundraiser_cards_row
        );
      } else {
        console.log('Fundraiser cards failed to load!');
      }
    });

    return fundraiser_card_row_wrapper;
  });

  define('project_cards_row', function(title) {
    var project_cards_row_wrapper = div({ 'class': 'card-row-wrapper', id: 'project-card-row-wrapper' });

    BountySource.get_project_cards(function(response) {
      if (response.meta.success) {
        var project_cards_row = div({ 'class': 'card-row projects', id: 'project-cards-row' },
          response.data.map(function(project) { return Project.card(project) })
        );

        render({ into: project_cards_row_wrapper },
          card_row_header('Open Bounties by Project', project_cards_row, {
            show_nav_buttons: response.data.length > cards_per_row
          }),
          project_cards_row
        );
      } else {
        console.log('Project cards failed to load!');
      }
    });

    return project_cards_row_wrapper;
  });

  define('card_row_header', function(title, row_element, options) {
    options = options || {};
    options.show_nav_buttons = options.show_nav_buttons || false;

    // number of pixels to scroll to show the next 4 cards
    var scroll_amount = 992;

    var previous_button = div({ 'class': 'card-nav-button previous' }, div('<')),
        next_button     = div({ 'class': 'card-nav-button next' }, div('>'));

    var nav_button_listener = function(row_element, event) {
      var button_element = this;

      // add class that makes all cards fade to opacity 0
      add_class(row_element, 'transition');

      // set animation to let animation play before changing cards
      setTimeout(function() {
        remove_class(row_element, 'transition');

        if (has_class(button_element, 'previous')) {
          row_element.scrollLeft -= scroll_amount;
        } else if (has_class(button_element, 'next')) {
          row_element.scrollLeft += scroll_amount;
        }
      }, 100);
    };

    previous_button.addEventListener('click', curry(nav_button_listener, row_element));
    next_button.addEventListener('click',     curry(nav_button_listener, row_element));

    return div({ 'class': 'card-row header' },
      options.show_nav_buttons && previous_button,
      div({ 'class': 'card-nav-title' }, title),
      options.show_nav_buttons && next_button
    );
  });

  // render the homepage box, which always has recent signups at the bottom
  define('recent_people_div', function() {
    var recent_people_div = div({ style: 'margin-top: 10px;' });

    BountySource.recent_people(function(response) {
      if (response.meta.success) {
        // expand the top box
        add_class(Home.top_box, 'loaded');

        // if logged in, don't make the box as large
        if (logged_in()) add_class(Home.top_box, 'small');

        if (logged_in()) {
          render({ into: recent_people_div },
            div({ style: 'color: #888; margin-bottom: 5px; text-align: center; font-style: italic; font-size: 14px;' },
              "Welcome the newest " + formatted_number(response.data.total_count) + " members to our community"
            ),
            response.data.people.slice(0,17).map(function(person) {
              return a({ href: person.frontend_path }, img({ 'class': 'recent-person-avatar', src: person.image_url }));
            })
          );
        } else {
          render({ into: recent_people_div },
            div({ style: 'color: #888; margin-bottom: 5px; text-align: center; font-style: italic; font-size: 14px;' },
              "Join ", formatted_number(response.data.total_count), " others in the BountySource revolution!"
            ),
            response.data.people.map(function(person) {
              return a({ href: person.frontend_path }, img({ 'class': 'recent-person-avatar', src: person.image_url }));
            })
          );
        }
      }
    });

    return recent_people_div;
  });

}
