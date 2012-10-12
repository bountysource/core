with (scope('PullRequest', 'App')) {
  route('#repos/:login/:repository/issues/:issue_number/issue_branch', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        ('Issue Branch')
      ),
      target_div
    );

    Issue.get_solution(login, repository, issue_number, function(solution) {
      var commits_div = div('Loading...'),
          submit_div = div();

      solution && render({ into: target_div },
        div({ 'class': 'split-main' },
          (solution.commits||[]).length > 0 && !solution.pull_request && info_message(
            span({ style: 'margin-right: 25px;' }, "Submit your solution for review by the project committers."),
            a({ 'class': 'blue', style: 'width: 200px; display: inline-block;', href: curry(submit_solution, login, repository, issue_number) }, 'Submit Solution')
          ),

          commits_div
        ),
        div({ 'class': 'split-side' },
          div({ style: 'background: #F1F1F1; padding: 0 21px 21px 21px; margin: 20px 15px; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC;' },
            ribbon_header('GitHub Links'),
            br(),
            a({ 'class': 'green', target: '_blank', href: solution.head.repository.url+'/tree/'+solution.head.name }, 'Your Branch'),
            br(),
            a({ 'class': 'green', target: '_blank', href: solution.base.repository.url }, 'Base Repository')
          )
        ),
        div({ 'class': 'split-end' })
      );

      if (!solution) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);
      } else {
        if (solution.commits.length <= 0) {
          // show git instructions
          render({ into: commits_div },
            h3('What Now?'),
            p("To earn the bounty for this issue, you must commit your solution to the ", b('issue branch'), " that has been created for you."),
            br(),

            h3('Before Getting Started'),
            p("You will need to install and setup ", b('git'), ". Don't know what that is? Don't know if you have it installed? Just follow ", a({ target: '_blank', href: 'https://help.github.com/articles/set-up-git' }, 'this guide'), " to the end, and you will be ready to work."),
            br(),

            h3("Start Working on Your Issue Branch"),
            p("On GitHub, you now have your own copy of ", b(solution.base.repository.name), ", which is called ", b(solution.head.repository.full_name), ". To start working on your solution:"),

            ol(
              li(
                p("Navigate to the directory from which you want to work."),
                code("cd ~/my_projects")
              ),
              li(
                p("Clone the repository from GitHub. This may take a while, depending on the size of the repository that you forked."),
                code('git clone git@github.com:'+solution.head.repository.full_name+'.git')
              ),
              li(
                p("Woohoo, you now have your own copy of ", solution.base.repository.name, "! Before you get started, you must tell git to use the ", b('issue branch'), " created by BountySource."),
                code(
                  'cd '+solution.base.repository.name,
                  'git fetch origin',
                  'git checkout '+solution.head.name
                )
              )
            ),

            p("That's it! Now, when you commit code, you will be appending the changes to your ", b('issue branch'), ". Once you have made some changes to your branch, they will show up here."),
            br(),

            h3("My Commits are not Shown!"),
            p("Chances are you did not commit your changes to the designated ", b("issue branch"), ". Run the following command inside of your repository directory:"),
            code('git branch -l'),
            p("You will get a list of all the branches, with an asterisk next to the one you are currently committing changes to:"),
            code(
              '  '+solution.head.name,
              '  issue12',
              '* master'
            ),
            p("You need to switch back to the issue branch, then move the changes you made over to it. For the following rebase command, use the name of the branch that you are on:"),
            code(
              'git checkout '+solution.head.name,
              'git rebase master'
            ),
            p("If you run into any problems during the rebase, consult the ", a({ href: 'http://git-scm.com/book/en/Git-Branching-Rebasing' }, 'git documentation'), " for assistance, however, it should work marvelously in this case."),
            br(),

            h3('Additional Help'),
            p("If you need additional help with Git or GitHub, you may find the following links useful:"),
            ul(
              li(a({ target: '_blank', href: '#faq' }, 'BountySource FAQs')),
              li(a({ target: '_blank', href: 'https://help.github.com' }, 'GitHub help')),
              li(a({ target: '_blank', href: 'http://git-scm.com/docs' }, 'Git documentation'))
            )
          );
        } else if (solution.pull_request) {
          // where there is normally a submit solution button, render a view solution button that links to GitHub
          render({ into: submit_div },
            a({ 'class': 'blue', target: '_blank', href: solution.pull_request.url }, 'Your Submission')
          );

          // pull request has been merged, and the underlying issue closed
          if (solution.pull_request.merged && solution.issue.closed) {
            render({ into: commits_div },
              success_message("Your solution has been merged, and accepted as satisfactory by the committers! Once the dispute period is over, you will be paid out."),
              commits_table(solution)
            );
          // pull request has been merged, but the underlying issue has not been closed
          } else if (solution.pull_request.merged && !solution.issue.closed) {
            render({ into: commits_div },
              success_message("Your solution has been merged into the base repository. When the underlying issue is also closed, the dispute period will begin, after which you will be paid if your solution is deemed satisfactory."),
              commits_table(solution)
            );
            // the pull_request has not been merged, but it is automatically mergeable
          } else if (solution.pull_request.mergeable) {
            render({ into: commits_div },
              success_message("Your solution has been submitted, and is awaiting review by the project committers."),
              commits_table(solution)
            );
          // the pull_request has not been merged, and it requires a rebase as it is unmergeable.
          } else {
            render({ into: commits_div },
              success_message(
                "Your solution has been submitted, but is not mergeable with the base repository. The project committers cannot automatically accept your solution until you perform a ", b('rebase'), ".",
                br(),
                a({ href: 'http://git-scm.com/book/en/Git-Branching-Rebasing' }, "Learn more about rebasing"), ", or just follow the instructions below to make your solution branch automatically mergeable."
              ),

              h3('Rebasing your Issue Branch'),
              p('From within your fork of the repository, ', (solution.head.repository.full_name), ', run the following:'),
              code(
                "git checkout "+solution.head.name,
                "git pull --rebase https://github.com/"+solution.base.repository.full_name+" master",
                "git push"
              ),

              h3('Resolving Merge Conflicts'),
              p("Depending on the changes that were made, there may be conflicts in certain files. A conflict means both you and the base branch made changes to the same part of a file, and git doesn't know how to automatically merge it. If you run into conflicts, and need some help overcoming them, follow the ", a({ href: 'http://git-scm.com/book/en/Git-Branching-Basic-Branching-and-Merging#Basic-Merge-Conflicts' }, 'git documentation'), " on resolving merge conflicts."),

              commits_table(solution)
            );
          }
        } else {
          // show commits
          render({ into: commits_div }, commits_table(solution));
        }
      }
    });
  });

  define('commits_table', function(solution) {
    return table(
      tr(
        th({ style: 'width: 50px;' }),
        th({ style: 'width: 100px;' }, 'SHA'),
        th('Message')
      ),
      solution.commits.map(function(commit) {
        return tr(
          td(img({ src: commit.user.avatar_url, style: 'width: 35px;' })),
          td(a({ target: '_blank', href: solution.head.repository.url+'/commit/'+commit.sha }, commit.sha.substr(0,7))),
          td(commit.message)
        )
      })
    );
  })

  define('submit_solution', function(login, repository, issue_number, form_data) {
    form_data = form_data || {};
    BountySource.submit_solution(login, repository, issue_number, { title: (form_data.title || 'Fixes Issue#'+issue_number), body: form_data.body + ' (Fixes Issue #'+issue_number+')' }, function(response) {
      if (response.meta.success) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number+'/issue_branch', { reload_page: true });
      } else {
        render_error(error_message(response.data.error));
      }
    });
  });
};