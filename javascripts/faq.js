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
          
          dt("How does BountySource work?"),
          dd("It begins with a backer (or group of backers) creating a bounty on a pre-existing issue (typically a feature request or bug fix). Then, developers can come to BountySource, browse through bounties and begin working on an issue they know they can fix."),
          dd("Once a developer finishes working on the fix, he or she will submit a pull request. When and if a committer for the open source project accepts the pull request, the developer is awarded the bounty."),

          dt("When several developers are working on an issue, how do you determine who earns the bounty?"),
          dd("Once a Github issue has been closed, BountySource awards the bounty to the developer whose pull request was merged."),
          
          dt("When are bounties paid out?"),
          dd("Once an issue is closed, all bounties associated with it are held for two weeks. During these two weeks, all backers of the issue, along with other developers working on the issue, can verify that the merged code does what it should."),
            
          dt("How do I receive payment for a bounty?"),
          dd("You can receive payment via Paypal or a physical check. Before collecting a bounty, you need to fill out the Payment Information portion of your profile."),

          dt("Do I have to pay taxes on the bounties I collect?"),
          dd("Only if you live inside the United States and earn more than $600 in a year (we'll send you a 1099)."),
            
          dt("What is your relationship with Github?"),
          dd("We are an independent developer using the ", a({ href: 'http://developer.github.com/v3/oauth/', target: 'blank' }, "GitHub API"), "."),

          dt("Are you an escrow?"),
          dd("No."),

          dt("What happens if an issue is never closed?"),
          dd("Every bounty has a six month time limit. If you created a bounty on an issue and that is not closed within six months, you will be refunded."),
          dd("You can shorten the time limit on your bounty for a fee."),
          
          dt("Does 100% of my bounty go to the developer?"),
          dd("No. BountySource charges a 10% non-refundable fee during bounty payout. Our fee covers costs like credit card processing fees, servers, bandwidth, etc."),
          dd("Also, developers who win bounties have the option of donating their earnings back into the project, or to a charity."),
        
          dt("Can I dispute a bounty that has been collected?"),
          dd("If you were either a backer for the issue or a developer working on the issue, yes."),
          dd("If you are unsatisfied with the solution to the issue you created a bounty on, you can file a dispute with us within two weeks of the code being merged. You can file a dispute by emailing us at ", a({ href: 'mailto:support@bountysource.com'}, "support@bountysource.com"), ".")
        )
      )
    );
  });
};
