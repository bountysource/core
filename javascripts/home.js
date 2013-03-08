with (scope('Home', 'App')) {

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

        div({ id: 'card-sections-wrapper' }, 'TODO: sections for cards')
      )
    );
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
}
