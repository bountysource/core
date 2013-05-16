with (scope('TrackerPlugins', 'App')) {

  define('show_for_linked_account', function(linked_account) {
    load_my_projects();

    return div(
      h3('Your Projects'),
      curry(get, 'my_projects')
    );
  });

  define('load_my_projects', function() {
    set('my_projects', 'Loading...');

    BountySource.api('/project_relations', function(response) {
      if (response.meta.success) {
        set('my_projects', projects_table(response.data));
      } else {
        set('my_projects', response.data.error);
      }
    })
  });

  define('projects_table', function(project_relations) {
    return table(
      tr(
        th('Project'),
        th('Relation'),
        th()
      ),
      project_relations.map(function(relation) {
        return tr(
          td(relation.project.name),
          td(relation.type),
          td(a({ href: relation.project.frontend_path+'/relations/'+relation.id }, 'Manage'))
        )
      })
    )
  });

}