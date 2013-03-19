with (scope('Fundraiser', 'App')) {

  define('card', function(fundraiser, options) {
    options = options || {};
    options['class']  = 'card fundraiser';
    options.href      = options.href      || fundraiser.frontend_path;

    /*
    * Progress bar calculations and element creation
    * */
    var funding_percentage = parseFloat(100 * (fundraiser.total_pledged / fundraiser.funding_goal));
    if (isNaN(funding_percentage)) {
      funding_percentage = 0;
    } else if (funding_percentage < 1) {
      funding_percentage = 1;
    }
    var large_percentage  = div({ 'class': 'fundraiser-percentage gteq-50' }, parseInt(funding_percentage)+'%');
    var small_percentage  = div({ 'class': 'fundraiser-percentage lt-50' }, parseInt(funding_percentage)+'%');
    var progress_bar_inner = div({ 'class': 'fundraiser-progress-bar-inner' }, funding_percentage >= 50 && large_percentage);
    var progress_bar_div = div({ 'class': 'fundraiser-progress-bar-outer' }, progress_bar_inner, funding_percentage < 50 && small_percentage);

    /*
     * Add the percentage to progress bar, cap at 100%
     * */
    progress_bar_inner.style.width = (funding_percentage > 100 ? 100 : funding_percentage) + '%';

    /*
    * If fundraiser over, render end date into progress bar
    * */
    if (fundraiser.published && !fundraiser.in_progress) {
      render({ into: progress_bar_div },
        div({ 'class': 'fundraiser-ended-at-message' }, 'Completed ' + formatted_date(fundraiser.ends_at))
      );
    }

    /*
    * Show hours and minutes left if days left is 0
    * */
    var time_left       = fundraiser.days_remaining,
        time_left_words = 'day' + (time_left == 1 ? '' : 's') + ' left';
    // calculate hours left, if necessary
    if (time_left <= 0) {
      time_left       = hours_and_minutes_from(fundraiser.ends_at);

      // first, add the minutes
      time_left_words = time_left.minutes + ' min' + (time_left.minutes != 1 && 's') + ' left';

      // if hours > 0, add hours
      if (time_left.hours > 0) {
        time_left_words = time_left.hours + ' hr' + (time_left.hours != 1 && 's') + ' ' + time_left_words;
      }
    }

    return a({ 'class': 'card fundraiser', href: fundraiser.frontend_path },
      div({ 'class': 'fundraiser-image', style: 'background-image: url("' + (fundraiser.image_url || '/images/logo-gray.png') + '");'},
        (fundraiser.published && !fundraiser.in_progress && (fundraiser.total_pledged >= fundraiser.funding_goal)) && div({ 'class': 'funded-message' }, 'Completed!')
      ),

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

          (fundraiser.in_progress || !fundraiser.published) && div(
            span(time_left_words)
          ),

          (!fundraiser.in_progress && fundraiser.published) && div(
            span(parseInt(funding_percentage)+'%'),
            span('funded')
          )
        )
      ),

      progress_bar_div
    );
  });

  /*
  * Try to support legacy cards if they are still around or introduced
  * */
  define('fundraiser_card', function(fundraiser) { return card(fundraiser) });
}
