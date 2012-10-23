with (scope('Faq', 'App')) {
  define('faq_sections', function() {
    return table({ style: 'margin-bottom: 20px' },
      tr(
        td({ style: 'width: 33%; border-top: 0'},
          div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
            h1({style: 'text-align: center; font-size: 20px; margin: 0'}, "BACKERS"),
            p("Do you want to fund your favorite open-source projects?"),
            a({ 'class': 'blue', href: '#faq/backers' }, "Learn More")
          )
        ),

        td({ style: 'width: 33%; border-top: 0'},
          div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
            h1({style: 'text-align: center; font-size: 20px; margin: 0'}, "DEVELOPERS"),
            p("Do you want to earn money while working on open-source projects?"),
            a({ 'class': 'blue', href: '#faq/developers' }, "Learn More")
          )
        ),
        
        td({ style: 'width: 33%; border-top: 0'},
          div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
            h1({style: 'text-align: center; font-size: 20px; margin: 0'}, "COMMITTERS"),
            p("Do you commit code to existing open-source projects?"),
            a({ 'class': 'blue', href: '#faq/committers' }, "Learn More")
          )
        )
      )
    );
  });

  route('#faq', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        "Frequently Asked Questions"
      ),

      faq_sections()
    )
  });


  route('#faq/committers', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        a({ href: '#faq' }, "Frequently Asked Questions"),
        "Committers"
      ),

      faq_sections(),
      
      section({ id: 'faq' },
        dl(
          dt("Who is a committer?"),
          dd("Any ", a({ href: 'https://help.github.com/articles/what-are-the-different-access-permissions', target: 'blank'}, "Github user"), " who can merge pull requests into a project."),
      
          dt("Why should I use BountySource for my project?"),
          dd(
            'There are several benefits to using BountySource:',
            ul(
              li(u('Increase development.'), ' Encourage developers to submit quality pull requests more frequently by creating bounties on existing issues.'),
              li(u('Close issues faster.'), ' Incentivize unpopular but necessary issues by adding higher bounties on them.'),
              li(u('Earn money.'), ' As a project committer, you are still eligible to work on issues and collect bounties within your own project. ')
            )
          ),

          dt("How does BountySource work?"),
          dd("It begins with a backer (or group of backers) creating a bounty on a pre-existing GitHub issue (typically a feature request or bug fix). Then, developers can come to BountySource, browse through bounties and begin working on an issue they know they can solve."),
          dd("Once a developer finishes working on the fix, he or she will submit a pull request. When and if a committer accepts the pull request, the developer is awarded the bounty."),
      
          dt("...so, what's my role in all of this?"),
          dd("The more developers there are working on issues within your project, the more pull requests you will receive. You don't need to do anything out of the ordinary - just let your community know about the bounties, check for and merge pull requests as normal, and we take care of the rest."),
                  
          dt("Can I work on issues and collect bounties within my own project?"),
          dd("Yes."),
    
          dt("Who can collect a bounty?"),
          dd("Anybody who has a GitHub account.")
        )
      )
    )
  });



  route('#faq/developers', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        a({ href: '#faq' }, "Frequently Asked Questions"),
        "Developers"
      ),

      faq_sections(),
      
      section({ id: 'faq' },
        dl(
          dt("How do you know a project committer will accept any pull requests at all?"),
          dd("We don't guarantee this, but one of the main points of open-source software and making code public is to foster improvement. Committers are always monitoring pull requests, and they likely will accept any and all code they feel is of quality."),

          dt("How do I know if my solution has been accepted or rejected?"),
          dd("You can view the status of each of your submissions from your ", a({ href: '<%= Api::Application.config.www_url %>#issue_branches', target: 'blank' }, "Issue Branches page"), "."),        
    
          dt("How do you determine who earns the bounty?"),
          dd("Once a Github issue has been closed, BountySource awards the bounty to the developer whose pull request was merged."),
        
          dt("How do I begin working on a solution?"),                                                                                                                                                                                                             
          dd("Once you've decided on an issue you'd like to work on, simply view it on BountySource and click on 'Create Issue Branch'."),
      
          dt("When does payout occur?"),
          dd("Once an issue is closed, we hold the bounty for a two-week dispute period. This is when backers and other developers can verify that the merged code does what it should. If there are no outstanding disputes at the end of this period, the winning developer can collect the bounty."),
        
          dt("How do I receive payment?"),
          dd("You can receive payment via Paypal or a physical check. Before collecting a bounty, you need to fill out the Payment Information portion of your profile."),

          dt("What does it cost to collect a bounty?"),
          dd("BountySource charges a 10% non-refundable fee upon payout. This covers costs like credit card processing fees, servers, bandwidth, and other expenses."),
        
          dt("What can I do with my earnings?"),
          dd(
            'What you do with your money is completely up to you. You can either collect your full 90%, or make donations:',
            ul(
              li(u('To charity.'), " We support charities like ", a({ href: 'https://www.eff.org/', target: 'blank' }, "EFF"), "."),
              li(u('Back into the project. '), ' Project committers will be able to use this money to create more bounties on existing issues within the project. (That you could earn again!)'),
              li(u('To BountySource.'), ' :-)')
            )
          ),
        
          dt("Do I have to pay taxes on the bounties I collect?"),
          dd("If you are in the United States and payments made to you are more than $600 for the year, we are required to issue you a Form 1099 to report the payments, which will require you to complete a Form W-9. You should consult your tax advisor as to the taxability of the payments."),
        
          dt("What is your relationship with Github?"),
          dd("We are an independent developer using the ", a({ href: 'http://developer.github.com/v3/oauth/', target: 'blank' }, "GitHub API"), ".")
        )
      )
    );
  });


  route('#faq/backers', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        a({ href: '#faq' }, "Frequently Asked Questions"),
        "Backers"
      ),

      faq_sections(),
      
      section({ id: 'faq' },
        dl(
          dt("Who is a backer?"),
          dd("A backer is anyone who creates a bounty on an issue."),
        
          dt("What is a bounty?"),
          dd("A bounty is money offered up as a reward for successfully resolving an open issue."),
        
          dt("Who can create a bounty?"),
          dd("Anybody who has a PayPal or Google Wallet account."),
        
          dt("What can I put bounties on?"),
          dd("You can create bounties on any open issues within any GitHub project."),
          dd("You have the option of donating directly to a project instead of an issue, but these are non-refundable. Donations to projects are made available to project committers who use this money to create bounties on issues they think are key to the project's development."),
        
          dt("What happens after I post a bounty?"),
          dd("We'll let you know when a pull request is merged in relation to an issue you've backed. Also, you can view your ", a({ href: '<%= Api::Application.config.www_url %>#contributions', target: 'blank' }, "Contributions page"), " at any point to check for updates."),
        
          dt("What does it cost to post a bounty?"),
          dd("Nothing!"),
        
          dt("What if I am unsatisfied with the solution to an issue I've backed?"),
          dd("When an issue is closed, we will notify you and all other backers. You will have two weeks to open any disputes you may have with the accepted solution."),
          dd("If you feel that an accepted solution does not meet the criteria of the issue, please email us at: ", a({ href: 'mailto:support@bountysource.com' }, "support@bountysource.com"), "."),
        
          dt("When will a solution be made available to the public?"),
          dd("We have no control over when a new OSS release is made. We only award a bounty once code has been merged into the master branch of the project. The rest is up to project owners and committers."),

          dt("What happens if an issue is never closed?"),
          dd("Every bounty has a six month time limit. If you created a bounty on an issue and that is not closed within six months, you will be refunded."),
          dd("You can shorten the time limit on your bounty for a fee."),
      
          dt("Does 100% of my bounty go to the developer?"),
          dd("No. BountySource charges a 10% non-refundable fee during bounty payout. Our fee covers costs like credit card processing fees, servers, bandwidth, and other expenses.")
        )
      )
    );
  });
};
