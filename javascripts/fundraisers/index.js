with (scope('Index', 'Fundraiser')) {
  route('#account/fundraisers', function() {
    var fundraisers_table = div('Loading...');

    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        'Fundraisers'
      ),
      fundraisers_table
    );

    BountySource.get_fundraisers(function(response) {
      if (response.data.length > 0) {

        render({ into: fundraisers_table },
          messages(),

          table(
            tr(
              th('Title'),
              th({ style: 'width: 130px;' }, 'Funding Goal'),
              th({ style: 'width: 200px;' }, 'Progress'),
              th({ style: 'width: 80px; text-align: center;' }, 'Status'),
              th({ style: 'width: 75px;' })
            ),
            response.data.map(function(fundraiser) {
              // depends on whether or not it's published
              return tr({ style: 'height: 40px;' },
                td(a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 100))),
                td(money(fundraiser.funding_goal || 0)),
                td(fundraiser.published && percentage((fundraiser.total_pledged / fundraiser.funding_goal) * 100)),
                td({ style: 'text-align: center;' }, fundraiser_published_status(fundraiser)),

                td({ style: 'text-align: center;' },
                  a({ href: fundraiser.frontend_edit_path+'/basic-info' }, img({ src: 'images/edit.gif' })),

                  // TODO: info page for fundraiser author to see contributions and rewards that have been claimed
                  a({ href: fundraiser.frontend_info_path, style: 'margin-left: 10px;' }, img({ src: 'images/info.gif' })),

                  !fundraiser.published && a({ 'class': 'fundraiser-delete-button', href: curry(destroy_fundraiser, fundraiser.id), style: 'margin-left: 10px; opacity:' + (fundraiser.published ? 0.25 : 1) + ';' }, img({ src: 'images/trash.gif' }))
                )
              );
            })
          )
        );
      } else {
        render({ into: fundraisers_table },
          info_message("You don't have any fundraiser drafts saved. ", a({ href: '#account/create_fundraiser' }, "Create one now"))
        );
      }
    });
  });

  define('destroy_fundraiser', function(fundraiser_id) {
    if (confirm('Are you sure? It will be gone forever!')) {
      BountySource.destroy_fundraiser(fundraiser_id, function(response) {
        if (response.meta.success) {
          window.location.reload();
        } else {
          render_message(error_message(response.data.error));
        }
      });
    }
  });
}
