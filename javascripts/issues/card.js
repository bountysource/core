with (scope('Issue', 'App')) {

  define('issue_card', function(card) {
    return div({ 'class': 'card', onClick: curry(set_route, card.frontend_path) },
      div({ style: 'padding: 7px; background: #EEE; margin-bottom: 5px;' },
        a({ href: card.tracker.frontend_path}, img({ style: 'float: left; width: 40px; margin-bottom: 5px; margin-right: 10px; border-radius: 6px', src: card.tracker.image_url })),
        div({ style: 'margin-left: 50px; margin-top: 8px; font-size: 16px; font-weight: bold' }, a({ href: card.tracker.frontend_path, style: 'color: #333' }, card.tracker.name)),

        div({ style: 'clear: both' }),

        // languages
        card.tracker.languages && (card.tracker.languages.length > 0) && div({ style: 'font-size: 12px; color: gray;' },
          'Languages: ' + card.tracker.languages.map(function(l) { return l.name }).join(', ')
        )
      ),

      div({ style: 'clear: both' }),

      // title, description, and comment count
      div({ style: 'margin: 15px 5px; overflow: auto' },
        div({ style: '' }, a({ href: card.href, style: 'color: inherit; overflow: hidden;' }, card.title)),
        p({ style: 'color: #999; font-size: 80%;' },
          card.short_body
        )
      ),

      div({ style: 'clear: both' }),

      div({ style: 'border-top: 1px solid #eee; padding-top: 10px; padding-bottom; 5px; font-size: 16px;' },
        div({ style: 'display: inline-block; width: 33%; vertical-align: middle;'},
          (card.bounty_total > 0) && div(
            a({ href: card.href, style: 'display: inline; vertical-align: middle; text-decoration: none; color: #48B848;' }, money(card.bounty_total))
          )
        ),

        div({ style: 'display: inline-block; width: 33%; vertical-align: middle;' },
          (card.comment_count > 0) && div(
            a({ href: card.href, style: 'vertical-align: middle; color: #D8A135; text-decoration: none;' },
              span({ style: 'vertical-align: middle; margin-right: 5px;' }, formatted_number(card.comment_count)),
              img({ style: 'vertical-align: middle;', src: 'images/icon-comments.png' })
            )
          )
        ),
        div({ style: 'display: inline-block; width: 33%; text-align: right; vertical-align: middle;' },
          a({ href: card.href, style: 'display: inline; vertical-align: middle; color: inherit;' }, 'Back this!')
        )
      ),

      div({ style: 'clear: both' })
    );
  });

}
