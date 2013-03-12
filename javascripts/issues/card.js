with (scope('Issue', 'App')) {

  define('card', function(issue, options) {
    options = options || {};
    options['class']  = 'card issue';
    options.href      = options.href      || issue.frontend_path;

    return a({ 'class': 'card issue', href: issue.frontend_path },
      'Issue Card'
    )
  });

//  define('card', function(fundraiser, options) {
//    options = options || {};
//    options['class']  = 'card fundraiser';
//    options.href      = options.href      || fundraiser.frontend_path;
//
//    var funding_percentage = parseFloat(100 * (fundraiser.total_pledged / fundraiser.funding_goal));
//    if (funding_percentage < 1) funding_percentage = 1;
//    if (funding_percentage > 100) funding_percentage = 100;
//
//    var image_element = div({ 'class': 'fundraiser-image' });
//    image_element.style['background-image'] = 'url(' + (fundraiser.image_url || 'images/logo.png') + ')';
//
//    var progress_bar_inner = div({ 'class': 'fundraiser-progress-bar-inner' });
//    var progress_bar_div = div({ 'class': 'fundraiser-progress-bar-outer' }, progress_bar_inner);
//
//    progress_bar_inner.style.width = funding_percentage + '%';
//
//    return a({ 'class': 'card fundraiser', href: fundraiser.frontend_path },
//      image_element,
//
//      div({ 'class': 'fundraiser-text' },
//        div({ 'class': 'fundraiser-title' }, fundraiser.title),
//        div({ 'class': 'fundraiser-author' }, 'by ', fundraiser.person.display_name),
//        div({ 'class': 'fundraiser-description' }, fundraiser.short_description)
//      ),
//
//      div({ 'class': 'fundraiser-stats' },
//        div({ 'class': 'fundraiser-data' },
//          span({ style: 'color: #00B900;' }, money(fundraiser.total_pledged)), ' raised',
//          br,
//          span({ style: 'color: #00B900;' }, formatted_number(fundraiser.days_remaining)), ' days left'
//        ),
//
//        div({ 'class': 'fundraiser-percentage' }, parseInt(funding_percentage), '%')
//      ),
//
//      progress_bar_div
//    );
//  });




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
