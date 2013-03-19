with (scope('About', 'App')) {

  route('#about', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "Bountysource"),
        "About"
      ),

      p("Bountysource was originally created in 2004 with the hope of increasing and improving development in open-source software communities. The ", a({ href: 'https://old.bountysource.com', target: 'blank'}, "first iteration of Bountysource"), " provided a variety of tools that allowed for easy management of open-source projects. Some of these tools included a Task Tracker, an SVN Code Repository, and a Content Management System."),
      
      p("Bountysource was way ahead of its time...we'd like to think of it as a predecessor to ", a({ href: 'https://www.github.com', target: 'blank' }, "GitHub"), "."),
      
      p("After a lengthy hiatus, we're back with the same vision - overall improvement in open-source software development - but a completely different system."),
      
      p("We're shifting our focus from project hosting - repositories, issue tracking and all - to the crowdfunding aspect of Bountysource's original idea."),
      
      h1("How does it work?"),
      
      p(b("In a nutsell, Bountysource incentivizes developers to solve open issues by offering monetary rewards:")),
      
      p("Anyone can come to Bountysource and browse through open-source projects that are on GitHub (we'll be adding support for other issue trackers like Trac, Bugzilla and Jenkins in the future)."),
      
      p("Once they've found a project they want to support, they can browse through that project's oustanding issues. After picking an issue they want resolved, they can post a monetary bounty on the issue, encouraging other developers to come and work on a solution. This person is now a ", b("backer"), "."),
      
      p("Bountysource stores this bounty (or bounties - other backers are encouraged to create bounties on the same issue) for a maximum of six months. If the issue isn't resolved within this period, the backers are refunded."),
      
      p("On the other hand, a ", b("developer"), " looking to earn some extra cash could come to Bountysource and browse through issues that already have bounties on them."),
      
      p("Once they've identified an issue they know they can solve, they can create an Issue Branch and begin working on a solution. Once they're done, they submit a pull request through Bountysource to the project committers on GitHub."),
      
      p(i("For more information, check out our ", a({ href: 'https://www.bountysource.com/#faq', target: 'blank'}, "FAQ"), "."))
    );
  });
}