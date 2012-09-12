with (scope('Faq', 'App')) {
  route('#faq', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        "Frequently Asked Questions"
      ),

      section({ id: 'faq' },
        dl(
          dt("Who is a backer?"),
          dd("A backer is anyone who creates a bounty on an issue."),

          dt("Who is a committer?"),
          dd("A committer is any ", a({ href: 'https://help.github.com/articles/what-are-the-different-access-permissions', target: 'blank'}, "Github user"), " who can merge pull requests into a project."),
                    
          dt("Who can create a bounty?"),
          dd("Anybody who has a PayPal or Google Wallet account."),

          dt("Who can collect a bounty?"),
          dd("Anybody who has a GitHub account."),

          dt("How do you determine who earns the bounty?"),
          dd("Once a Github issue has been closed, BountySource awards the bounty to the developer whose pull request was merged."),
          
          dt("When are bounties paid out?"),
          dd("Once an issue is closed, all bounties associated with it are held for 2 weeks. During these 2 weeks, all backers of the issue, along with other developers working on the issue, can verify that the merged code does what it should."),
            
          dt("How do I receive payment for a bounty?"),
          dd("BountySource will be sending out physical checks to developers. If you are a developer collecting a bounty, you need to fill out the Payment Information portion of your profile so we have all appropriate information."),

          dt("Do I have to pay taxes on the bounties I collect?"),
          dd("Only if you live inside the United States and earn more than $600 in a year (we'll send you a 1099)."),
            
          dt("What is your relationship with Github?"),
          dd("We are an independent developer using the ", a({ href: 'http://developer.github.com/v3/oauth/', target: 'blank' }, "GitHub API"), "."),

          dt("Are you an escrow?"),
          dd("No."),

          dt("What happens if an issue is never closed?"),
          dd("Every bounty has a 6 month time limit. If you created a bounty on an issue and it isn't closed within 60 days, you will be refunded."),
        
          dt("Can I dispute a bounty that has been collected?"),
          dd("Yes. If you are unsatisfied with the solution to the issue you created a bounty on, you can file a dispute with us within 2 weeks of the code being merged. You can file a dispute by emailing us at ", a({ href: 'mailto:support@bountysource.com'}, "support@bountysource.com"), ".")
        )
      )
    );
  });
};