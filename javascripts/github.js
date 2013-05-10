with (scope('Github','App')) {
  define('auth_url', function(options) {
    options = options || {};
    return BountySource.api_host+'auth/github?scope='+(options.scope||'') +
      '&access_token='+(Storage.get('access_token')||'') +
      '&redirect_url='+encode_html(options.redirect_url || window.location.href); // make sure the redirect url is the last param?
  });

  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};
    return a({ 'class': 'button green', href: auth_url(options) }, text);
  });

  // requires user to be logged in, and have a GitHub account linked
  define('account_linked', function() {
    if (!logged_in()) return false;
    var user_info = parsed_user_info();
    return user_info.github_user || null;
  });

  // route through github authorization, requiring public_repo permission
  define('require_permissions', function() {
    var arguments = flatten_to_array(arguments),
        callback = shift_callback_from_args(arguments),
        needed_permissions = arguments,
        necessary_auth_url = auth_url({ scope: needed_permissions });

    if (!account_linked()) {
      callback(false, necessary_auth_url);
    } else {
      BountySource.get_cached_user_info(function(user_info) {
        // loop through permissions, check if all accounted for
        var authorized = true;
        for (var i=0; authorized && i<needed_permissions.length; i++) {
          authorized = user_info.github_user.permissions.indexOf(needed_permissions[i]) >= 0;
        }
        callback(authorized, necessary_auth_url);
      });
    }
  });

  // creates a button with a comment form flyout
  define('issue_comment_form', function(issue, options) {
    options = options || {};

    var user_info   = Storage.get('user_info') ? JSON.parse(Storage.get('user_info')) : {},
        github_user = user_info.github_user ? user_info.github_user : {};

    var link_account_button = a({ id: 'github-issue-comment-button', style: 'opacity: 0.25;', 'class': 'btn-auth btn-github large' }, 'GitHub');
    var comment_form = div({ id: 'comment-form-wrapper' },
      form({ action: curry(create_issue_comment, issue) },
        div({ id: 'github-issue-comment-errors' }),
        textarea({ required: true, name: 'body', placeholder: 'I <3 OSS' }, options.default_text||''),
        submit({ 'class': 'btn-auth btn-github' }, 'Post Comment')
      )
    );

    BountySource.api('/github/user', function(response) {
      link_account_button.style.opacity = 1;

      if (!response.meta.success || response.data.permissions.indexOf('public_repo') < 0) {
        link_account_button.href = auth_url({ scope: 'public_repo' });
      } else {
        link_account_button.addEventListener('click', function() {
          if (has_class(this.parentElement, 'active')) {
            remove_class(this.parentElement, 'active');
            remove_class(this, 'hover');
            remove_class(this, 'active');
          } else {
            add_class(this.parentElement, 'active');
            add_class(this, 'hover');
            add_class(this, 'active');
            comment_form.getElementsByTagName('textarea')[0].focus();
          }
        });
      }
    });

    return div({ id: 'github-issue-comment-wrapper' },
      link_account_button,
      comment_form
    );
  });

  define('create_issue_comment', function(issue, form_data) {
    render({ target: 'github-issue-comment-errors' }, '');

    BountySource.api('/github/repos/'+issue.repository.full_name+'/issues/'+issue.number+'/post_comment', 'POST', form_data, function(response) {
      if (response.meta.success) {
        // hide the form, using the click event method that is already defined
        var e = document.getElementById('github-issue-comment-button');
        if (e) e.click();
      } else {
        render({ target: 'github-issue-comment-errors' }, small_error_message(response.data.error));
      }
    });
  });

};