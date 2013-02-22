with (scope('Fundraiser', 'App')) {
  define('fundraiser_card', function(card) {
    var funding_percentage = parseFloat(100 * (card.total_pledged / card.funding_goal));

    var card_element = div({ 'class': 'card fundraiser' },
      div({ style: 'padding: 7px; background: #DFF7CB; border-radius: 3px;' },
        div({ style: 'font-size: 16px; font-weight: bold;' }, a({ href: card.href, style: 'color: #086D14;' },
          'Fundraiser: ', card.title
        ))
      ),

      card.image_url && div({ style: 'text-align: center; margin-top: 10px;' },
        img({ style: 'max-width: 100%; border-radius: 3px;', src: card.image_url })
      ),

      div({ style: 'clear: both' }),

      // title, description, and comment count
      div({ style: 'margin: 10px 5px; overflow: auto' },
        div({ style: 'color: #999;' }, card.description)
      ),

      div({ style: 'clear: both' }),

      div({ style: 'border-top: 1px solid #eee; padding-top: 10px;' },
        // fake 1% to show something on the bar
        div({ style: 'margin-bottom: 10px;' },
          progress_bar({ percentage: funding_percentage < 1 ? 1 : funding_percentage })
        ),

        div({ style: 'display: inline-block; width: 50%; vertical-align: middle;'},
          a({ href: card.href, style: 'text-decoration: none; color: inherit;' },
            span({ style: 'vertical-align: middle; font-size: 25px;' }, money(parseInt(card.total_pledged))),
            span({ style: 'font-size: 14px; margin: 3px 0 0 5px; display: block;' }, 'of ', money(card.funding_goal||0))
          )
        ),
        div({ style: 'display: inline-block; width: 50%; text-align: right; vertical-align: middle;' },
          a({ href: card.href, style: 'display: inline; padding: 5px 15px; vertical-align: middle;' }, 'Pledge!')
        )
      ),

      div({ style: 'clear: both' })
    );



    // if an href is supplied, make the card clickable
    if (card.href) {
      card.card_id = card.card_id.match(/fr(\d+)/)[1];
      card_element.addEventListener('click', curry(set_route, card.href));
    }

    return card_element;
  });
}
