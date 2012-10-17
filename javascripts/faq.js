with (scope('Faq', 'App')) {
  define('show_faq_section', function(name) {
    document.getElementById('section-committer').style.display = (name == 'committer' ? 'block' : 'none');
    document.getElementById('section-developer').style.display = (name == 'developer' ? 'block' : 'none');
    document.getElementById('section-backer').style.display =  (name == 'backer' ? 'block' : 'none');
  });

  route('#faq', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        "Frequently Asked Questions"
      ),

      section({ id: 'faq' },
        dl(
          table({ style: 'margin-bottom: 20px' },
            tr(
              td({ style: 'width: 33%'},
                div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
                  h1("COMMITTERS"),
                  p("Do you commit code to existing Open Source projects?"),
                  a({ 'class': 'blue', href: curry(show_faq_section, 'committer' )}, "Learn More")
                )
              ),

              td({ style: 'width: 33%'},
                div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
                  h1("DEVELOPERS"),
                  p("Looking to solve issues and earn money?"),
                  a({ 'class': 'blue', href: curry(show_faq_section, 'developer' )}, "Learn More")
                )
              ),
              
              td({ style: 'width: 33%'},
                div({ style: 'border: 1px solid #ccc; margin: 0 15px; padding: 20px'},
                  h1("BACKERS"),
                  p("Do you use Open Source Software and want to contribute to your favorite projects?"),
                  a({ 'class': 'blue', href: curry(show_faq_section, 'backer' )}, "Learn More")
                )
              )
            )
          ),

          section({ id: 'section-committer', style: 'display: none'},
            dt("Who is a committer?"),
            dd("Any ", a({ href: 'https://help.github.com/articles/what-are-the-different-access-permissions', target: 'blank'}, "Github user"), " who can merge pull requests into a project."),
            
            dt("How does BountySource work?"),
            dd("It begins with a backer (or group of backers) creating a bounty on a pre-existing issue (typically a feature request or bug fix). Then, developers can come to BountySource, browse through bounties and begin working on an issue they know they can fix."),
            dd("Once a developer finishes working on the fix, he or she will submit a pull request. When and if a committer for the open source project accepts the pull request, the developer is awarded the bounty."),
            
            dt("...so, what's my role in all of this?"),
            dd("The more developers there are working on issues within your project, the more pull requests you will receive. You don't need to do anything out of the ordinary - just let your community know about the bounties, check for and merge pull requests as normal, and we take care of the rest."),
            
            dt("Why should I use BountySource for my project?"),
            dd(
              'There are several benefits to using BountySource:',
              ul(
                li(u('Increase development.'), ' Encourage developers to submit quality pull requests more frequently by creating bounties on existing issues.'),
                li(u('Close issues faster.'), ' Incentivize unpopular but necessary issues by adding higher bounties on them.'),
                li(u('Earn money.'), ' As a project committer, you are still eligible to work on issues and collect bounties within your own project. ')
              )
            ),
                        
            dt("Can I work on issues and collect bounties within my own project?"),
            dd("Yes."),
          
            dt("Who can collect a bounty?"),
            dd("Anybody who has a GitHub account.")
          ),
          
          
          
          section({ id: 'section-developer', style: 'display: none'},
            dt("How do you know a project committer will accept any pull requests at all?"),
            dd("We don't guarantee this, but one of the main points of Open Source Software and making code public is to foster improvement. Committers are always monitoring pull requests, and they likely will accept any and all code they feel is of quality."),

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
            dd("BountySource charges a 10% non-refundable fee upon payout. This covers costs like credit card processing fees, servers, bandwidth, etc."),
            
            dt("What can I do with my earnings?"),
            dd(
              'What you do with your money is completely up to you. You can either collect your full 90%, or make donations:',
              ul(
                li(u('To charity.'), " We currently support donations to EFF, x, x."),
                li(u('Back into the project. '), ' Project committers will be able to use this money to create more bounties on existing issues within the project. (That you could earn again!)'),
                li(u('To BountySource.'), ' :-)')
              )
            ),
            
            dt("Do I have to pay taxes on the bounties I collect?"),
            dd("Only if you live inside the United States and earn more than $600 in a year (we'll send you a 1099)."),
            
            dt("What is your relationship with Github?"),
            dd("We are an independent developer using the ", a({ href: 'http://developer.github.com/v3/oauth/', target: 'blank' }, "GitHub API"), ".")
          ),


          section({ id: 'section-backer', style: 'display: none'},
            dt("Who is a backer?"),
            dd("A backer is anyone who creates a bounty on an issue."),
            
            dt("Who can create a bounty?"),
            dd("Anybody who has a PayPal or Google Wallet account."),
            
            dt("What can I put bounties on?"),
            dd("You can create bounties on any open issues within any GitHub project."),
            dd("You have the option of donating to directly to a project instead of an issue, but these are non-refundable. Donations to projects are made available to project committers who use this money to create bounties on issues they think are key to the project's development."),
            
            dt("What happens after I post a bounty?"),
            dd("We'll let you know when a pull request is merged in relation to an issue you've backed. Also, you can view your ", a({ href: '<%= Api::Application.config.www_url %>#contributions', target: 'blank' }, "Contributions page"), " at any point to check for updates."),
            
            dt("What does it cost to post a bounty?"),
            dd("Nothing!"),
            
            dt("What if I am unsatisfied with the solution to an issue I've backed?"),
            dd("That's what the dispute period is for. Once an issue has been closed, we notify you and all other backers. You will have two weeks to verify that the code does what you want it to."),
            dd("You can file disputes with us via email: ", a({ href: 'mailto:support@bountysource.com' }, "support@bountysource.com"), "."),
            
            dt("When will a solution be made available to the public?"),
            dd("We have no control over when a new OSS release is made. The most we do is only award a bounty once code has been merged into the master branch of the project. The rest is up to project owners and committers."),
          
            dt("Are you an escrow?"),
            dd("No."),

            dt("What happens if an issue is never closed?"),
            dd("Every bounty has a six month time limit. If you created a bounty on an issue and that is not closed within six months, you will be refunded."),
            dd("You can shorten the time limit on your bounty for a fee."),
          
            dt("Does 100% of my bounty go to the developer?"),
            dd("No. BountySource charges a 10% non-refundable fee during bounty payout. Our fee covers costs like credit card processing fees, servers, bandwidth, etc.")
          )
        )
      )
    );
  });
};
