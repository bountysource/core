with (scope('Project', 'App')) {

  route('#projects', function() {
    load_projects();

    var target_div = div();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'My Projects'
      ),

      p("Below are all projects associated with your GitHub account."),
      p("You can enable or disable Bountysource services that allows Bountysource to automatically add/update a bounty total in issue titles as well as add the Bountysource label to the GitHub issue."),

      target_div
    )

    BountySource.get_cached_user_info(function(user_info) {
      if (user_info.github_account) {
        render({ into: target_div }, curry(get, 'projects'))
      } else {
        render({ into: target_div },
          p("First, you need to ", a({ href: Github.auth_url({ scope: 'public_repo' }) }, 'link your GitHub account'), '.')
        )
      }

    });
  });

  define('load_projects', function() {
    set('projects', 'Loading...');

    BountySource.api('/project_relations', function(response) {
      if (response.meta.success) {
        if (response.data.length > 0) {
          set('projects', projects_table(response.data));
        } else {
          set('projects', p("No projects found."));
        }
      } else {
        set('projects', response.data.error);
      }
    })
  });

  define('update_plugin', function(relation, form_data) {
    var request_data = {
      add_bounty_to_title:      !!(form_data.add_bounty_to_title == 'on'),
      add_label:                !!(form_data.add_label == 'on'),
      add_link_to_description:  !!(form_data.add_link_to_description == 'on')
    };

    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'PUT', request_data, function(response) {
      if (response.meta.success) {
        set('update_plugin_alert_'+relation.id, success_message('Project settings updated! Changes maye take a few minutes to be applied.'))
      } else {

      }
    })
  });

  define('set_update_plugin_checkbox_listener', function(check_box, relation) {
    check_box.addEventListener('change', function(e) {
      var request_data = {};
      request_data[this.getAttribute('name')] = this.checked;

      BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'PUT', request_data, function(response) {
        if (response.meta.success) {
          // set('update_plugin_alert_'+relation.id, success_message('Project settings updated! Changes maye take a few minutes to be applied.'))
        } else {
          // set('update_plugin_alert_'+relation.id, small_error_message('Oh no, something went wrong :('))
        }
      });
    });
  });

  define('projects_table', function(project_relations) {
    return table({ 'class': 'projects-table' },
      tr(
        th({ style: 'width: 200px;' }),
        th()
      ),
      project_relations.map(function(relation) {
        var project         = relation.project;
        var tracker_plugin  = project.tracker_plugin;

        if (tracker_plugin) {
          var add_bounty_to_title_checkbox = checkbox({
            id: 'add_bounty_to_title_'+relation.id,
            name: 'add_bounty_to_title',
            style: 'display: inline-block; vertical-align: middle; margin-right: 5px;',
            checked: tracker_plugin.add_bounty_to_title
          });

          var add_label_checkbox = checkbox({
            id: 'add_label_'+relation.id,
            name: 'add_label',
            style: 'display: inline-block; vertical-align: middle; margin-right: 5px;',
            checked: tracker_plugin.add_label
          });

          set_update_plugin_checkbox_listener(add_bounty_to_title_checkbox, relation);
          set_update_plugin_checkbox_listener(add_label_checkbox, relation);
        }

        return tr(
          td(project.name),
          td(
            !tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
              curry(get, 'create_plugin_errors'),
              a({ style: 'display: inline-block;', href: curry(create_plugin, relation) }, 'Create Plugin')
            ),

            tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
              curry(get, 'update_plugin_alert_'+relation.id),

              add_bounty_to_title_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, 'Add bounty total to Issue titles:'),
              br,
              add_label_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, "Add 'Bountysource' label to Issues")

//              form({ 'class': 'fancy', action: curry(update_plugin, relation) },
//                fieldset(
//                  label({ 'for': 'add_bounty_to_title_'+relation.id }, 'Add bounty total to Issue titles:'),
//                  add_bounty_to_title_checkbox
//                ),
//
//                fieldset(
//                  label({ 'for': 'add_label_'+relation.id }, "Add 'Bountysource' label to Issues"),
//                  add_label_checkbox
//                )
//              )
            )
          )
        );
      })
    )
  });

  define('create_plugin', function(relation) {
    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'POST', { linked_account_id: relation.linked_account.id }, function(response) {
      if (response.meta.success) {
        set_route(get_route());
      } else if (response.meta.status == 424) {
        window.location = Github.auth_url({ scope: 'public_repo' });
      } else {
        set('create_plugin_errors', error_message(response.data.error));
      }
    });
  });

  // TODO destroy
  define('destroy_plugin', function(project) {
    BountySource.api('/trackers/' + project.id + '/tracker_plugin', 'DELETE', function(response) {

      if (response.meta.success) {
        set_route('#account');
      } else {
      }
    })
  });

}