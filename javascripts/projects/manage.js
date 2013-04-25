with (scope('Project', 'App')) {

  route('#projects', function() {
    load_projects();

    var target_div = div();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'My Projects'
      ),


      p('You can enable or disable services that allow Bountysource to automatically do a few things whenever a bounty is posted or updated:'),
      ul(
        li('add or update bounty total in issue titles'),
        li('add a Bountysource label to GitHub issues with bounties'),
        li('add a link to the bounty at the bottom of the issue body')
      ),

      p("Here is an example of what your issues will look like on GitHub:"),

      ul(
        li(
          p('Bounty total in issue title:'),
          img({ style:'border: 1px solid #E6E6E6;', src: '/images/github-plugin-example.png' })
        ),
        li(
          p('Bounty link in issue body:'),
          img({ style:'border: 1px solid #E6E6E6;', src: '/images/github-plugin-example2.png' })
        )
      ),

      br,

      target_div
    )

    BountySource.get_cached_user_info(function(user_info) {
      if (user_info.github_account) {
        render({ into: target_div },
          curry(get, 'projects')
        )
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
      request_data[this.getAttribute('name')] = this.checked+'';

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
        return tr(
          td(relation.project.full_name),
          td(div({ id: 'tracker-plugin-widget-'+relation.id }, tracker_plugin_widget_content(relation)))
        );
      })
    )
  });

  define('tracker_plugin_widget_content', function(relation) {
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

      var add_link_to_description = checkbox({
        id: 'add_link_to_description_'+relation.id,
        name: 'add_link_to_description',
        style: 'display: inline-block; vertical-align: middle; margin-right: 5px;',
        checked: tracker_plugin.add_link_to_description
      });

      set_update_plugin_checkbox_listener(add_bounty_to_title_checkbox, relation);
      set_update_plugin_checkbox_listener(add_label_checkbox, relation);
      set_update_plugin_checkbox_listener(add_link_to_description, relation);
    }

    return [
      !tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
        curry(get, 'create_plugin_errors'),
        a({ 'class': 'btn-auth btn-github small', style: 'display: inline-block;', href: curry(create_plugin, relation) }, 'Install Plugin')
      ),

      tracker_plugin && div({ 'class': 'projects-table-tracker-plugin' },
        curry(get, 'update_plugin_alert_'+relation.id),
        add_bounty_to_title_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, 'Add bounty total to issue titles'),
        br,
        add_label_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, "Add 'Bountysource' label to issues"),
        br,
        add_link_to_description, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, "Add link to bounties at the bottom of issue bodies")
      )
    ]
  });

  define('create_plugin', function(relation) {
    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'POST', { linked_account_id: relation.linked_account.id }, function(response) {
      if (response.meta.success) {
        // build a fake relation model from server response
        var fake_relation = { project: response.data.tracker, linked_account: response.data.linked_account };
        fake_relation.project.tracker_plugin = response.data;

        render({ target: 'tracker-plugin-widget-'+relation.id },
          tracker_plugin_widget_content(fake_relation)
        );
      } else if (response.meta.status == 424) {
        window.location = Github.auth_url({ scope: 'public_repo' });
      } else {
        alert(response.data.error);
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