with (scope('Project', 'App')) {

  route('#projects', function() {
    var target_div = div('Loading...');

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
    );
    
    if (logged_in()) {
      BountySource.get_cached_user_info(function(user_info) {
        if (user_info.github_account) {
          BountySource.api('/project_relations', { per_page: 300 }, function(response) {
            if (response.meta.success) {
              if (response.data.length > 0) {
                render({ into: target_div },
                  projects_table(response.data),
                  div({ id: 'project-manager-container', style: 'display: inline-block; vertical-align: top; display: none;' }),
                  div({ style: 'clear: both;' })
                );

                // check for install_id. It is appended before Github auth,
                // so that we can now install the plugin. do it homie.
                var params = get_params();

                if (params.install_id) {
                  var id = parseInt(params.install_id);
                  var button_wrapper = document.getElementById('tracker-plugin-widget-'+id);

                  if (button_wrapper && button_wrapper.childNodes.length > 0) {
                    // click the button
                    button_wrapper.childNodes[0].click();
                  }
                }

              } else {
                render({ into: target_div },
                  p("No projects found")
                );
              }
            } else {
              render({ into: target_div }, error_message(response.data.error));
            }
          });
        } else {
          render({ into: target_div },
            p("First, you need to ", a({ href: Github.auth_url({ scope: 'public_repo' }) }, 'link your GitHub account'), '.')
          );
        }
      });
    } else {
      render({ into: target_div },
        p("To start using the GitHub plugin, you need to " , a({ href: "#signin" }, "login or create an account"), ".")
      );
    }
  });

  define('install_or_manage_plugin_button', function(relation) {
    if (relation.project.tracker_plugin) {
      return manage_plugin_button(relation);
    } else {
      return install_plugin_button(relation);
    }
  });

  define('install_plugin_button', function(relation) {
    return a({ 'class': 'btn-auth btn-github small', style: 'display: inline-block; width: 130px;', href: curry(create_plugin, relation) }, 'Install Plugin');
  });

  define('manage_plugin_button', function(relation) {
    return a({ 'class': 'btn-auth btn-github small hover', style: 'display: inline-block; width: 130px;', href: curry(show_project_manager, relation) }, 'Manage Plugin');
  });

  define('reload_install_or_manage_plugin_button', function(new_relation) {
    render({ target: 'tracker-plugin-widget-'+new_relation.id }, install_or_manage_plugin_button(new_relation));
  });

  define('reset_plugin_button', function(relation) {
    render({ target: 'tracker-plugin-widget-'+relation.id }, install_plugin_button(relation));
  });

  define('projects_table', function(project_relations) {
    return table({ id: 'projects-table' },
      project_relations.map(function(relation) {
        return tr({ id: 'tracker-plugin-row-'+relation.id },
          td(relation.project.full_name),
          td(div({ id: 'tracker-plugin-widget-'+relation.id },
            curry(install_or_manage_plugin_button, relation)
          ))
        );
      })
    )
  });

  define('show_project_manager', function(relation) {
    var tracker_plugin = relation.project.tracker_plugin;

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

    var set_label_name_input = input({
      name: 'label_name',
      placeholder: 'bounty',
      style: 'margin-left: 30px;',
      disabled: 'disabled',
      value: tracker_plugin.label_name
    });

    var add_link_to_description = checkbox({
      id: 'add_link_to_description_'+relation.id,
      name: 'add_link_to_description',
      style: 'display: inline-block; vertical-align: middle; margin-right: 5px;',
      checked: tracker_plugin.add_link_to_description
    });

    var add_link_to_all_issues_checkbox = checkbox({
      id: 'add_link_to_all_issues_'+relation.id,
      name: 'add_link_to_all_issues',
      style: 'display: inline-block; vertical-align: middle; margin-right: 5px;',
      disabled: 'disabled',
      checked: tracker_plugin.add_link_to_all_issues
    });

    // show hide add_link_to_closed_issues
    add_link_to_description.addEventListener('change', function() {
      if (this.checked) {
        add_link_to_all_issues_checkbox.removeAttribute('disabled');
      } else {
        add_link_to_all_issues_checkbox.setAttribute('disabled', 'disabled');
      }
    });

    // show/hide label name input if add label checkbox changed
    add_label_checkbox.addEventListener('change', function() {
      if (this.checked) {
        set_label_name_input.removeAttribute('disabled');
      } else {
        set_label_name_input.setAttribute('disabled', 'disabled');
      }
    });

    render({ target: 'project-manager-container' },
      form({ id: 'update-tracker-plugin-form', action: curry(update_plugin, relation) },
        h3({ style: 'margin-top: 0;' }, 'Manage ' + relation.project.full_name),

        p({ style: 'font-size: 14px;' }, 'Note: Changes may take a few minutes to be applied at GitHub.'),

        div({ id: 'project-manager-message' }),

        add_bounty_to_title_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, 'Add bounty total to issue titles'),

        br,
        add_label_checkbox, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, "Add label to issues with bounties"),
        div({ id: 'set-label-name-wrapper', style: 'margin-left: 30px;' },
          span('Label: '),
          set_label_name_input
        ),

        br,
        add_link_to_description, div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0;' }, "Include link to active bounties on issues"),

        div({ id: 'add-link-to-all-issues-wrapper', style: 'margin-left: 30px;' },
          add_link_to_all_issues_checkbox,
          div({ style: 'display: inline-block; vertical-align: middle; padding: 10px 0; width: 300px;' }, "Include 'create bounty' link on open issues without bounties")
        ),

        br,
        button({ style: 'width: 70px; display: inline-block; vertical-align: middle;' }, 'Save'),

//        // Uninstall button
//        button({
//          style: 'margin-left: 10px; width: 70px; display: inline-block; vertical-align: middle;',
//          name: 'uninstall',
//          value: true,
//          onClick: curry(destroy_plugin, relation)
//        }, 'Uninstall'),

        br,
        p({ id: 'project-manager-updated-message' }, 'Updated ' + new Date(tracker_plugin.updated_at).toLocaleString())
      )
    );

    // show label input if labels are enabled
    if (add_label_checkbox.checked) set_label_name_input.removeAttribute('disabled');

    // show checkbox to include closed issues if add link to description is enabled
    if (add_link_to_description.checked) add_link_to_all_issues_checkbox.removeAttribute('disabled');

    // make the manager visible and scroll to that shit
    var e = document.getElementById('project-manager-container');
    e.style['display'] = 'inline-block';
    if (document.body.scrollTop > e.offsetTop) scrollTo(0, e.offsetTop - 50);

    // set the row as active
    var plugin_table = document.getElementById('projects-table');
    for (var i=0; i<plugin_table.rows.length; i++) remove_class(plugin_table.rows[i], 'active');
    var active_row = document.getElementById('tracker-plugin-row-'+relation.id);
    add_class(active_row, 'active');
  });

  define('update_plugin', function(relation, form_data) {
    var request_data = {
      add_bounty_to_title:        !!(form_data.add_bounty_to_title == 'on'),
      add_label:                  !!(form_data.add_label == 'on'),
      add_link_to_description:    !!(form_data.add_link_to_description == 'on'),
      add_link_to_all_issues:     !!(form_data.add_link_to_all_issues == 'on'),
      label_name:                 form_data.label_name
    };

    render({ target: 'project-manager-updated-message' }, 'Saving...');

    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'PUT', request_data, function(response) {
      if (response.meta.success) {
        // replace dat manage button with updated tracker data
        reload_install_or_manage_plugin_button(response.data);

        // render saved at time into manager window
        render({ target: 'project-manager-updated-message' }, 'Saved ' + new Date(response.data.updated_at).toLocaleString());
      }
    })
  });

  define('create_plugin', function(relation) {
    render({ target: 'tracker-plugin-widget-'+relation.id }, 'Installing...');

    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'POST', { linked_account_id: relation.linked_account.id }, function(response) {
      if (response.meta.success) {
        var new_relation = response.data;

        // reload to show manage button
        reload_install_or_manage_plugin_button(new_relation);

        // go to that plugin
        show_project_manager(new_relation);
      } else if (response.meta.status == 424) {
        window.location = Github.auth_url({ scope: 'public_repo', redirect_url: BountySource.www_host + get_route() + '?install_id=' + relation.id });
      } else {
        render({ target: 'tracker-plugin-widget-'+relation.id },
          a({ 'class': 'btn-auth btn-github small', style: 'display: inline-block; width: 130px;', href: curry(create_plugin, relation) }, 'Install Plugin')
        );

        alert(response.data.error);
      }
    });
  });

//  define('destroy_plugin', function(relation) {
//    render({ target: 'project-manager-updated-message' }, 'Uninstalling...');
//
//    BountySource.api('/trackers/' + relation.project.id + '/tracker_plugin', 'DELETE', function(response) {
//      if (response.meta.success) {
//        // reload the 'Install' button
//        reset_plugin_button(relation);
//
//        // row is no longer active
//        var plugin_table = document.getElementById('projects-table');
//        for (var i=0; i<plugin_table.rows.length; i++) remove_class(plugin_table.rows[i], 'active');
//
//        // clear the manager view and make it invisible!
//        var e = document.getElementById('project-manager-container');
//        render({ into: e }, '');
//        hide(e);
//      } else {
//        alert('Failed to delete plugin: ' + response.data.error);
//      }
//    })
//  });

}
