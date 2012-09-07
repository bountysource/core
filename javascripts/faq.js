with (scope('Faq', 'App')) {
  route('#faq', function() {
    render(
      h1("Frequently Asked Questions"),
      
      section({ id: 'faq' },
        dl(
          dt("Who can create a bounty?"),
          dd("Anybody who has a PayPal or Google Wallet account."),

          dt("Who can collect a bounty?"),
          dd("Anybody who has a GitHub account."),

          dt("How do you determine who earns the bounty?"),
          dd("Once a pull request has been accepted AND the corresponding Github issue has been closed (these 2 actions must happen within 24 hours of each other), BountySource will reward the appropriate developer. All patrons who contributed to the bounty as well as other developers working on the same issue will be notified, and will be given the opportunity to dispute the [ruling].  Ultimately, BountySource holds the authority to decide whether or not a developer does indeed get paid, or if the bounty should be re-opened."),
            
          dt("How do I receive payment for a bounty?"),
          dd("We will be sending developers physical checks.  Developers collecting payment need to fill out the Payment Information portion of their profile so we have all the necessary information to do so."),

          dt("Do I have to pay taxes on the bounties I collect?"),
          dd("Only if you live inside the United States and earn more than $600 in a year (we'll send you a 1099)."),
            
          dt("What is your relationship with Github?"),
          dd("We are an independent developer using the ", a({ href: 'http://developer.github.com/v3/oauth/' }, "GitHub API"), "."),

          dt("Are you an escrow?"),
          dd("No."),

          dt("What happens if it never gets completed?"),
          dd("If an issue is not resolved within 6 months of the bounty being created, all patrons who contributed to the bounty will be refunded."),
        
          dt("Can I dispute a bounty that has been collected?"),
          dd("If you are unsatisfied with the quality of code that was merged into the open source project you created a bounty on, you can file a dispute with us.  BountySource ultimately has the authority to decide whether or not a developer gets paid.")
        )
      )
    );
  });
};