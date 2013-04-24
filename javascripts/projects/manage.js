with (scope('Project', 'App')) {

  route('#trackers/:tracker_id/relations/:relation_id', function(tracker_id, relation_id) {
    load_relation(relation_id);

    render(
      curry(get, 'project_relation')
    );
  });

  define('load_relation', function(relation_id) {
    set('project_relation', 'Loading...');

    BountySource.api('/project_relations/'+relation_id, function(response) {
      if (response.meta.success) {
        var project = response.data.project;
        var linked_account = response.data.linked_account;
        var tracker_plugin = project.tracker_plugin;

        if (tracker_plugin) {

          set('project_relation', div(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: '#account' }, 'Account'),
              a({ href: project.frontend_path }, project.name),
              'Manage'
            ),

            form({ 'class': 'fancy', action: curry(update_plugin, project) },
              fieldset(
                label({ 'for': 'add_bounty_to_title' }, 'Add bounty total to Issue titles:'),
                checkbox({ id: 'add_bounty_to_title', name: 'add_bounty_to_title', checked: tracker_plugin.add_bounty_to_title })
              ),

              fieldset(
                label({ 'for': 'add_label' }, "Add 'Bountysource' label to Issues"),
                checkbox({ id: 'add_label', name: 'add_label', checked: tracker_plugin.add_label })
              ),

              submit({ 'class': 'button green' }),
              a({ href: '' })
            )
          ));

        } else {

          set('project_relation', div(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: '#account' }, 'Account'),
              a({ href: project.frontend_path }, project.name),
              'Manage'
            ),

            curry(get, 'create_plugin_errors'),
            a({ 'class': 'button green', style: 'display: inline-block;', href: curry(create_plugin, project, linked_account) }, 'Create Plugin')
          ));

        }
      } else {
        set('project_relation', error_message(response.data.error));
      }
    });
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

    console.log(request_data);

    BountySource.api('/trackers/' + project.id + '/tracker_plugin', 'PUT', request_data, function(response) {
      if (response.meta.success) {
        set_route(get_route());
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