with (scope('Fundraisers','App')) {
  route('#account/fundraisers', function() {
    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        'Fundraisers'
      ),
      fundraisers_table()
    );
  });

  // create a new fundraiser
  route('#account/fundraisers/create', function() {
    // save the fundraiser form every 15 seconds
    LongPoll.execute(save_fundraiser).every(15000).while(function() {
      return get_route.call() == '#account/fundraisers/create';
    }).start();

    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        'Create'
      ),

      form({ 'class': 'fancy', action: publish_fundraiser },
        fundraiser_block({ title: 'Basic Details', description: "Provide some basic information about your proposal." },
          fieldset(
            label('Title:'),
            input({ name: 'title', 'class': 'long', placeholder: 'My OSS Project' })
          ),
          fieldset(
            label('Image URL:'),
            input({ name: 'image_url', 'class': 'long', placeholder: 'i.imgur.com/abc123' })
          ),
          fieldset(
            label('Homepage:'),
            input({ name: 'homepage_url', 'class': 'long', placeholder: 'bountysource.com' })
          ),
          fieldset(
            label('Source Repository:'),
            input({ name: 'repo_url', 'class': 'long', placeholder: 'github.com/badger/frontend' })
          ),
          fieldset({ 'class': 'no-label' },
            a({ 'class': 'green', href: null, style: 'width: 250px;' }, 'Import From GitHub Project')
          )
        ),

        br(),

        fundraiser_block({ title: 'Fundraiser Description', description: "This is where you convince people to contribute to your fundraiser. Why is your project interesting, and worthy of funding?" },
          fieldset(
            textarea({ name: 'description', style: 'width: 910px; height: 400px;' }, "Very thorough description of your fundraiser proposal.")
          )
        ),

        br(),

        fundraiser_block({ title: 'About Me', description: "Convince people that your are skilled enough to deliver on your promise." },
          fieldset(
            textarea({ name: 'about_me', style: 'width: 910px; height: 100px;' }, "I am a Ruby on Rails engineer, with 8 years of experience.")
          )
        ),

        br(),

        fundraiser_block({ title: 'Funding Details', description: "How much funding do you need to finish this project? How do you want to receive the funding?" },
          fieldset(
            label('Funding Goal:'),
            span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'), input({ name: 'funding_goal', placeholder: '50,000' })
          ),
          fieldset(
            label('Payout Method:'),
            select({ name: 'payout_method', style: 'width: 600px;' },
              option({ value: 'on_funding' },   'Receive all of the funds immediately upon the funding goal being reached'),
              option({ value: 'fifty_fifty' },  'Receive half of the funds upon your funding goal being reached, and half after delivery of your product.'),
              option({ value: 'on_delivery' },  'Receive all of the funds after the delivery of your finished product.')
            )
          )
        ),

        br(),

        a({ 'class': 'green', href: save_fundraiser, style: 'display: inline-block; width: 150px; margin: 10px;' }, 'Save'),
        a({ 'class': 'green', href: preview_fundraiser, style: 'display: inline-block; width: 150px; margin: 10px;' }, 'Preview'),

        submit({ 'class': 'blue', style: 'float: right; width: 150px; margin: 10px;' }, 'Publish')
      )
    );
  });

  define('fundraisers_table', function(fundraisers) {
    return table({ 'class': 'fundraiser-table' },
      tr({ id: 'header' },
        th('Project Title'),
        th('')
      ),
      tr(
        td(
          a({ href: '#account/fundraisers/'+123 }, 'Awesome Project')
        ),
        td({ 'class': 'description' },'This is a description of the awesome feature/project that the fundraiser is for. Yeeeee gurl.')
      )
    )
  });

  define('publish_fundraiser', function(form_data) {
    if (confirm('Are you sure? Once published, a proposal CANNOT be edited. Publish your proposal?')) {
      console.log(form_data);
    }
  });

  define('preview_fundraiser', function() {
//    console.log('TODO: preview fundraiser with the form data');
    console.log(fundraiser_data_from_form());
  });

  define('save_fundraiser', function() {
    console.log('TODO: get data and POST it to server');
  });

  // a pretty, formatted container for a set of inputs.
  // ARGUMENTS: options, *yield
  // yield                - what you want inside of the block
  // options.title        - the title of the block
  // options.description  - description of the inputs in the block
  define('fundraiser_block', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return div({ style: '#eee; border: 1px solid #ccc;' },
      div({ style: 'background: #F7F7F7; border-bottom: 1px solid #D5D5D5; padding: 20px 10px;' },
        span({ style: 'font-size: 25px;' }, options.title),
        div({ style: 'margin-left: 15px; padding-top: 10px; color: gray;' }, options.description)
      ),
      div({ style: 'padding: 20px 10px; background: #eee;' },
        arguments
      )
    );
  });

  define('fundraiser_data_from_form', function() {
    return {
      title:          document.getElementsByName('title')[0].innerHTML,
      image_url:      document.getElementsByName('image_url')[0].innerHTML,
      homepage_url:   document.getElementsByName('homepage_url')[0].innerHTML,
      repo_url:       document.getElementsByName('repo_url')[0].innerHTML,
      description:    document.getElementsByName('description')[0].innerHTML,
      about_me:       document.getElementsByName('about_me')[0].innerHTML,
      funding_goal:   parseInt(document.getElementsByName('funding_goal')[0].innerHTML||'0'),
      payout_method:  document.getElementsByName('payout_method')[0].selectedOptions[0].value
    };
  });
}
