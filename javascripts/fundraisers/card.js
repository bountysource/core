with (scope('Fundraiser', 'App')) {

  define('card', function(fundraiser) {
    var funding_percentage = parseFloat(100 * (fundraiser.total_pledged / fundraiser.funding_goal));
    if (funding_percentage < 1) funding_percentage = 1;
    if (funding_percentage > 100) funding_percentage = 100;

    var image_element = div({ 'class': 'fundraiser-image' });
    image_element.style['background-image'] = 'url(' + (fundraiser.image_url || 'images/logo.png') + ')';

    var progress_bar_inner = div({ 'class': 'fundraiser-progress-bar-inner' });
    var progress_bar_div = div({ 'class': 'fundraiser-progress-bar-outer' }, progress_bar_inner);

    progress_bar_inner.style.width = funding_percentage + '%';

    return a({ 'class': 'card fundraiser', href: fundraiser.frontend_path },
      image_element,

      div({ 'class': 'fundraiser-text' },
        div({ 'class': 'fundraiser-title' }, fundraiser.title),
        div({ 'class': 'fundraiser-author' }, 'by ', a({ href: fundraiser.person.frontend_path }, fundraiser.person.display_name)),
        div({ 'class': 'fundraiser-description' }, fundraiser.short_description)
      ),

      div({ 'class': 'fundraiser-stats' },
        div({ 'class': 'fundraiser-data' },
          span({ style: 'color: #00DB00' }, money(fundraiser.total_pledged)), ' raised',
          br,
          span({ style: 'color: #00DB00' }, formatted_number(fundraiser.days_remaining)), ' days left'
        ),

        div({ 'class': 'fundraiser-percentage' },
          span(parseInt(funding_percentage)),
          span('%')
        )
      ),

      progress_bar_div
    );
  });


  define('fundraiser_card', function(card) {
    var funding_percentage = parseFloat(100 * (card.total_pledged / card.funding_goal));

    var card_element = div({ 'class': 'card fundraiser', onClick: curry(set_route, card.frontend_path) },
      div({ style: 'padding: 7px; background: #DFF7CB; border-radius: 3px;' },
        div({ style: 'font-size: 16px; font-weight: bold;' }, a({ href: card.frontend_path, style: 'color: #086D14;' },
          'Fundraiser: ', card.title
        ))
      ),

      card.image_url && div({ style: 'text-align: center; margin-top: 10px;' },
        img({ style: 'max-width: 100%; border-radius: 3px;', src: card.image_url })
      ),

      div({ style: 'clear: both' }),

      // title, description, and comment count
      div({ style: 'margin: 10px 5px; overflow: auto' },
        div({ style: 'color: #999;' }, card.short_description)
      ),

      div({ style: 'clear: both' }),

      div({ style: 'border-top: 1px solid #eee; padding-top: 10px;' },
        // fake 1% to show something on the bar
        div({ style: 'margin-bottom: 10px;' },
          progress_bar({ percentage: funding_percentage < 1 ? 1 : funding_percentage })
        ),

        div({ style: 'display: inline-block; width: 50%; vertical-align: middle;'},
          a({ href: card.frontend_path, style: 'text-decoration: none; color: inherit;' },
            span({ style: 'vertical-align: middle; font-size: 25px;' }, money(parseInt(card.total_pledged))),
            span({ style: 'font-size: 14px; margin: 3px 0 0 5px; display: block;' }, 'of ', money(card.funding_goal||0))
          )
        ),
        div({ style: 'display: inline-block; width: 50%; text-align: right; vertical-align: middle;' },
          a({ href: card.frontend_path, style: 'display: inline; padding: 5px 15px; vertical-align: middle;' }, 'Pledge!')
        )
      ),

      div({ style: 'clear: both' })
    );

    return card_element;
  });
}
