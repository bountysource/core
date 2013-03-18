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

    var large_percentage = div({ 'class': 'fundraiser-percentage gteq-50' }, parseInt(funding_percentage)+'%');

    var small_percentage = div({ 'class': 'fundraiser-percentage lt-50' }, parseInt(funding_percentage)+'%');

    var progress_bar_inner = div({ 'class': 'fundraiser-progress-bar-inner' }, funding_percentage >= 50 && large_percentage);
    var progress_bar_div = div({ 'class': 'fundraiser-progress-bar-outer' }, progress_bar_inner, funding_percentage< 50 && small_percentage);

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
          div(
            div(money(fundraiser.total_pledged)),
            div('pledged')
          ),

          fundraiser.in_progress && div(
            span(formatted_number(fundraiser.days_remaining || 0)),
            span('days left')
          ),

          !fundraiser.in_progress && div(
            span('Ended'),
            span(formatted_date(fundraiser.ends_at))
          )
        )
      ),

      progress_bar_div
    );
  });

  // try to support legacy cards
  define('fundraiser_card', function(fundraiser) { return card(fundraiser) });
}
