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

    BountySource.get_contributions(function(response) {

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
                th({ style: 'width: 175px; text-align: center;' }),
                th({ style: 'width: 100px; text-align: center;' })
              ),

              pledges.map(function(pledge) {
                return tr({ 'class': 'contributions-table row pledge', style: 'height: 75px;', onClick: curry(set_route, pledge.frontend_path) },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: pledge.fundraiser.image_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: pledge.fundraiser.frontend_path }, pledge.fundraiser.title)),
                  td(money(pledge.amount)),
                  td(formatted_date(pledge.created_at)),
                  td({ style: 'width: 175px; text-align: center;' }, Fundraiser.pledge_status_element(pledge)),
                  td({ style: 'text-align: center;' }, publicize_pledge_button(pledge))
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
                th('Date'),
                th({ style: 'width: 100px; text-align: center;' })
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
                  td(formatted_date(bounty.created_at)),
                  td({ style: 'width: 100px; text-align: center;' }, publicize_bounty_button(bounty))
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


  /*
   * Publicize Pledge button stuff
   * */

  define('publicize_pledge_button', function(pledge) {
    var container_div = div({ style: 'display: inline-block; vertical-align: top;', id: 'publicize-pledge-button-container-'+pledge.id });
    if (pledge.anonymous) {
      render({ into: container_div }, publicize_pledge_link_element(pledge));
    } else {
      render({ into: container_div }, unpublicize_pledge_link_element(pledge));
    }
    return container_div;
  });

  define('publicize_pledge_link_element', function(pledge) {
    return a({
      href: curry(publicize_pledge, pledge),
      style: 'display: inline-block; vertical-align: middle; padding: 0; width: 80px; font-size: 12px; text-decoration: none;',
      'class': 'button grey'
    }, 'Public');
  });

  define('unpublicize_pledge_link_element', function(pledge) {
    return a({
      href: curry(unpublicize_pledge, pledge),
      style: 'display: inline-block; vertical-align: middle; padding: 0; width: 80px; font-size: 12px; text-decoration: none;',
      'class': 'button green'
    }, 'Public');
  });

  define('publicize_pledge', function(pledge) {
    BountySource.api('/user/pledges/'+pledge.id, 'PUT', { anonymous: 0 }, function(response) {
      if (response.meta.success) {
        render({ target: 'publicize-pledge-button-container-'+pledge.id }, unpublicize_pledge_link_element(pledge));
      }
    });
  });

  define('unpublicize_pledge', function(pledge) {
    BountySource.api('/user/pledges/'+pledge.id, 'PUT', { anonymous: 1 }, function(response) {
      if (response.meta.success) {
        render({ target: 'publicize-pledge-button-container-'+pledge.id }, publicize_pledge_link_element(pledge));
      }
    });
  });

  /*
  * Publicize Bounty button stuff
  * */

  define('publicize_bounty_button', function(bounty) {
    var container_div = div({ style: 'display: inline-block; vertical-align: top;', id: 'publicize-bounty-button-container-'+bounty.id });
    if (bounty.anonymous) {
      render({ into: container_div }, publicize_bounty_link_element(bounty));
    } else {
      render({ into: container_div }, unpublicize_bounty_link_element(bounty));
    }
    return container_div;
  });

  define('publicize_bounty_link_element', function(bounty) {
    return a({
      href: curry(publicize_bounty, bounty),
      style: 'display: inline-block; vertical-align: middle; padding: 0; width: 80px; font-size: 12px; text-decoration: none;',
      'class': 'button grey'
    }, 'Public');
  });

  define('unpublicize_bounty_link_element', function(bounty) {
    return a({
      href: curry(unpublicize_bounty, bounty),
      style: 'display: inline-block; vertical-align: middle; padding: 0; width: 80px; font-size: 12px; text-decoration: none;',
      'class': 'button green'
    }, 'Public');
  });

  define('publicize_bounty', function(bounty) {
    BountySource.api('/user/bounties/'+bounty.id, 'PUT', { anonymous: 0 }, function(response) {
      if (response.meta.success) {
        render({ target: 'publicize-bounty-button-container-'+bounty.id }, unpublicize_bounty_link_element(bounty));
      }
    });
  });

  define('unpublicize_bounty', function(bounty) {
    BountySource.api('/user/bounties/'+bounty.id, 'PUT', { anonymous: 1 }, function(response) {
      if (response.meta.success) {
        render({ target: 'publicize-bounty-button-container-'+bounty.id }, publicize_bounty_link_element(bounty));
      }
    });
  });


}