with (scope('Updates', 'Fundraiser')) {
  route('#fundraisers/:fundraiser_id/updates', function(fundraiser_id) {
    render('Loading...');

    Updates.create_errors = div();

    BountySource.get_fundraiser_updates(fundraiser_id, function(response) {
      if (response.meta.success) {
        var fundraiser  = response.data,
            updates     = fundraiser.updates;

        render(
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 100)),
            'Updates'
          ),

          Columns.create({ show_side: true }),

          Columns.main(
            // actions for owner
            fundraiser.owner && ul({ id: 'fundraiser-updates-buttons' },
              li(a({ 'class': 'button small gray', href: curry(create_update, fundraiser) },
                img({ src: 'images/clipboard.gif' }),
                span('New Update')
              ))
            ),

            updates.length <= 0 && p({ style: 'font-style: italic;' }, "No updates have been posted."),

            updates.map(function(update) {
              var update_row = a({ 'class': 'fundraiser-update index-row', href: update.frontend_path },
                !update.published && div('Draft'),
                update.published && div('Update #' + update.number),

                div(truncate(update.title, 100)),

                !update.published && div("Last modified " + formatted_date(update.updated_at)),
                update.published && div('Published ' + formatted_date(update.published_at))
              );

              if (!update.published) add_class(update_row, 'draft');

              return update_row;
            })
          ),

          Columns.side(
            div({ style: 'text-align: center;' }, card(fundraiser))
          )
        )
      } else {
        render(error_message(response.data.error));
      }
    });
  });

  define('create_update', function(fundraiser) {
    render({ into: Updates.create_errors }, '');

    BountySource.create_fundraiser_update(fundraiser.id, function(response) {
      if (response.meta.success) {
        var update = response.data.update;
        set_route(update.frontend_edit_path);
      } else {
        render({ into: Updates.create_errors }, error_message(response.data.errors));
      }
    });
  });

  route('#fundraisers/:fundraiser_id/updates/:id', function(fundraiser_id, id) {
    render('Loading...');

    BountySource.get_fundraiser_update(fundraiser_id, id, function(response) {
      if (response.meta.success) {
        var fundraiser  = response.data,
            update      = fundraiser.update;

        render(
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 50)),
            a({ href: fundraiser.frontend_updates_path }, 'Updates'),
            truncate(update.title || 'Untitled', 100)
          ),

          // edit links
          (fundraiser.owner && !update.published) && ul({ id: 'fundraiser-updates-buttons' },
            li(a({ 'class': 'button small gray', href: update.frontend_edit_path },
              img({ src: 'images/edit.gif' }),
              span('Edit / Publish')
            )),

            li(a({ 'class': 'button small gray', href: curry(destroy_update, fundraiser, update) },
              img({ src: 'images/trash.gif' }),
              span('Delete')
            ))
          ),


          div({ 'class': 'gfm', style: 'padding: 5px 0;' },
            div({ style: 'border-bottom: 1px solid #EEE; padding-bottom: 10px;' },
              !update.published && h1({ style: 'margin-top: 0; color: #4d99c7;' }, 'Draft: ' + (update.title  || 'Untitled')),
              update.published && h1({ style: 'margin-top: 0; color: #70C770;' }, 'Update #' + update.number + ': ' + (update.title  || 'Untitled')),

              !update.published && span({ style: 'color: gray; font-style: italic;' }, 'Last modified ' + formatted_date(update.created_at)),
              update.published && span({ style: 'color: gray; font-style: italic;' }, 'Posted ' + formatted_date(update.created_at))
            ),

            !update.body_html && p({ style: 'font-style: italic' }, 'This update has no content.'),

            update.body_html &&   div({ html: update.body_html })
          )
        )
      } else {
        render(error_message(response.data.error));
      }
    })
  });

  route('#fundraisers/:fundraiser_id/updates/:id/edit', function(fundraiser_id, id) {
    render('Loading...');

    Updates.create_errors = div();

    BountySource.get_fundraiser_update(fundraiser_id, id, function(response) {
      if (response.meta.success) {
        var fundraiser  = response.data,
            update      = fundraiser.update;

        if (update.published) {
          render(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 50)),
              a({ href: fundraiser.frontend_updates_path }, 'Updates'),
              a({ href: update.frontend_path }, truncate(update.title||'Untitled', 100)),
              'Edit'
            ),
            error_message('This update has already been published, it cannot be edited.')
          )
        } else {
          render(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 50)),
              a({ href: fundraiser.frontend_updates_path }, 'Updates'),
              a({ href: update.frontend_path }, truncate(update.title||'Untitled', 100)),
              'Edit'
            ),

            Columns.create({ show_side: true }),

            Columns.main(
              form({ 'class': 'fancy', action: curry(save_update, fundraiser, update) },
                fieldset({ 'class': 'no-label' },
                  Updates.create_errors
                ),

                fieldset(
                  label('Title:'),
                  input({
                    style: 'width: 463px; margin: 0; font-size: 14px;',
                    required: true,
                    name: 'title',
                    placeholder: 'Title of your update',
                    value: update.title||''
                  })
                ),

                fieldset(
                  label('Content:'),
                  textarea({
                    style: 'width: 463px; height: 300px; margin: 0; border-radius: 0; vertical-align: top;',
                    required: true,
                    name: 'body',
                    placeholder: 'Content of your update'
                  }, update.body||'')
                ),
                fieldset({ 'class': 'no-label' },
                  submit({
                    'class': 'button green',
                    style:    'display: inline-block: vertical-align: middle; width: 120px; margin-right: 10px;'
                  }, 'Save'),

                  a({
                    'class':  'button blue',
                    style:    'display: inline-block; vertical-align: middle; width: 120px; margin-right: 10px;',
                    href:     update.frontend_path
                  }, 'Preview'),

                  a({
                    'class':  'button blue',
                    style:    'display: inline-block; vertical-align: middle; width: 120px;',
                    href:     curry(publish_update, fundraiser, update)
                  }, 'Publish')
                )
              )
            ),

            Columns.side(
              h4('Note:'),
              p("When published, all of your backers will receive an email with the update."),

              h4('Formatting:'),
              p("Formatted with ", a({ target: '_blank', href: 'http://github.github.com/github-flavored-markdown/' }, "GitHub Flavored Markdown."))
            )
          )

        }
      } else {
        render(error_message(response.data.error));
      }
    })
  });

  define('save_update', function(fundraiser, update, form_data) {
    render({ into: Updates.create_errors }, '');

    BountySource.update_fundraiser_update(fundraiser.id, update.id, form_data, function(response) {
      if (response.meta.success) {
        render({ into: Updates.create_errors }, small_success_message('Update has been saved.'));
      } else {
        render({ into: Updates.create_errors }, small_error_message(response.data.error));
      }
    });
  });

  define('destroy_update', function(fundraiser, update) {
    if (confirm('Destroy update draft?')) {
      render({ into: Updates.create_errors }, '');

      BountySource.destroy_fundraiser_update(fundraiser.id, update.id, function(response) {
        if (response.meta.success) {
          set_route(fundraiser.frontend_updates_path);
        } else {
          render({ into: Updates.create_errors }, small_error_message(response.data.error));
        }
      });
    }
  });

  define('publish_update', function(fundraiser, update) {
    if (confirm('Publish update?')) {
      render({ into: Updates.create_errors }, '');

      BountySource.publish_fundraiser_update(fundraiser.id, update.id, function(response) {
        if (response.meta.success) {
          set_route(update.frontend_path);
        } else {
          render({ into: Updates.create_errors }, small_error_message(response.data.error));
        }
      });
    }
  });
}