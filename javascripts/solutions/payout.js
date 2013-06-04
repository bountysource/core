with (scope('Payout','Solution')) {

  define('page_for_solution', function(solution) {
    Payout.errors_div = div();

    // cache the solution
    Payout.solution = solution;

    // if the solution has not been accepted, render error and return
    if (solution.paid_out) {
      return div(
        h2("Woo!"),
        p("The bounty has been credited to your Bountysource account."),
        p("If you would like to cash this out, please contact us at ", a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'), ". You'll be able to do that on your own soon :)")
      )
    } else if (!solution.accepted || solution.disputed) {
      return error_message("Solution has not yet been accepted.");
    } else {
      var bounty_total = parseFloat(solution.issue.bounty_total);
      var bounty_total_pennies = bounty_total * 100;

      // calculate default donation amounts
      var eff_default = 0;
      var fsf_default = 0;
      var spi_default = 0;
      var dwb_default = 0;

      if (bounty_total >= 1) {
        var total = Math.floor();
      }

      var eff_slider = SliderWithInput.create({
        name: 'eff_donation_amount',
        min: 0,
        max: bounty_total_pennies,
        step: 1,
        value: eff_default||0
      });

      var fsf_slider = SliderWithInput.create({
        name: 'fsf_donation_amount',
        min: 0,
        max: bounty_total_pennies,
        step: 1,
        value: fsf_default||0
      });

      var spi_slider = SliderWithInput.create({
        name: 'spi_donation_amount',
        min: 0,
        max: bounty_total_pennies,
        step: 1,
        value: spi_default||0
      });

      var dwb_slider = SliderWithInput.create({
        name: 'dwb_donation_amount',
        min: 0,
        max: bounty_total_pennies,
        step: 1,
        value: dwb_default||0
      });

      var slider_group = SliderGroup.create({ min: 0, max: bounty_total_pennies },
        eff_slider,
        fsf_slider,
        spi_slider,
        dwb_slider
      );

      for (var i=0; i<slider_group.length; i++) {
        slider_group[i].addEventListener('SliderWithInputChange', function() {
         var charity_total = parseInt(this.slider_group_sum);

          if (charity_total < 0) charity_total = 0;
          if (charity_total > bounty_total_pennies) charity_total = bounty_total_pennies;

          var new_developer_cut = bounty_total_pennies - charity_total;

          if (new_developer_cut < 0) new_developer_cut = 0;
          if (new_developer_cut > bounty_total_pennies) new_developer_cut = bounty_total_pennies;

          render({ target: 'charity-total' }, money(charity_total / 100, true));
          render({ target: 'developer-cut' }, money(new_developer_cut / 100, true));
        });
      }

      return div(
        Payout.errors_div,

        form({ action: payout },
          Columns.create({ show_side: true })
        ),

        Columns.main(
          form({ 'class': 'fancy' },
            fieldset(
              p("Want to give back a little? Donate some or all of your bounty to the charities below.")
            ),

            fieldset(
              label('The Electronic Frontier Foundation'),
              eff_slider
            ),
            fieldset(
              label('Free Software Foundation'),
              fsf_slider
            ),
            fieldset(
              label('Software in the Public Interest'),
              spi_slider
            ),
            fieldset(
              label('Doctors Without Borders'),
              dwb_slider
            )
          )
        ),

        Columns.side(
          div({ id: 'solution-payout-info', style: 'margin-top: 110px;' },
            fieldset(
              label('Bounty Total:'),
              div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' }, money(bounty_total, true))
            ),

            fieldset(
              label('Charity Donations:'),
              div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' },
                span('-'),

                span({ id: 'charity-total' },
                  money(eff_default + fsf_default + spi_default + dwb_default, true)
                )
              )
            ),

            fieldset(
              label('Your Cut:'),
              div({ style: 'font-size: 20px; display: inline; vertical-align: middle;' },
                span({ id: 'developer-cut' },
                  money(bounty_total - eff_default - fsf_default - spi_default - dwb_default, true)
                )
              )
            ),

            fieldset({ style: 'text-align: center; margin-top: 30px;' },
              button({ 'class': 'button green', style: 'width: 200px;' }, 'Payout!')
            )
          )
        )
      );
    }
  });

//  route('#solutions/:solution_id/payout/receipt', function(solution_id) {
//    var target_div = div('Loading..');
//
//    render(
//      breadcrumbs(
//        a({ href: '#' }, 'Home'),
//        a({ href: '#solutions' }, 'My Solutions'),
//        span({ id: 'solution-title' }, 'Loading...')
//      ),
//      target_div
//    );
//
//    BountySource.get_solution(solution_id, function(response) {
//      if (response.meta.success) {
//        var solution = response.data;
//
//        render({ target: 'solution-title' }, truncate(solution.issue.title, 80));
//
//        // if the solution has not been accepted, render error and return
//        if (!solution.paid_out) return render({ into: target_div }, error_message("Solution has not yet been accepted."));
//
//        render({ into: target_div },
//          h2("Bounty Claimed!"),
//          p("Thanks for your contribution to open source software. ")
//        );
//      } else {
//        render({ into: target_div }, error_message(response.data.error));
//      }
//    });
//  });

  define('payout', function(form_data) {
    render({ into: Payout.errors_div }, '');

    BountySource.payout_solution(Payout.solution.id, form_data, function(response) {
      if (response.meta.success) {
        set_route(get_route());
      } else {
        render({ into: Payout.errors_div }, error_message(response.data.error));
      }
    });
  });
}