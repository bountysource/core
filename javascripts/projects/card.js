with (scope('Project', 'App')) {

  define('card', function(project, options) {
    options = options || {};
    options['class']  = 'card project';
    options.href      = options.href || project.frontend_path;

    var project_image_element = div({
      'class': 'project-image',
      style: 'background-image: url("' + project.image_url + '");'
    });


    // inside of the image element, add the bounty total
    render({ into: project_image_element },
      div({ 'class': 'project-bounty-total' }, money(project.bounty_total))
    );

    return a(options,
      project_image_element,

      div({ 'class': 'project-name' }, truncate(project.name, 70)),

      div({ 'class': 'issues-with-bounties' },
        project.issues.slice(0,5).map(function(issue) {
          return div(
            span(money(issue.bounty_total)),
            span(truncate(issue.title, 30))
          );
        })
      ),

      div({ 'class': 'bottom-button' }, 'Show All Bounties')
    );
  });

}
