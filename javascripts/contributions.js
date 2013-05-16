with (scope('Contributions', 'App')) {
  before_filter(require_login);

  route('#contributions', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Contributions'
      ),
      target_div
    );

    Bountysource.get_contributions(function(response) {

      if (response.meta.success) {
        var bounties  = response.data.bounties,
            pledges   = response.data.pledges;

        render({ into: target_div },
          pledges.length > 0 && section({ id: 'pledges-table' },
            h2("Fundraiser Pledges"),
            table(
              tr(
                th(),
                th({ style: 'width: 300px;' }, 'Fundraiser'),
                th('Pledge Amount'),
                th('Date'),
                th({ style: 'width: 175px; text-align: center;' })
              ),

              pledges.map(function(pledge) {
                return tr({ 'class': 'contributions-table row pledge', style: 'height: 75px;', onClick: curry(set_route, pledge.frontend_path) },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: pledge.fundraiser.image_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: pledge.fundraiser.frontend_path }, pledge.fundraiser.title)),
                  td(money(pledge.amount)),
                  td(formatted_date(pledge.created_at)),
                  td({ style: 'width: 175px; text-align: center;' }, Fundraiser.pledge_status_element(pledge))
                )
              })
            )
          ),

          bounties.length > 0 && section({ id: 'bounties-table' },
            h2("Bounties"),
            table(
              tr(
                th(),
                th('Project'),
                th({ style: 'width: 260px;' }, 'Issue'),
                th({ style: 'text-align: center;' }, 'Issue Status'),
                th('Bounty Amount'),
                th('Date')
              ),

              bounties.map(function(bounty) {
                return tr({ style: 'height: 75px;' },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: bounty.issue.tracker.image_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: Repository.get_href(bounty.issue.tracker) }, bounty.issue.tracker.name)),
                  td(a({ href: Issue.get_href(bounty.issue) }, bounty.issue.title )),
                  td({ style: 'text-align: center;' }, Issue.status_element(bounty.issue)),
                  td(money(bounty.amount)),
                  td(formatted_date(bounty.created_at))
                )
              })
            )
          )
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

}