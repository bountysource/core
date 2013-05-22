with (scope('Create', 'Fundraiser')) {
  // create a new fundraiser
  route('#account/create_fundraiser', function() {
    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        'Create'
      ),

      h4('What is a Fundraiser?'),
      p('A Fundraiser is how you raise money for the development and/or maintenance of open source projects.'),

      p("If you need help making your Fundraiser the best it could be, we're here for you! Email us or connect to our live chat."),

      h4("Fundraiser tips ▼"),
      a({ href: expand_tips }, "Learn how to make your fundraiser as successful as possible."),
      div({ id: 'fundraiser-tips' },
        ul(
          li(
            p("Use the \"Update Fundraiser\" feature to keep your backers (new and old) in the loop! Not only will it post the update to the fundraiser, it'll also email the update to all previous backers.")
          ),
          li(
            p("Make your descriptions as  detailed and visual as possible. Include screenshots, code snippets, and any other visual aids you like.")
          ),
          li(
            p("Reach out directly to your community, don't wait for them. Do you use Twitter, IRC, Mailing lists, or forums? Post to those outlets and get your fans involved with backing and spreading the word!")
          ),
          li(
            p("Rewards, lots of rewards! Rewards are a fantastic way to get your backers involved and they have been proven to drive more pledges. But you're a developer, not a tshirt printer! Let us handle your fundraiser merchandise. If you want to offer customized tshirts, mugs, mousepads, stickers, whatever you can think of, we'll handle everything from getting the product printed to shipping it. We'll even handle collecting extra fees (if needed) for global shipments."),
            p("Some other great reward tips:"),
            ul(
              li(
                p("DO have many rewards that span multiple price tiers. Don't be shy about creating a reward that's 50% (or even 100%!) of your desired goal")
              ),
              li(
                p("DON'T offer personalized / handwritten / autographed rewards unless you're certain you have the time to dedicate. Sure you can find the time to sign 20 books, but can you sign 2000 when your fundraiser blows up?")
              )
            )
          )
        )
      ),

      h4("Get started!"),
      div({ id: 'fundraiser-alerts' }),

      form({ id: 'fundraiser-create', action: create_fundraiser },
        input({ 'class': 'long', required: true, name: 'title', placeholder: 'My Awesome Project' }),
        submit({ 'class': 'button blue' }, 'Create Fundraiser')
      )
    );
  });

  define('create_fundraiser', function(form_data) {
    BountySource.create_fundraiser(form_data, function(response) {
      if (response.meta.success) {
        set_route(response.data.frontend_edit_path+'/basic-info');
      } else {
        render({ target: 'fundraiser-alerts' }, error_message(response.data.error));
      }
    });
  });

  define('expand_tips', function() {
    var e = document.getElementById('fundraiser-tips');
    add_class(e, 'active');
  });
}