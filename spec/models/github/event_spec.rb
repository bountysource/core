require 'spec_helper'

describe Github::Event do

  let(:pull_request_event) do
    {"id"=>"2035505240",
      "type"=>"PullRequestEvent",
      "actor"=>
        {"id"=>287816,
          "login"=>"Araq",
          "gravatar_id"=>"ad1ada3bea74a6afab83d2e40da1dcf3",
          "url"=>"https://api.github.com/users/Araq",
          "avatar_url"=>"https://avatars.githubusercontent.com/u/287816?"},
      "repo"=>
        {"id"=>842037,
          "name"=>"Araq/Nimrod",
          "url"=>"https://api.github.com/repos/Araq/Nimrod"},
      "payload"=>
        {"action"=>"closed",
          "number"=>1045,
          "pull_request"=>
            {"url"=>"https://api.github.com/repos/Araq/Nimrod/pulls/1045",
              "id"=>14076724,
              "html_url"=>"https://github.com/Araq/Nimrod/pull/1045",
              "diff_url"=>"https://github.com/Araq/Nimrod/pull/1045.diff",
              "patch_url"=>"https://github.com/Araq/Nimrod/pull/1045.patch",
              "issue_url"=>"https://api.github.com/repos/Araq/Nimrod/issues/1045",
              "number"=>1045,
              "state"=>"closed",
              "title"=>"fixed doc comment",
              "user"=>
                {"login"=>"barcharcraz",
                  "id"=>1304509,
                  "avatar_url"=>"https://avatars.githubusercontent.com/u/1304509?",
                  "gravatar_id"=>"d99a965190cf8b04ee1c0ed8f5ade900",
                  "url"=>"https://api.github.com/users/barcharcraz",
                  "html_url"=>"https://github.com/barcharcraz",
                  "followers_url"=>"https://api.github.com/users/barcharcraz/followers",
                  "following_url"=>
                    "https://api.github.com/users/barcharcraz/following{/other_user}",
                  "gists_url"=>"https://api.github.com/users/barcharcraz/gists{/gist_id}",
                  "starred_url"=>
                    "https://api.github.com/users/barcharcraz/starred{/owner}{/repo}",
                  "subscriptions_url"=>
                    "https://api.github.com/users/barcharcraz/subscriptions",
                  "organizations_url"=>"https://api.github.com/users/barcharcraz/orgs",
                  "repos_url"=>"https://api.github.com/users/barcharcraz/repos",
                  "events_url"=>
                    "https://api.github.com/users/barcharcraz/events{/privacy}",
                  "received_events_url"=>
                    "https://api.github.com/users/barcharcraz/received_events",
                  "type"=>"User",
                  "site_admin"=>false},
              "body"=>"",
              "created_at"=>"2014-03-27T19:13:33Z",
              "updated_at"=>"2014-03-28T22:13:41Z",
              "closed_at"=>"2014-03-28T22:13:41Z",
              "merged_at"=>"2014-03-28T22:13:41Z",
              "merge_commit_sha"=>"95ec34c97568cda2d6ce788e6595c71b3a080b74",
              "assignee"=>nil,
              "milestone"=>nil,
              "commits_url"=>
                "https://api.github.com/repos/Araq/Nimrod/pulls/1045/commits",
              "review_comments_url"=>
                "https://api.github.com/repos/Araq/Nimrod/pulls/1045/comments",
              "review_comment_url"=>
                "https://api.github.com/repos/Araq/Nimrod/pulls/comments/{number}",
              "comments_url"=>
                "https://api.github.com/repos/Araq/Nimrod/issues/1045/comments",
              "statuses_url"=>
                "https://api.github.com/repos/Araq/Nimrod/statuses/138466038f1573526a9bf812d65dbe1663e80db1",
              "head"=>
                {"label"=>"barcharcraz:lowerBound",
                  "ref"=>"lowerBound",
                  "sha"=>"138466038f1573526a9bf812d65dbe1663e80db1",
                  "user"=>
                    {"login"=>"barcharcraz",
                      "id"=>1304509,
                      "avatar_url"=>"https://avatars.githubusercontent.com/u/1304509?",
                      "gravatar_id"=>"d99a965190cf8b04ee1c0ed8f5ade900",
                      "url"=>"https://api.github.com/users/barcharcraz",
                      "html_url"=>"https://github.com/barcharcraz",
                      "followers_url"=>"https://api.github.com/users/barcharcraz/followers",
                      "following_url"=>
                        "https://api.github.com/users/barcharcraz/following{/other_user}",
                      "gists_url"=>
                        "https://api.github.com/users/barcharcraz/gists{/gist_id}",
                      "starred_url"=>
                        "https://api.github.com/users/barcharcraz/starred{/owner}{/repo}",
                      "subscriptions_url"=>
                        "https://api.github.com/users/barcharcraz/subscriptions",
                      "organizations_url"=>"https://api.github.com/users/barcharcraz/orgs",
                      "repos_url"=>"https://api.github.com/users/barcharcraz/repos",
                      "events_url"=>
                        "https://api.github.com/users/barcharcraz/events{/privacy}",
                      "received_events_url"=>
                        "https://api.github.com/users/barcharcraz/received_events",
                      "type"=>"User",
                      "site_admin"=>false},
                  "repo"=>
                    {"id"=>15336496,
                      "name"=>"Nimrod",
                      "full_name"=>"barcharcraz/Nimrod",
                      "owner"=>
                        {"login"=>"barcharcraz",
                          "id"=>1304509,
                          "avatar_url"=>"https://avatars.githubusercontent.com/u/1304509?",
                          "gravatar_id"=>"d99a965190cf8b04ee1c0ed8f5ade900",
                          "url"=>"https://api.github.com/users/barcharcraz",
                          "html_url"=>"https://github.com/barcharcraz",
                          "followers_url"=>
                            "https://api.github.com/users/barcharcraz/followers",
                          "following_url"=>
                            "https://api.github.com/users/barcharcraz/following{/other_user}",
                          "gists_url"=>
                            "https://api.github.com/users/barcharcraz/gists{/gist_id}",
                          "starred_url"=>
                            "https://api.github.com/users/barcharcraz/starred{/owner}{/repo}",
                          "subscriptions_url"=>
                            "https://api.github.com/users/barcharcraz/subscriptions",
                          "organizations_url"=>
                            "https://api.github.com/users/barcharcraz/orgs",
                          "repos_url"=>"https://api.github.com/users/barcharcraz/repos",
                          "events_url"=>
                            "https://api.github.com/users/barcharcraz/events{/privacy}",
                          "received_events_url"=>
                            "https://api.github.com/users/barcharcraz/received_events",
                          "type"=>"User",
                          "site_admin"=>false},
                      "private"=>false,
                      "html_url"=>"https://github.com/barcharcraz/Nimrod",
                      "description"=>
                        "Nimrod is a compiled, garbage-collected systems programming language which has an excellent productivity/performance ratio. Nimrod's design focuses on efficiency, expressiveness, elegance (in the order of priority).",
                      "fork"=>true,
                      "url"=>"https://api.github.com/repos/barcharcraz/Nimrod",
                      "forks_url"=>"https://api.github.com/repos/barcharcraz/Nimrod/forks",
                      "keys_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/keys{/key_id}",
                      "collaborators_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/collaborators{/collaborator}",
                      "teams_url"=>"https://api.github.com/repos/barcharcraz/Nimrod/teams",
                      "hooks_url"=>"https://api.github.com/repos/barcharcraz/Nimrod/hooks",
                      "issue_events_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/issues/events{/number}",
                      "events_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/events",
                      "assignees_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/assignees{/user}",
                      "branches_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/branches{/branch}",
                      "tags_url"=>"https://api.github.com/repos/barcharcraz/Nimrod/tags",
                      "blobs_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/git/blobs{/sha}",
                      "git_tags_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/git/tags{/sha}",
                      "git_refs_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/git/refs{/sha}",
                      "trees_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/git/trees{/sha}",
                      "statuses_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/statuses/{sha}",
                      "languages_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/languages",
                      "stargazers_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/stargazers",
                      "contributors_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/contributors",
                      "subscribers_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/subscribers",
                      "subscription_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/subscription",
                      "commits_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/commits{/sha}",
                      "git_commits_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/git/commits{/sha}",
                      "comments_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/comments{/number}",
                      "issue_comment_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/issues/comments/{number}",
                      "contents_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/contents/{+path}",
                      "compare_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/compare/{base}...{head}",
                      "merges_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/merges",
                      "archive_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/{archive_format}{/ref}",
                      "downloads_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/downloads",
                      "issues_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/issues{/number}",
                      "pulls_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/pulls{/number}",
                      "milestones_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/milestones{/number}",
                      "notifications_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/notifications{?since,all,participating}",
                      "labels_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/labels{/name}",
                      "releases_url"=>
                        "https://api.github.com/repos/barcharcraz/Nimrod/releases{/id}",
                      "created_at"=>"2013-12-20T11:10:34Z",
                      "updated_at"=>"2014-03-28T22:13:41Z",
                      "pushed_at"=>"2014-03-27T19:13:10Z",
                      "git_url"=>"git://github.com/barcharcraz/Nimrod.git",
                      "ssh_url"=>"git@github.com:barcharcraz/Nimrod.git",
                      "clone_url"=>"https://github.com/barcharcraz/Nimrod.git",
                      "svn_url"=>"https://github.com/barcharcraz/Nimrod",
                      "homepage"=>"http://nimrod-lang.org/",
                      "size"=>322697,
                      "stargazers_count"=>0,
                      "watchers_count"=>0,
                      "language"=>"Nimrod",
                      "has_issues"=>false,
                      "has_downloads"=>true,
                      "has_wiki"=>true,
                      "forks_count"=>0,
                      "mirror_url"=>nil,
                      "open_issues_count"=>0,
                      "forks"=>0,
                      "open_issues"=>0,
                      "watchers"=>0,
                      "default_branch"=>"master",
                      "master_branch"=>"master"}},
              "base"=>
                {"label"=>"Araq:devel",
                  "ref"=>"devel",
                  "sha"=>"19839040b750517cb50afc15f6316bea86dd8288",
                  "user"=>
                    {"login"=>"Araq",
                      "id"=>287816,
                      "avatar_url"=>"https://avatars.githubusercontent.com/u/287816?",
                      "gravatar_id"=>"ad1ada3bea74a6afab83d2e40da1dcf3",
                      "url"=>"https://api.github.com/users/Araq",
                      "html_url"=>"https://github.com/Araq",
                      "followers_url"=>"https://api.github.com/users/Araq/followers",
                      "following_url"=>
                        "https://api.github.com/users/Araq/following{/other_user}",
                      "gists_url"=>"https://api.github.com/users/Araq/gists{/gist_id}",
                      "starred_url"=>
                        "https://api.github.com/users/Araq/starred{/owner}{/repo}",
                      "subscriptions_url"=>
                        "https://api.github.com/users/Araq/subscriptions",
                      "organizations_url"=>"https://api.github.com/users/Araq/orgs",
                      "repos_url"=>"https://api.github.com/users/Araq/repos",
                      "events_url"=>"https://api.github.com/users/Araq/events{/privacy}",
                      "received_events_url"=>
                        "https://api.github.com/users/Araq/received_events",
                      "type"=>"User",
                      "site_admin"=>false},
                  "repo"=>
                    {"id"=>842037,
                      "name"=>"Nimrod",
                      "full_name"=>"Araq/Nimrod",
                      "owner"=>
                        {"login"=>"Araq",
                          "id"=>287816,
                          "avatar_url"=>"https://avatars.githubusercontent.com/u/287816?",
                          "gravatar_id"=>"ad1ada3bea74a6afab83d2e40da1dcf3",
                          "url"=>"https://api.github.com/users/Araq",
                          "html_url"=>"https://github.com/Araq",
                          "followers_url"=>"https://api.github.com/users/Araq/followers",
                          "following_url"=>
                            "https://api.github.com/users/Araq/following{/other_user}",
                          "gists_url"=>"https://api.github.com/users/Araq/gists{/gist_id}",
                          "starred_url"=>
                            "https://api.github.com/users/Araq/starred{/owner}{/repo}",
                          "subscriptions_url"=>
                            "https://api.github.com/users/Araq/subscriptions",
                          "organizations_url"=>"https://api.github.com/users/Araq/orgs",
                          "repos_url"=>"https://api.github.com/users/Araq/repos",
                          "events_url"=>"https://api.github.com/users/Araq/events{/privacy}",
                          "received_events_url"=>
                            "https://api.github.com/users/Araq/received_events",
                          "type"=>"User",
                          "site_admin"=>false},
                      "private"=>false,
                      "html_url"=>"https://github.com/Araq/Nimrod",
                      "description"=>
                        "Nimrod is a compiled, garbage-collected systems programming language which has an excellent productivity/performance ratio. Nimrod's design focuses on efficiency, expressiveness, elegance (in the order of priority).",
                      "fork"=>false,
                      "url"=>"https://api.github.com/repos/Araq/Nimrod",
                      "forks_url"=>"https://api.github.com/repos/Araq/Nimrod/forks",
                      "keys_url"=>"https://api.github.com/repos/Araq/Nimrod/keys{/key_id}",
                      "collaborators_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/collaborators{/collaborator}",
                      "teams_url"=>"https://api.github.com/repos/Araq/Nimrod/teams",
                      "hooks_url"=>"https://api.github.com/repos/Araq/Nimrod/hooks",
                      "issue_events_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/issues/events{/number}",
                      "events_url"=>"https://api.github.com/repos/Araq/Nimrod/events",
                      "assignees_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/assignees{/user}",
                      "branches_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/branches{/branch}",
                      "tags_url"=>"https://api.github.com/repos/Araq/Nimrod/tags",
                      "blobs_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/git/blobs{/sha}",
                      "git_tags_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/git/tags{/sha}",
                      "git_refs_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/git/refs{/sha}",
                      "trees_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/git/trees{/sha}",
                      "statuses_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/statuses/{sha}",
                      "languages_url"=>"https://api.github.com/repos/Araq/Nimrod/languages",
                      "stargazers_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/stargazers",
                      "contributors_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/contributors",
                      "subscribers_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/subscribers",
                      "subscription_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/subscription",
                      "commits_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/commits{/sha}",
                      "git_commits_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/git/commits{/sha}",
                      "comments_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/comments{/number}",
                      "issue_comment_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/issues/comments/{number}",
                      "contents_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/contents/{+path}",
                      "compare_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/compare/{base}...{head}",
                      "merges_url"=>"https://api.github.com/repos/Araq/Nimrod/merges",
                      "archive_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/{archive_format}{/ref}",
                      "downloads_url"=>"https://api.github.com/repos/Araq/Nimrod/downloads",
                      "issues_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/issues{/number}",
                      "pulls_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/pulls{/number}",
                      "milestones_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/milestones{/number}",
                      "notifications_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/notifications{?since,all,participating}",
                      "labels_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/labels{/name}",
                      "releases_url"=>
                        "https://api.github.com/repos/Araq/Nimrod/releases{/id}",
                      "created_at"=>"2010-08-16T20:38:58Z",
                      "updated_at"=>"2014-03-28T22:13:41Z",
                      "pushed_at"=>"2014-03-28T22:13:41Z",
                      "git_url"=>"git://github.com/Araq/Nimrod.git",
                      "ssh_url"=>"git@github.com:Araq/Nimrod.git",
                      "clone_url"=>"https://github.com/Araq/Nimrod.git",
                      "svn_url"=>"https://github.com/Araq/Nimrod",
                      "homepage"=>"http://nimrod-lang.org/",
                      "size"=>333166,
                      "stargazers_count"=>531,
                      "watchers_count"=>531,
                      "language"=>"Nimrod",
                      "has_issues"=>true,
                      "has_downloads"=>true,
                      "has_wiki"=>true,
                      "forks_count"=>82,
                      "mirror_url"=>nil,
                      "open_issues_count"=>256,
                      "forks"=>82,
                      "open_issues"=>256,
                      "watchers"=>531,
                      "default_branch"=>"devel",
                      "master_branch"=>"devel"}},
              "_links"=>
                {"self"=>{"href"=>"https://api.github.com/repos/Araq/Nimrod/pulls/1045"},
                  "html"=>{"href"=>"https://github.com/Araq/Nimrod/pull/1045"},
                  "issue"=>
                    {"href"=>"https://api.github.com/repos/Araq/Nimrod/issues/1045"},
                  "comments"=>
                    {"href"=>
                      "https://api.github.com/repos/Araq/Nimrod/issues/1045/comments"},
                  "review_comments"=>
                    {"href"=>
                      "https://api.github.com/repos/Araq/Nimrod/pulls/1045/comments"},
                  "review_comment"=>
                    {"href"=>
                      "https://api.github.com/repos/Araq/Nimrod/pulls/comments/{number}"},
                  "commits"=>
                    {"href"=>
                      "https://api.github.com/repos/Araq/Nimrod/pulls/1045/commits"},
                  "statuses"=>
                    {"href"=>
                      "https://api.github.com/repos/Araq/Nimrod/statuses/138466038f1573526a9bf812d65dbe1663e80db1"}},
              "merged"=>true,
              "mergeable"=>nil,
              "mergeable_state"=>"unknown",
              "merged_by"=>
                {"login"=>"Araq",
                  "id"=>287816,
                  "avatar_url"=>"https://avatars.githubusercontent.com/u/287816?",
                  "gravatar_id"=>"ad1ada3bea74a6afab83d2e40da1dcf3",
                  "url"=>"https://api.github.com/users/Araq",
                  "html_url"=>"https://github.com/Araq",
                  "followers_url"=>"https://api.github.com/users/Araq/followers",
                  "following_url"=>
                    "https://api.github.com/users/Araq/following{/other_user}",
                  "gists_url"=>"https://api.github.com/users/Araq/gists{/gist_id}",
                  "starred_url"=>
                    "https://api.github.com/users/Araq/starred{/owner}{/repo}",
                  "subscriptions_url"=>"https://api.github.com/users/Araq/subscriptions",
                  "organizations_url"=>"https://api.github.com/users/Araq/orgs",
                  "repos_url"=>"https://api.github.com/users/Araq/repos",
                  "events_url"=>"https://api.github.com/users/Araq/events{/privacy}",
                  "received_events_url"=>
                    "https://api.github.com/users/Araq/received_events",
                  "type"=>"User",
                  "site_admin"=>false},
              "comments"=>0,
              "review_comments"=>0,
              "commits"=>1,
              "additions"=>5,
              "deletions"=>4,
              "changed_files"=>1}},
      "public"=>true,
      "created_at"=>"2014-03-28T22:13:42Z"}
  end

  let(:fork_event) do
    {"id"=>"2035505276",
      "type"=>"ForkEvent",
      "actor"=>
        {"id"=>54712,
          "login"=>"shouze",
          "gravatar_id"=>"54f4a2b7ba6082fc878cb1343bdecad4",
          "url"=>"https://api.github.com/users/shouze",
          "avatar_url"=>"https://avatars.githubusercontent.com/u/54712?"},
      "repo"=>
        {"id"=>12537628,
          "name"=>"lukagabric/LASIImageView",
          "url"=>"https://api.github.com/repos/lukagabric/LASIImageView"},
      "payload"=>
        {"forkee"=>
          {"id"=>18228062,
            "name"=>"LASIImageView",
            "full_name"=>"shouze/LASIImageView",
            "owner"=>
              {"login"=>"shouze",
                "id"=>54712,
                "avatar_url"=>"https://avatars.githubusercontent.com/u/54712?",
                "gravatar_id"=>"54f4a2b7ba6082fc878cb1343bdecad4",
                "url"=>"https://api.github.com/users/shouze",
                "html_url"=>"https://github.com/shouze",
                "followers_url"=>"https://api.github.com/users/shouze/followers",
                "following_url"=>
                  "https://api.github.com/users/shouze/following{/other_user}",
                "gists_url"=>"https://api.github.com/users/shouze/gists{/gist_id}",
                "starred_url"=>
                  "https://api.github.com/users/shouze/starred{/owner}{/repo}",
                "subscriptions_url"=>
                  "https://api.github.com/users/shouze/subscriptions",
                "organizations_url"=>"https://api.github.com/users/shouze/orgs",
                "repos_url"=>"https://api.github.com/users/shouze/repos",
                "events_url"=>"https://api.github.com/users/shouze/events{/privacy}",
                "received_events_url"=>
                  "https://api.github.com/users/shouze/received_events",
                "type"=>"User",
                "site_admin"=>false},
            "private"=>false,
            "html_url"=>"https://github.com/shouze/LASIImageView",
            "description"=>
              "iOS UIImageView subclass - download image with different progress indicators",
            "fork"=>true,
            "url"=>"https://api.github.com/repos/shouze/LASIImageView",
            "forks_url"=>"https://api.github.com/repos/shouze/LASIImageView/forks",
            "keys_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/keys{/key_id}",
            "collaborators_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/collaborators{/collaborator}",
            "teams_url"=>"https://api.github.com/repos/shouze/LASIImageView/teams",
            "hooks_url"=>"https://api.github.com/repos/shouze/LASIImageView/hooks",
            "issue_events_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/issues/events{/number}",
            "events_url"=>"https://api.github.com/repos/shouze/LASIImageView/events",
            "assignees_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/assignees{/user}",
            "branches_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/branches{/branch}",
            "tags_url"=>"https://api.github.com/repos/shouze/LASIImageView/tags",
            "blobs_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/git/blobs{/sha}",
            "git_tags_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/git/tags{/sha}",
            "git_refs_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/git/refs{/sha}",
            "trees_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/git/trees{/sha}",
            "statuses_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/statuses/{sha}",
            "languages_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/languages",
            "stargazers_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/stargazers",
            "contributors_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/contributors",
            "subscribers_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/subscribers",
            "subscription_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/subscription",
            "commits_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/commits{/sha}",
            "git_commits_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/git/commits{/sha}",
            "comments_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/comments{/number}",
            "issue_comment_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/issues/comments/{number}",
            "contents_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/contents/{+path}",
            "compare_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/compare/{base}...{head}",
            "merges_url"=>"https://api.github.com/repos/shouze/LASIImageView/merges",
            "archive_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/{archive_format}{/ref}",
            "downloads_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/downloads",
            "issues_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/issues{/number}",
            "pulls_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/pulls{/number}",
            "milestones_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/milestones{/number}",
            "notifications_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/notifications{?since,all,participating}",
            "labels_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/labels{/name}",
            "releases_url"=>
              "https://api.github.com/repos/shouze/LASIImageView/releases{/id}",
            "created_at"=>"2014-03-28T22:13:43Z",
            "updated_at"=>"2014-03-27T05:43:18Z",
            "pushed_at"=>"2014-03-23T18:45:21Z",
            "git_url"=>"git://github.com/shouze/LASIImageView.git",
            "ssh_url"=>"git@github.com:shouze/LASIImageView.git",
            "clone_url"=>"https://github.com/shouze/LASIImageView.git",
            "svn_url"=>"https://github.com/shouze/LASIImageView",
            "homepage"=>
              "http://lukagabric.com/lasiimageview-download-image-with-progress-indicator/",
            "size"=>268,
            "stargazers_count"=>0,
            "watchers_count"=>0,
            "language"=>"Objective-C",
            "has_issues"=>false,
            "has_downloads"=>true,
            "has_wiki"=>true,
            "forks_count"=>0,
            "mirror_url"=>nil,
            "open_issues_count"=>0,
            "forks"=>0,
            "open_issues"=>0,
            "watchers"=>0,
            "default_branch"=>"master",
            "master_branch"=>"master",
            "public"=>true}},
      "public"=>true,
      "created_at"=>"2014-03-28T22:13:44Z"}
  end

  let(:member_event) do
    {"id"=>"2035505294",
      "type"=>"MemberEvent",
      "actor"=>
        {"id"=>2193580,
          "login"=>"damianpv",
          "gravatar_id"=>"a17fb3e25ab34b746af958d791df762d",
          "url"=>"https://api.github.com/users/damianpv",
          "avatar_url"=>"https://avatars.githubusercontent.com/u/2193580?"},
      "repo"=>
        {"id"=>17986608,
          "name"=>"damianpv/skeleton_django",
          "url"=>"https://api.github.com/repos/damianpv/skeleton_django"},
      "payload"=>
        {"member"=>
          {"login"=>"ezequielmg",
            "id"=>611318,
            "avatar_url"=>"https://avatars.githubusercontent.com/u/611318?",
            "gravatar_id"=>"ddc2d5082fe4b20b7c76a6bdaaaa5a2a",
            "url"=>"https://api.github.com/users/ezequielmg",
            "html_url"=>"https://github.com/ezequielmg",
            "followers_url"=>"https://api.github.com/users/ezequielmg/followers",
            "following_url"=>
              "https://api.github.com/users/ezequielmg/following{/other_user}",
            "gists_url"=>"https://api.github.com/users/ezequielmg/gists{/gist_id}",
            "starred_url"=>
              "https://api.github.com/users/ezequielmg/starred{/owner}{/repo}",
            "subscriptions_url"=>
              "https://api.github.com/users/ezequielmg/subscriptions",
            "organizations_url"=>"https://api.github.com/users/ezequielmg/orgs",
            "repos_url"=>"https://api.github.com/users/ezequielmg/repos",
            "events_url"=>"https://api.github.com/users/ezequielmg/events{/privacy}",
            "received_events_url"=>
              "https://api.github.com/users/ezequielmg/received_events",
            "type"=>"User",
            "site_admin"=>false},
          "action"=>"added"},
      "public"=>true,
      "created_at"=>"2014-03-28T22:13:45Z"}
  end

  let(:issues_event) do
    {"id"=>"2035575982",
      "type"=>"IssuesEvent",
      "actor"=>
        {"id"=>1280380,
          "login"=>"Yoshi2889",
          "gravatar_id"=>"7fae3a0428b45a5268b58c57a097749d",
          "url"=>"https://api.github.com/users/Yoshi2889",
          "avatar_url"=>"https://avatars.githubusercontent.com/u/1280380?"},
      "repo"=>
        {"id"=>6723956,
          "name"=>"Yoshi2889/smf-2.0-mods",
          "url"=>"https://api.github.com/repos/Yoshi2889/smf-2.0-mods"},
      "payload"=>
        {"action"=>"opened",
          "issue"=>
            {"url"=>"https://api.github.com/repos/Yoshi2889/smf-2.0-mods/issues/2",
              "labels_url"=>
                "https://api.github.com/repos/Yoshi2889/smf-2.0-mods/issues/2/labels{/name}",
              "comments_url"=>
                "https://api.github.com/repos/Yoshi2889/smf-2.0-mods/issues/2/comments",
              "events_url"=>
                "https://api.github.com/repos/Yoshi2889/smf-2.0-mods/issues/2/events",
              "html_url"=>"https://github.com/Yoshi2889/smf-2.0-mods/issues/2",
              "id"=>30430272,
              "number"=>2,
              "title"=>
                "Back To The Index: Prevent using file edits with a separate language file",
              "user"=>
                {"login"=>"Yoshi2889",
                  "id"=>1280380,
                  "avatar_url"=>"https://avatars.githubusercontent.com/u/1280380?",
                  "gravatar_id"=>"7fae3a0428b45a5268b58c57a097749d",
                  "url"=>"https://api.github.com/users/Yoshi2889",
                  "html_url"=>"https://github.com/Yoshi2889",
                  "followers_url"=>"https://api.github.com/users/Yoshi2889/followers",
                  "following_url"=>
                    "https://api.github.com/users/Yoshi2889/following{/other_user}",
                  "gists_url"=>"https://api.github.com/users/Yoshi2889/gists{/gist_id}",
                  "starred_url"=>
                    "https://api.github.com/users/Yoshi2889/starred{/owner}{/repo}",
                  "subscriptions_url"=>
                    "https://api.github.com/users/Yoshi2889/subscriptions",
                  "organizations_url"=>"https://api.github.com/users/Yoshi2889/orgs",
                  "repos_url"=>"https://api.github.com/users/Yoshi2889/repos",
                  "events_url"=>"https://api.github.com/users/Yoshi2889/events{/privacy}",
                  "received_events_url"=>
                    "https://api.github.com/users/Yoshi2889/received_events",
                  "type"=>"User",
                  "site_admin"=>false},
              "labels"=>[],
              "state"=>"open",
              "assignee"=>nil,
              "milestone"=>nil,
              "comments"=>0,
              "created_at"=>"2014-03-28T23:26:18Z",
              "updated_at"=>"2014-03-28T23:26:18Z",
              "closed_at"=>nil,
              "pull_request"=>
                {"url"=>nil, "html_url"=>nil, "diff_url"=>nil, "patch_url"=>nil},
              "body"=>
                "http://www.simplemachines.org/community/index.php?topic=460756.msg3617798#msg3617798\r\n\r\nDump all strings into a different language file and we'll have a mod that doesn't edit any files."}},
      "public"=>true,
      "created_at"=>"2014-03-28T23:26:18Z"}
  end

  let(:events) { [issue_comment_event, pull_request_event, fork_event, member_event] }

  before { Github::Event.stub(:get_current_events) { events } }

  describe '::process_event' do

    it 'should sync and load repository if present' do
      event = { 'repo' => { 'name' => 'Rocket Man' } }
      Github::Event.stub(:tracker).once
      Github::Event.process_event event
    end

    it 'should sync and load author if present' do
      event = { 'actor' => { 'name' => 'Rocket Man' } }
      Github::Event.stub(:linked_account).once
      Github::Event.process_event event
    end

    it 'should sync and load organization if present' do
      event = { 'org' => { 'name' => 'Rocket Man' } }
      Github::Event.stub(:linked_account).once
      Github::Event.process_event event
    end

    describe 'IssueCommentEvent' do

      let(:event_data) do
        {"id"=>"2036623927",
          "type"=>"IssueCommentEvent",
          "actor"=>
            {"id"=>142658,
              "login"=>"ADmad",
              "gravatar_id"=>"376c87d7f023547d22227f2e25279591",
              "url"=>"https://api.github.com/users/ADmad",
              "avatar_url"=>"https://avatars.githubusercontent.com/u/142658?"},
          "repo"=>
            {"id"=>656494,
              "name"=>"cakephp/cakephp",
              "url"=>"https://api.github.com/repos/cakephp/cakephp"},
          "payload"=>
            {"action"=>"created",
              "issue"=>
                {"url"=>"https://api.github.com/repos/cakephp/cakephp/issues/3177",
                  "labels_url"=>
                    "https://api.github.com/repos/cakephp/cakephp/issues/3177/labels{/name}",
                  "comments_url"=>
                    "https://api.github.com/repos/cakephp/cakephp/issues/3177/comments",
                  "events_url"=>
                    "https://api.github.com/repos/cakephp/cakephp/issues/3177/events",
                  "html_url"=>"https://github.com/cakephp/cakephp/pull/3177",
                  "id"=>30472214,
                  "number"=>3177,
                  "title"=>"WIP - 3.0 Removal of component properties.",
                  "user"=>
                    {"login"=>"ADmad",
                      "id"=>142658,
                      "avatar_url"=>"https://avatars.githubusercontent.com/u/142658?",
                      "gravatar_id"=>"376c87d7f023547d22227f2e25279591",
                      "url"=>"https://api.github.com/users/ADmad",
                      "html_url"=>"https://github.com/ADmad",
                      "followers_url"=>"https://api.github.com/users/ADmad/followers",
                      "following_url"=>
                        "https://api.github.com/users/ADmad/following{/other_user}",
                      "gists_url"=>"https://api.github.com/users/ADmad/gists{/gist_id}",
                      "starred_url"=>
                        "https://api.github.com/users/ADmad/starred{/owner}{/repo}",
                      "subscriptions_url"=>"https://api.github.com/users/ADmad/subscriptions",
                      "organizations_url"=>"https://api.github.com/users/ADmad/orgs",
                      "repos_url"=>"https://api.github.com/users/ADmad/repos",
                      "events_url"=>"https://api.github.com/users/ADmad/events{/privacy}",
                      "received_events_url"=>
                        "https://api.github.com/users/ADmad/received_events",
                      "type"=>"User",
                      "site_admin"=>false},
                  "labels"=>[],
                  "state"=>"open",
                  "assignee"=>nil,
                  "milestone"=>nil,
                  "comments"=>2,
                  "created_at"=>"2014-03-30T19:12:57Z",
                  "updated_at"=>"2014-03-30T20:11:26Z",
                  "closed_at"=>nil,
                  "pull_request"=>
                    {"url"=>"https://api.github.com/repos/cakephp/cakephp/pulls/3177",
                      "html_url"=>"https://github.com/cakephp/cakephp/pull/3177",
                      "diff_url"=>"https://github.com/cakephp/cakephp/pull/3177.diff",
                      "patch_url"=>"https://github.com/cakephp/cakephp/pull/3177.patch"},
                  "body"=>
                    "Refs #3122\r\n\r\nStarted with AuthComponent, other's to follow."},
              "comment"=>
                {"url"=>
                  "https://api.github.com/repos/cakephp/cakephp/issues/comments/39037791",
                  "html_url"=>
                    "https://github.com/cakephp/cakephp/pull/3177#issuecomment-39037791",
                  "issue_url"=>"https://api.github.com/repos/cakephp/cakephp/issues/3177",
                  "id"=>39037791,
                  "user"=>
                    {"login"=>"ADmad",
                      "id"=>142658,
                      "avatar_url"=>"https://avatars.githubusercontent.com/u/142658?",
                      "gravatar_id"=>"376c87d7f023547d22227f2e25279591",
                      "url"=>"https://api.github.com/users/ADmad",
                      "html_url"=>"https://github.com/ADmad",
                      "followers_url"=>"https://api.github.com/users/ADmad/followers",
                      "following_url"=>
                        "https://api.github.com/users/ADmad/following{/other_user}",
                      "gists_url"=>"https://api.github.com/users/ADmad/gists{/gist_id}",
                      "starred_url"=>
                        "https://api.github.com/users/ADmad/starred{/owner}{/repo}",
                      "subscriptions_url"=>"https://api.github.com/users/ADmad/subscriptions",
                      "organizations_url"=>"https://api.github.com/users/ADmad/orgs",
                      "repos_url"=>"https://api.github.com/users/ADmad/repos",
                      "events_url"=>"https://api.github.com/users/ADmad/events{/privacy}",
                      "received_events_url"=>
                        "https://api.github.com/users/ADmad/received_events",
                      "type"=>"User",
                      "site_admin"=>false},
                  "created_at"=>"2014-03-30T20:11:26Z",
                  "updated_at"=>"2014-03-30T20:11:26Z",
                  "body"=>
                    "@lorenzo Once I have gotten rid of all properties we can decide which config are used frequently or important enough to require their own methods."}},
          "public"=>true,
          "created_at"=>"2014-03-30T20:11:27Z",
          "org"=>
            {"id"=>23666,
              "login"=>"cakephp",
              "gravatar_id"=>"12cd092be901674cdbf0d3d964e945d5",
              "url"=>"https://api.github.com/orgs/cakephp",
              "avatar_url"=>"https://avatars.githubusercontent.com/u/23666?"}}
      end

      let(:action) { lambda { Github::Event.process_event event_data } }

      it 'should create repository' do
        expect(action).to change(Github::Repository, :count).by 1
      end

      it 'should create actor' do
        expect(action).to change(LinkedAccount::Github::User, :count).by 1
      end

      it 'should create organization' do
        expect(action).to change(LinkedAccount::Github::Organization, :count).by 1
      end

      it 'should create issue' do
        expect(action).to change(Github::Issue, :count).by 1
      end

      it 'should create comment' do
        expect(action).to change(Comment, :count).by 1
      end

      describe 'Tracker exists, Issue does not' do

        let(:repo_data) { event_data['repo'] }

        before do
          create(:github_repository,
            remote_id: repo_data['id'],
            name: repo_data['name']
          )
        end

        it 'should not create tracker' do
          expect(action).not_to change(Github::Repository, :count)
        end

        it 'should create issue' do
          expect(action).to change(Github::Issue, :count).by 1
        end

      end

      describe 'Issue exists' do

        let(:issue_data) { event_data['payload']['issue'] }

        before do
          create(:github_issue,
            remote_id: issue_data['id'],
            url: issue_data['html_url']
          )
        end

        it 'should not create issue' do
          expect(action).not_to change(Github::Issue, :count)
        end

      end

      describe 'Actor exists' do

        let(:actor_data) { event_data['actor'] }

        before do
          create(:github_account,
            type: 'LinkedAccount::Github::User',
            uid: actor_data['id'],
            login: actor_data['login']
          )
        end

        it 'should not create actor' do
          expect(action).not_to change(LinkedAccount::Github::User, :count)
        end

      end

      describe 'Organization exists' do

        let(:org_data) { event_data['org'] }

        before do
          create(:github_account,
            type: 'LinkedAccount::Github::Organization',
            uid: org_data['id'],
            login: org_data['login']
          )
        end

        it 'should not create org' do
          expect(action).not_to change(LinkedAccount::Github::Organization, :count)
        end

      end

    end

    describe 'PullRequestEvent' do

      it 'should invoke ::issue, ::tracker, and ::linked_account' do
        Github::Event.should_not_receive(:issue)
        Github::Event.should_receive(:tracker).at_least(:twice)
        Github::Event.should_receive(:linked_account).at_least(:twice)
        Github::Event.process_event pull_request_event
      end

    end

    describe 'IssuesEvent' do

      it 'should invoke ::issue' do
        Github::Event.should_receive(:issue).at_least(:once)
        Github::Event.process_event issues_event
      end

    end

    describe 'ForkEvent' do

      it 'should invoke ::tracker' do
        Github::Event.should_receive(:tracker).at_least(:once)
        Github::Event.process_event fork_event
      end

    end

    describe 'MemberEvent' do

      it 'should invoke ::linked_account' do
        Github::Event.should_receive(:linked_account).at_least(:once)
        Github::Event.process_event member_event
      end

    end

  end

  describe '::issue' do

    it 'should update issue from data' do
      Github::Issue.stub(:update_attributes_from_github_data).once
      Github::Event.issue({})
    end

  end

  describe '::tracker' do

    it 'should update tracker from data' do
      Github::Repository.should_receive(:update_attributes_from_github_data).once
      Github::Event.tracker({})
    end

  end

  describe '::linked_account' do

    it 'should update linked_account from data' do
      LinkedAccount::Github.should_receive(:update_attributes_from_github_data).once
      Github::Event.linked_account({})
    end

  end

end
