with (scope('Project', 'App')) {

  route('#projects', function() {
    load_projects();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'My Projects'
      ),
      curry(get, 'projects')
    )
  });

  define('load_projects', function() {
    set('projects', 'Loading...');

    BountySource.api('/project_relations', function(response) {
      if (response.meta.success) {
        set('projects', projects_table(response.data));
      } else {
        set('projects', response.data.error);
      }
    })
  });

  define('projects_table', function(project_relations) {
    return table({ 'class': 'projects-table' },
      tr(
        th({ style: 'width: 200px;' }, 'Name'),
        th()
      ),
      project_relations.map(function(relation) {
        var project = relation.project;
        var linked_account = relation.linked_account;
        var tracker_plugin = project.tracker_plugin;

        return tr(
          td(project.name),
          td(
            !tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
              curry(get, 'create_plugin_errors'),
              a({ style: 'display: inline-block;', href: curry(create_plugin, project, linked_account) }, 'Create Plugin')
            ),

            tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
              curry(get, 'update_plugin_alert_'+project.id),

              form({ 'class': 'fancy', action: curry(update_plugin, project) },
                fieldset(
                  label({ 'for': 'add_bounty_to_title_'+project.id }, 'Add bounty total to Issue titles:'),
                  checkbox({ id: 'add_bounty_to_title_'+project.id, name: 'add_bounty_to_title', checked: tracker_plugin.add_bounty_to_title })
                ),

                fieldset(
                  label({ 'for': 'add_label_'+project.id }, "Add 'Bountysource' label to Issues"),
                  checkbox({ id: 'add_label_'+project.id, name: 'add_label', checked: tracker_plugin.add_label })
                ),

//                fieldset(
//                  label({ 'for': 'add_link_to_description_'+project.id }, "Add link to bounty in issue description"),
//                  checkbox({ id: 'add_link_to_description_'+project.id, name: 'add_link_to_description', checked: tracker_plugin.add_link_to_description })
//                ),

                submit
              )
            )
          )
        );
      })
    )
  });

  define('create_plugin', function(project, linked_account) {
    BountySource.api('/trackers/' + project.id + '/tracker_plugin', 'POST', { linked_account_id: linked_account.id }, function(response) {
      if (response.meta.success) {
        set_route(get_route());
      } else if (response.meta.status == 424) {
        window.location = Github.auth_url({ scope: 'public_repo' });
      } else {
        set('create_plugin_errors', error_message(response.data.error));
      }
    });
  });

  define('update_plugin', function(project, form_data) {
    var request_data = {
      add_bounty_to_title:      !!(form_data.add_bounty_to_title == 'on'),
      add_label:                !!(form_data.add_label == 'on'),
      add_link_to_description:  !!(form_data.add_link_to_description == 'on')
    };

    BountySource.api('/trackers/' + project.id + '/tracker_plugin', 'PUT', request_data, function(response) {
      if (response.meta.success) {
        set('update_plugin_alert_'+project.id, success_message('Project settings updated! Changes maye take a few minutes to be applied.'))
      } else {

      }
    })
  });

  define('destroy_plugin', function(project) {
    BountySource.api('/trackers/' + project.id + '/tracker_plugin', 'DELETE', function(response) {

      console.log(response);

      if (response.meta.success) {
        set_route('#account');
      } else {

      }
    })
  });

}