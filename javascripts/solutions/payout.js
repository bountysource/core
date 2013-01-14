with (scope('Payout','Solutions')) {

  // landing page for code submission
  route('#solutions/:solution_id/receipt', function(solution_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...')
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        console.log(solution);

        render({ target: 'solution-title' }, solution.issue.title);

        render({ into: target_div },
          div({ 'class': 'split-main'},
            h2('Solution Submitted!'),
            p("If your solution is accepted and merged into the project, we will let you know.")
          ),

          div({ 'class': 'split-side'},
            Issue.card(solution.issue),

            div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3;' },
              ribbon_header("Links"),
              br(),
              a({ 'class': 'green', href: Issue.get_href(solution.issue) }, "Back to Issue"),
              br(),
              a({ 'class': 'green', href: '#bounties' }, "Find Another Bounty")
            ),

            div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3; text-align: center;' },
              ribbon_header('Share'),
              br(),
              Facebook.share_dialog_button(facebook_share_solution_url(solution)),
              div({ style: 'height: 20px;' }),
              Twitter.share_dialog_button(twitter_share_solution_url(solution))
            )
          ),

          div({ 'class': 'split-end'})
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('facebook_share_solution_url', function(solution) {
    return Facebook.share_dialog_url({
      link:         encode_html(BountySource.www_host+'#repos/'+solution.issue.repository.full_name+'/issues/'+solution.issue.number),
      title:        ("I submitted a solution to " + solution.issue.repository.full_name + " on BountySource."),
      description:  ("If my solution is accepted I will claim the bounty, which is currently at " + money(solution.issue.bounty_total) + ".")
    });
  });

  define('twitter_share_solution_url', function(solution) {
    return Twitter.share_dialog_url({
      url:  encode_html(BountySource.www_host+'#repos/'+solution.issue.repository.full_name+'/issues/'+solution.issue.number),
      text: ("I submitted a solution to " + solution.issue.repository.full_name + " on BountySource.")
    });
  });

  // when a solution is accepted, and no longer disputed, a link is provided to this page to, to collect payout info.
  route ('#solutions/:solution_id/payout', function(solution_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...')
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        render({ target: 'solution-title' }, solution.issue.title);

        BountySource.get_cached_user_info(function(user_info) {
          render({ into: target_div },
            div({ style: 'width: 415px; height: 160px; background: #eee; border: 1px solid #ccc; float: left; margin-right: 20px; padding: 20px' },
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Physical Check'),
              p({ style: 'font-style: italic; color #eee; text-align: center;' }, "I want BountySource to mail me a check for the bounty that I earned."),

              a({ 'class': 'blue', style: 'width: 200px; margin: 0 auto;', href: show_address_form }, 'Mail a Check')
            ),

            div({ style: 'width: 415px; height: 160px; background: #eee; border: 1px solid #ccc; float: left; padding: 20px' },
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Paypal Transfer'),
              p({ style: 'font-style: italic; color #eee; text-align: center;' }, "I want BountySource to credit my Paypal account with the bounty that I earned."),

              a({ 'class': 'blue', style: 'width: 200px; margin: 0 auto;', href: show_paypal_form }, 'Paypal')
            ),

            div({ style: 'clear: both' }),

            br(),
            messages(),

            div({ id: '_form_container', style: 'width: 892px; background: #eee; border: 1px solid #ccc; float: left; margin: auto; padding: 20px; display: none;' },
              div({ id: '_address_form', style: 'display: none;' }, Account.create_or_update_address_form(after_create_or_update_mailing_address)),
              div({ id: '_paypal_form', style: 'display: none;' },
                user_info.paypal_email && div(
                  form({ 'class': 'fancy', action: curry(set_route, get_route()+'/donation') },
                    fieldset(
                      label("Existing Account:"),
                      input({ 'class': 'long', name: 'paypal_email', value: user_info.paypal_email, readonly: true })
                    ),
                    fieldset({ 'class': 'no-label' },
                      submit({ 'class': 'green' }, "Use Existing Account")
                    )
                  ),

                  h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; font-weight: normal; margin-bottom: 10px; margin-left: 257px;' }, 'Or')
                ),

                Paypal.link_account(after_paypal_link)
              )
            ),

            div({ style: 'clear: both' })
          );
        });
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  // after collecting payout data, give the developer a chance to donate to charity and/or the project.
  // Warning: kickass (i.e. complicated) sliders ahead!
  route('#solutions/:solution_id/payout/donation', function(solution_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...'),
        'Donation'
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        render({ target: 'solution-title' }, solution.issue.title);

        var bounty_source_tax = parseFloat(solution.bounty_source_tax),
            project_tax       = parseFloat(solution.issue.repository.project_tax),
            bounty_total      = parseFloat(solution.issue.bounty_total);

        // subtract the bountysource tax from bounty_total
        bounty_total -= (bounty_source_tax * bounty_total);

        render({ into: target_div },
          form({ 'class': 'fancy', action: claim_bounty },
            fieldset({ style: 'padding: 10px 0;' },
              label('Total Bounty:'),
              div({ id: 'bounty-amount', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bounty_total))
            ),

            grey_box(
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Donations'),

              fieldset(
                label('Project:'),
                donation_slider({ 'data-tax': project_tax, style: 'width: 500px;', name: 'project' }),
                project_tax > 0 && p({ style: 'font-style: italic; font-size: 12px;' }, '*This project requires a minimum donation.')
              ),
              fieldset(
                label('Charity:'),
                donation_slider({ style: 'width: 500px;', name: 'charity' }),
                p({ style: 'font-style: italic; font-size: 12px; width: 500px;' }, "*Proceeds put into this category are all donated to our charities, which are: ", a({ href: 'https://www.eff.org/', target: '_blank' }, 'the EFF'))
              )
            ),

            fieldset({ style: 'padding: 10px 0;' },
              label('Total Donations:'),
              div({ id: 'donation-total', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money((bounty_total*project_tax) + (bounty_total*bounty_source_tax)))
            ),
            fieldset({ style: 'padding: 10px 0;' },
              label('Your Cut:'),
              div({ id: 'total-cut', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bounty_total - ((bounty_total*project_tax) + (bounty_total*bounty_source_tax))))
            ),
            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'green' }, 'Claim Bounty')
            )
          )
        );

        // group dem ranges together
        var donation_sliders = donation_slider_group({ max: bounty_total }, 'project', 'charity');

        update_font_size(document.getElementById('donation-total'), (bounty_total*project_tax) + (bounty_total*bounty_source_tax), bounty_total);
        update_font_size(document.getElementById('total-cut'), bounty_total - ((bounty_total*project_tax) + (bounty_total*bounty_source_tax)), bounty_total);

        // watch all sliders for change to update the donations field
        for (var i in donation_sliders) {
          donation_sliders[i].addEventListener('change', function(e) {
            // sum of donations
            var donation_sum = 0;
            for (var j in donation_sliders) donation_sum += parseFloat(donation_sliders[j].value);
            var total_cut = bounty_total - donation_sum;

            // update the values
            set_donation_total(donation_sum, bounty_total);
            set_total_cut(total_cut, bounty_total);

            // update the font sizes, weeeee!
            update_font_size(document.getElementById('donation-total'), donation_sum, bounty_total);
            update_font_size(document.getElementById('total-cut'), total_cut, bounty_total);
          });
        }
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('show_address_form', function() {
    show('_form_container');
    hide('_paypal_form');
    show('_address_form');
  });

  define('show_paypal_form', function() {
    show('_form_container');
    show('_paypal_form');
    hide('_address_form');
  });

  define('after_create_or_update_mailing_address', function(response) {
    clear_message();
    if (response.meta.success)
      set_route(get_route()+'/donation');
    else
      render_message(error_message(response.data.error));
  });

  define('after_paypal_link', function(response) {
    clear_message();
    if (response.meta.success)
      set_route(get_route()+'/donation');
    else
      render_message(error_message(response.data.error));
  });

  // don't go over max, nor under 0
  define('set_donation_total', function(n, max) {
    if (n < 0) n = 0;
    if (n > max) n = max;
    document.getElementById('donation-total').innerHTML = money(n, true);
  });

  // don't go over max, nor under 0
  define('set_total_cut', function(n, max) {
    if (n < 0) n = 0;
    if (n > max) n = max;
    document.getElementById('total-cut').innerHTML = money(n, true);
  });

  define('update_font_size', function(element, current, max, min_font_size, max_font_size) {
    max_font_size = max_font_size || 40;
    min_font_size = min_font_size || 20;
    element.style['font-size'] = min_font_size + ((current/max) * (max_font_size - min_font_size))+'px';
  });

  define('claim_bounty', function(form_data) {
    if (confirm('Are you sure?')) {
      console.log(form_data);
    }
  });





  /*
   * Define a group of ranges. The will all scale to the same max set in the options.
   * If you add a tax attribute to the range, it will set the min value of the range accordingly.
   *
   * NOTE: Make sure you add an element with id 'total-cut' somewhere. This will be updated the total amount
   * remaining after donations/taxes are applied.
   *
   * Options:
   * @data-tax -   A float, representing percentage of the max to set the min.
   * @max -        The max value for all ranges in the group.
   *
   * Arguments:
   * The remaining arguments are the name attributes of the ranges you want to include in the group
   * */
  define('donation_slider_group', function() {
    var arguments =         flatten_to_array(arguments),
      options =             shift_options_from_args(arguments),
      difference_element =  document.getElementById(options.difference_element_id);

    // collect all of the specified slider elements
    var all_sliders = [];
    for (var arg in arguments) all_sliders.push(document.getElementsByName(arguments[arg])[0]);

    // helper function. get all the sliders in the group except for the one specified
    var get_other_sliders = function(target_element) {
      var other_sliders = [];
      for (var slider in all_sliders) if (target_element != all_sliders[slider]) other_sliders.push(all_sliders[slider]);
      return other_sliders;
    }

    // helper function. get the sum of the min values of sliders in the group
    var sum_slider_mins = function(group) {
      var sum = 0;
      for (var i=0; i<group.length; i++) sum += parseFloat(group[i].getAttribute('min')||0);
      return sum;
    }

    // helper function. sum the values of the sliders in the group
    var sum_slider_values = function(group) {
      var sum = 0;
      for (var index in group) sum += parseFloat(group[index].value||0);
      return sum;
    }

    // helper function. adjust the difference view without showing negatives
    var set_input_value = function(n, input) { input.value = formatted_number(n > 0 ? (n > options.maxmax ? options.max : n) : 0) }

    // helper function. adjust the value of all sliders
    var adjust_slider_values = function(amount, group) {
      for (var index in group) {
        var adjusted_value = parseFloat(group[index].value) + amount;
        group[index].value = adjusted_value;
        // also need to adjust the input
        set_input_value(parseFloat(group[index].value), get_input_from_slider(group[index]));
      }
    }

    // for each slider specified
    for (var this_slider in all_sliders) {
      var this_slider = all_sliders[this_slider];

      // set min from tax attribute if present. also make initial value the taxed value, or zero.
      this_slider.setAttribute('min', (this_slider.getAttribute('data-tax')) ? (parseFloat(this_slider.getAttribute('data-tax'))*options.max) : 0);
      this_slider.setAttribute('value', this_slider.getAttribute('min'));

      // default value for the input
      get_input_from_slider(this_slider).setAttribute('value',  parseFloat(this_slider.getAttribute('value')) || 0);

      // on slider change...
      this_slider.addEventListener('change', function(e) {
        // collect the other sliders that are not this one.
        var other_sliders = get_other_sliders(e.target),
          other_slider_min_sum = sum_slider_mins(other_sliders);

        // add max now if missing, since it doesn't work to do it before (maybe it can, this is quicker though)
        if (!e.target.getAttribute('max')) e.target.setAttribute('max', (options.max - other_slider_min_sum));

        // when the this_slider changes, show the value in the input
        set_input_value(e.target.value, get_input_from_slider(e.target));

        // check this value + sum of the other sliders
        var other_sliders_total = sum_slider_values(other_sliders);

        // change the other slider values if need be
        if (parseFloat(e.target.value) + other_sliders_total > options.max) {
          // collect the other sliders with positive values
          var other_sliders_with_value = [];
          for (var i in other_sliders) {
            if (parseFloat(other_sliders[i].value) > parseFloat(other_sliders[i].min)) other_sliders_with_value.push(other_sliders[i]);
          }

          // calculate the amount to step down by on other sliders
          var amount_over = ((parseFloat(e.target.value) + other_sliders_total) - options.max);

          // adjust the other sliders by that amount
          adjust_slider_values((-1 * amount_over / (other_sliders_with_value.length)), other_sliders_with_value);
        }

        // update the sum element if it was added to the page
        if (difference_element) set_difference_element(options.max - (other_sliders_total + parseFloat(e.target.value)));
      });

      // default value for sum element
      if (difference_element) difference_element.innerHTML = money(options.max - sum_slider_values(all_sliders))
    }

    return all_sliders;
  });

  // HTML5 slider helper
  define('donation_slider', function(options) {
    var unique_bit = Math.ceil(new Date().getTime() * Math.random());

    options['id']     = '_slider-'+unique_bit;
    options['class']  = 'donation-slider';
    options['value']  = 0;
    options['step']   = 0.01;

    var dat_range = range(options),
        range_input = text({ id: '_input-'+unique_bit, style: 'width: 65px; color: #9C9999;', value: 0, readonly: true });

    return div({ style: 'display: inline-block;' },
      div({ style: 'margin-right: 5px; display: inline;' }, dat_range), span({ style: 'font-size: 25px; vertical-align: middle; padding-right: 5px;' }, '$'), range_input
    );
  });

  define('get_input_from_slider', function(slider_element) {
    return document.getElementById('_input-'+slider_element.getAttribute('id').split('-').slice(-1));
  });

  define('get_slider_from_input', function(input_element) {
    return document.getElementById('_slider-'+input_element.getAttribute('id').split('-').slice(-1));
  });
}