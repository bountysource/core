with (scope('Repository', 'App')) {

  define('repository_card', function(repository) {
    var repo_url = repository.frontend_path;
    return div({ 'class': 'card', style: 'height: 470px', onClick: curry(set_route, repository.href) },
      div({ style: 'background: rgba(220,220,255,0.7); position: absolute; color: #3c3; font-size: 200%; padding: 20px; border-radius: 0 0 20px 0' },
        money(repository.bounty_total || 0)
      ),
      div({ style: 'text-align: right'},
        a({ href: repo_url }, img({ style: 'width: 120px', src: repository.avatar_url }))
      ),

      div({ style: 'padding: 7px; background: #EEE; margin-bottom: 5px;' },
        div({ style: 'margin: 4px 0; font-size: 16px; font-weight: bold' }, a({ href: repository.frontend_path, style: 'color: #333' }, repository.name)),

        div({ style: 'overflow: auto; height: 60px; color: #999; font-size: 80%;' },
          truncate(repository.description, 100)
        ),

        // languages
        (repository.languages_as_string) && div({ style: 'font-size: 12px; color: #999; font-size: 60%; font-style: italic' },
          repository.languages_as_string
        )
      ),

      repository.most_bounteous_issues.map(function (issue) {
        var issue_url = repo_url + '/issues/' + issue.number;
        return div({ style: 'margin-bottom: 10px; font-size: 12px' },
          a({ href: issue_url }, truncate(issue.title, 100)),
          a({ href: issue_url, style: 'display: inline; vertical-align: middle; text-decoration: none; color: #48B848; margin-left: 8px' }, money(issue.bounty_total))
        )
      })

    );
  });

}
