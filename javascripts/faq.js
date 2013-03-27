with (scope('Faq', 'App')) {

  define('location_markers', {
    general:      span({ id: 'general' }),
    bounties:     span({ id: 'bounties' }),
    fundraisers:  span({ id: 'fundraisers' })
  });

  define('active_nav_id', '');

  define('scroll_to_marker', function(marker_element) {
    scrollTo(0, marker_element.offsetTop - 100);
  });

  route('#faq', function() {
    render(
      breadcrumbs(
        a({ href: '#' }, "Bountysource"),
        "Frequently Asked Questions"
      ),

      Columns.create(),

      Columns.side(
        ul({ id: 'faq-nav' },
          li(a({ 'class': 'faq-nav-button active', id: 'nav-general',     href: curry(scrollTo, 0, 0) }, 'General')),
          li(a({ 'class': 'faq-nav-button', id: 'nav-bounties',    href: curry(scroll_to_marker, location_markers.bounties) },     'Bounties')),
          li(a({ 'class': 'faq-nav-button', id: 'nav-fundraisers', href: curry(scroll_to_marker, location_markers.fundraisers) },  'Fundraisers'))
        )
      ),

      Columns.main(
        div({ id: 'faq' },
          location_markers.general,
          h1('General'),

          dl(
            dt("How does Bountysource work?"),

            dd("There are two main functions: Fundraisers and Bounties."),
            dd(i("How Bounties work:")),
            dd(
              ol(
                li('Users fund bounties on open issues or feature requests they want to see addressed.'),
                li('These users spread the word about the bounty, enticing developers to create a solution.'),
                li('Developers create solutions and submit them on BountySource.'),
                li('Bountysource tracks these solutions, sees which one gets accepted by the open-source project, and then pays the bounty to the developer.')
                //li('Learn more...')
              )
            ),
            dd(i('How Fundraisers work:')),
            dd(
              ol(
                li('Anyone can come to Bountysource and create a Fundraiser. Open-source fundraisers are typically used to raise money for new projects, big updates to existing projects, or to raise money for bounties.'),
                li('The Fundraiser creator spreads the word about the Fundraiser to their communities.'),
                li('Anyone can come to Bountysource and make pledges to a Fundraiser, helping it reach its funding goal in time.')
                //li('Learn more...')
              )
            ),

            dt('What makes Fundraisers different from Kickstarter, Indiegogo, etc?'),
            dd('Several things:'),
            dd(
              ul(
                li('We\'re focused entirely on open-source software, so our user base is more valuable in that sense. Bountysource users are familiar with the open-source community and projects; there\'s a higher chance of gaining contributions upon discovery as opposed to crowdfunding sites that cater to all types of projects.'),
                li('We offer reward fulfillment for physical goods - from creation to delivery. If you\'re interested in starting a Fundraiser and want shirts, stickers, thumbdrives, or more please ', a({ href: 'mailto:support@bountysource.com' }, "contact us"), ' for more details!'),
                li('Users have a direct line of communication with the team - no hoops to jump through, you can find the entire team on ', a({ href: 'irc://irc.freenode.net/bountysource' }, "IRC (#bountysource on Freenode)"), '.'),
                li(a({ target: '_blank', href: 'https://github.com/bountysource/frontend' }, "Our front-end is open-source"), '! See things you don\'t like? Feel free to make changes and submit the code to us for review.')
              )
            ),

            dt('Why should I use Bountysource?'),
            dd(
              'There are several benefits to using Bountysource:',
              ul(
                li(u('Increase development.'), ' Encourage developers to submit quality pull requests more frequently by creating bounties on existing issues.'),
                li(u('Close issues faster.'), ' Incentivize unpopular but necessary issues by adding higher bounties on them.'),
                li(u('Earn money.'), ' Create solutions to open issues and collect bounties within any project (including your own).')
              )
            ),

            dt('I\'m an admin/manager/committer on a project. What\'s my role in all of this?'),
            dd("The more developers there are working on issues within your project, the more code/solutions you will receive. You don't need to do anything out of the ordinary - just let your community know about the bounties, check for and merge code as normal, and we take care of the rest."),

            dt('I\'m worried about introducing money into my community.'),
            dd("As long as you continue to accept or reject code based on its merit, there won't be any issues. The great thing about open-source is that, at the end of the day, it doesn't matter what someone's motivations are - code speaks for itself.")

          ),

          br,

          location_markers.bounties,
          h1('Bounties'),

          dl(
            dt("What is a bounty?"),
            dd("A bounty is money offered as a reward for successfully resolving an issue within an open-source project."),

            dt("Who can create a bounty?"),
            dd("Anybody with a PayPal account. We’ll be supporting other payment methods (including Google Wallet and Bitcoins) very soon!"),

            dt("What can I put bounties on?"),
            dd("You can create bounties on any open issue within any open-source project."),

            dt("What does it cost to post a bounty?"),
            dd("Nothing! We do not charge any fees for placing a bounty. However, you will be required to pay the full amount of the bounty in order for the bounty to show up on Bountysource."),

            dt("Can several people put bounties on the same issue?"),
            dd("Yes! That is ideal. A $10 bounty from 1 person might not be appealing, but a $200 bounty from 10 people might be."),

            dt("What happens after I post a bounty?"),
            dd("We'll let you know when a solution is accepted for an issue you've backed. At that point, you will have two weeks to verify that it does what you want it to before we pay the developer."),

            dt("How can I keep track of all the bounties I’ve posted?"),
            dd("You can view all of the issues you've backed via your ", a({ target: '_blank', href: 'https://www.bountysource.com/#contributions' }, "Contributions page"), '.'),

            dt("What if I'm unsatisfied with the solution to an issue I've backed?"),
            dd("After a solution is accepted, you will have two weeks to open any disputes you may have."),
            dd("If you feel that an accepted solution does not meet the criteria of the issue, please email us at ", a({ href: 'mailto:support@bountysource.com?subject=Dispute' }, 'support@bountysource.com'), "."),// [email us at support@bountysource.com](use the same mailto: link with the subject/body as on the issue page)
            //"mailto:support@bountysource.com?subject="+ encodeURIComponent("Dispute") +
            //"&body=" + encodeURIComponent("Issue Name: " + solution.issue.title + "\nIssue URL: " + solution.issue.frontend_path + "\n\nPlease describe the issue you have with " + solution.person.display_name + "'s solution:")

            dt("An issue I've backed has been closed. When will the solution be made available to the public?"),
            dd("We have no control over when a project makes a new release. We award a bounty once code has been merged into the project. The rest is up to project owners and committers."),

            dt("What happens if an issue I’ve backed is closed without a solution?"),
            dd("If an issue with bounties is closed without a solution, all backers are refunded."),
            
            dt("What happens if an issue I've backed is never closed?"),
            dd("Every bounty has a six month time limit. If you backed an issue that is not closed within those six months, you will be refunded."),

            dt("Does 100% of the bounty go to the developer?"),
            dd("Upon payout, Bountysource will charge a 5% fee in addition to any payment processing fees. Our 5% will cover costs like servers, bandwidth, and other expenses."),

            dt("How do you know a project committer will accept any pull requests at all?"),
            dd("We don't guarantee this, but one of the main points of open-source software and making code public is to foster improvement. Committers are always monitoring pull requests, and they likely will accept any and all code they feel is of quality."),

            dt("How do I know if my solution has been accepted or rejected?"),
            dd("You can check on the status of your solutions via your ", a({ target: '_blank', href: 'https://www.bountysource.com/#solutions' }, "Solutions page"), '.'),

            dt("My solution was accepted. When do I get paid?"),
            dd("Once a solution is accepted, it enters a two-week dispute period. If there are no outstanding disputes, you get paid after this period."),

            dt("How do I receive payment?"),
            dd("You can receive payment via Paypal or a physical check."),

            dt("Who can collect a bounty?"),
            dd("Anybody!"),

            dt("Do I have to pay taxes on bounties I collect?"),
            dd("If you are in the United States and payments made to you are more than $600 for the year, we are required to issue you a Form 1099 to report the payments, which will require you to complete a Form W-9. You should consult your tax advisor as to the taxability of the payments.")

          ),

          br,

          location_markers.fundraisers,
          h1('Fundraisers'),

          dl(
            dt("What is a Fundraiser?"),
            dd("A means of collecting monetary contributions for a specific goal. In particular, Bountysource Fundraisers are primarily used to raise money for new projects, new versions of existing projects, or for bounties."),

            dt("Who can create a fundraiser?"),
            dd("Anybody!"),

            dt("What do you charge upon completion?"),
            dd("Bountysource charges a 5% fee plus payment processing fees."),

            dt("When do I get paid?"),
            dd("We give you the money as soon as your goal is met. If you reach your funding goal before your fundraiser deadline, we’ll pay you the goal amount immediately, and give you all the excess once the fundraiser is over.")

          ),

          br,

          p('Have any further questions? ', a({ href: 'mailto:support@bountysource.com'}, "Contact us!"))
        )
      )
    );

    window.addEventListener('scroll', scroll_listener);
    scroll_listener();
  });

  define('scroll_listener', function(e) {
    if (is_in_viewport(location_markers.fundraisers)) {
      set_active_nav_element('nav-fundraisers');
    } else if (is_in_viewport(location_markers.bounties)) {
      set_active_nav_element('nav-bounties');
    } else if (is_in_viewport(location_markers.general)) {
      set_active_nav_element('nav-general');
    }
  });

  define('set_active_nav_element', function(id) {
    if (active_nav_id == id) return;

    // reset active classes
    var nav_elements = document.getElementsByClassName('faq-nav-button');
    for (var i=0; i<nav_elements.length; i++) remove_class(nav_elements[i], 'active');

    // set new active class
    active_nav_id = id;
    add_class(document.getElementById(active_nav_id), 'active');
  });

  define('is_in_viewport', function(element) {
    var top = element.offsetTop;
    var left = element.offsetLeft;
    var width = element.offsetWidth;
    var height = element.offsetHeight;

    while(element.offsetParent) {
      element = element.offsetParent;
      top += element.offsetTop;
      left += element.offsetLeft;
    }

    return (
      top >= window.pageYOffset &&
        left >= window.pageXOffset &&
        (top + height) <= (window.pageYOffset + window.innerHeight) &&
        (left + width) <= (window.pageXOffset + window.innerWidth)
      );
  });

}

//Questions to add:

//dt("How do I post a bounty?")

//What happens if an issue is never closed?[do we handle this?]
//Every bounty has a six month time limit. If an issue isn’t closed within that time frame, all backers are refunded.

//How do you determine who earns the bounty?[do we want to distinguish between Github/supported trackers and generic?]
//When a developer submits a Solution through Bountysource, the solution enters a two week “Dispute Period”. If there are no unresolved issues after that period, the deverloper earns the bounty.