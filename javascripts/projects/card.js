with (scope('Project', 'App')) {

  define('card', function(project, options) {
    options = options || {};
    options['class']  = 'card project';
    options.href      = options.href || project.frontend_path;

    return a(options,
      div({
        'class': 'project-image',
        style: 'background-image: url("' + (project.image_url || '/images/bountysource-icon.png') + '");'
      }),

      div({ 'class': 'project-name' }, truncate(project.name, 70)),

      div({ 'class': 'issues-with-bounties' },
        project.issues.slice(0,5).map(function(issue) {
          return div(
            span(money(issue.bounty_total)),
            span(truncate(issue.title, 30))
          );
        })
      ),

      div({ 'class': 'bottom-button' }, money(project.bounty_total) + ' In Bounties')
    );
  });

}
