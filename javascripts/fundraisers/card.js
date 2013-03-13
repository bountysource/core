with (scope('Fundraiser', 'App')) {

  define('card', function(fundraiser, options) {
    options = options || {};
    options['class']  = 'card fundraiser';
    options.href      = options.href      || fundraiser.frontend_path;

    var funding_percentage = parseFloat(100 * (fundraiser.total_pledged / fundraiser.funding_goal));
    if (isNaN(funding_percentage)) {
      funding_percentage = 0;
    } else if (funding_percentage < 1) {
      funding_percentage = 1;
    }

    // allow > 100% ~=--= YOLO =--=~
    // if (funding_percentage > 100) funding_percentage = 100;

    var progress_bar_inner = div({ 'class': 'fundraiser-progress-bar-inner' });
    var progress_bar_div = div({ 'class': 'fundraiser-progress-bar-outer' }, progress_bar_inner);

    // add the percentage to progress bar, cap at 100%
    progress_bar_inner.style.width = (funding_percentage > 100 ? 100 : funding_percentage) + '%';

    return a({ 'class': 'card fundraiser', href: fundraiser.frontend_path },
      div({
        'class': 'fundraiser-image',
        style: 'background-image: url("' + (fundraiser.image_url || '/images/logo-gray.png') + '");'
      }),

      div({ 'class': 'fundraiser-text' },
        div({ 'class': 'fundraiser-title' }, fundraiser.title),
        div({ 'class': 'fundraiser-author' }, 'by ', fundraiser.person.display_name),
        div({ 'class': 'fundraiser-description' }, fundraiser.short_description)
      ),

      div({ 'class': 'fundraiser-stats' },
        div({ 'class': 'fundraiser-data' },
          span({ style: 'color: #00B900; font-size: 16px;' }, money(fundraiser.total_pledged)), ' raised',
          br,
          span({ style: 'color: #00B900; font-size: 16px;' }, formatted_number(fundraiser.days_remaining || 0)), ' days left'
        ),

        div({ 'class': 'fundraiser-percentage' }, parseInt(funding_percentage), '%')
      ),

      progress_bar_div
    );
  });

  // try to support legacy cards
  define('fundraiser_card', function(fundraiser) { return card(fundraiser) });
}
