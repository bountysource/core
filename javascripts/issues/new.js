with (scope('Issue', 'App')) {

  route('#issues/new', function() {
    var params = get_params();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Add Issue'
      ),

      section({ style: 'padding: 21px' },
        form({ 'class': 'fancy', action: create_issue },

          div({ id: 'create-issue-errors' }),

          div("Please help us out by adding missing Issues to BountySource."),

          fieldset(
            label({ 'for': 'url-input' }, 'Issue URL:'),
            text({ name: 'issue_url', id: 'url-input', value: params.url, placeholder: 'https://trac.someproject.com/ticket/123', 'class': 'long' })
          ),

          fieldset(
            label({ 'for': 'title-input' }, 'Issue Title:'),
            text({ name: 'title', id: 'title-input', value: '', placeholder: 'Copy and Paste the title of the issue.', 'class': 'long' })
          ),

          fieldset(
            label({ 'for': 'number-input' }, 'Issue Number:'),
            text({ name: 'number', id: 'number-input', value: '', placeholder: '123', 'class': 'short' })
          ),

          div("Please provide some basic information about the project."),

          fieldset(
            label({ 'for': 'number-input' }, 'Project Name:'),
            text({ name: 'project_name', id: 'number-input', value: '', placeholder: 'Project Name' })
          ),

          fieldset(
            label({ 'for': 'number-input' }, 'Project Tracker URL:'),
            text({ name: 'project_url', id: 'number-input', value: '', placeholder: 'https://trac.someproject.com/' })
          ),

          fieldset({ 'class': 'no-label '},
            submit({ 'class': 'blue' }, 'Add Issue')
          )
        )
      )
    );
  });

  define('create_issue', function(form_data) {
    BountySource.create_issue(form_data, function(response) {
      if (response.meta.success) {
        set_route(response.data.frontend_path);
      } else {
        render({ target: 'create-issue-errors' }, error_message(response.data.error));
      }
    });
  });

}
