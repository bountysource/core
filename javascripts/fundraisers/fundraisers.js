with (scope('Fundraisers','App')) {
  route('#account/fundraisers', function() {
    var fundraisers_table = div('Loading...');

    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        'Fundraisers'
      ),
      fundraisers_table
    );

    BountySource.get_fundraisers(function(response) {
      if (response.data.length > 0) {
        render({ into: fundraisers_table },
          table(
            tr(
              th('Title'),
              th({ style: 'width: 130px;' }, 'Funding Goal'),
              th({ style: 'width: 200px;' }, 'Progress'),
              th({ style: 'width: 80px; text-align: center;' }, 'Status'),
              th({ style: 'width: 30px;' })
            ),
            response.data.map(function(fundraiser) {
              // depends on whether or not fundraiser is published
              var link_href = fundraiser.published ? '#fundraisers/'+fundraiser.id : '#account/fundraisers/edit/'+fundraiser.id;
              return tr({ style: 'height: 40px;' },
                td(a({ href: link_href }, abbreviated_text(fundraiser.title || 'Untitled Fundraiser', 100))),
                td(money(fundraiser.funding_goal || 0)),
                td('<sick-ass-progress-bar />'),
                td({ style: 'text-align: center;' }, fundraiser_published_status(fundraiser)),
                td(fundraiser.published ? '' : a({ href: curry(destroy_fundraiser, fundraiser)}, 'delete'))
              );
            })
          )
        );
      } else {
        render({ into: fundraisers_table },
          info_message("You don't have any fundraiser drafts saved. ", a({ href: '#account/fundraisers/create' }, "Create one now"))
        );
      }
    });
  });

  define('fundraiser_published_status', function(fundraiser) {
    return span({ style: 'font-size; 16px;' },
      fundraiser.published ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Published') : span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Draft')
    );
  });

  route('#account/fundraisers/edit/:fundraiser_id', function(fundraiser_id) {
    var fundraiser_form_div = div('Loading...');

    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        'Edit'
      ),
      fundraiser_form_div
    );

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      // save the fundraiser form every 15 seconds
      LongPoll.execute(curry(save_fundraiser, response.data)).every(15000).condition(function() {
        return /#account\/fundraisers\/edit\/\d+/.test(get_route());
      }).start();

      render({ into: fundraiser_form_div }, fundraiser_form(response.data));

      // after form is rendered, insert saved milestone rows into table
      (response.data.milestones||[]).map(function(milestone) {
        var t = Teddy.snuggle('milestone-table');
        t.at(t.length() - 2).insert(milestone_row_elements(generate_id(), milestone));
      });
    });
  });

  // create a new fundraiser
  route('#account/fundraisers/create', function() {
    var fundraiser_form_div = div('Loading...');

    BountySource.create_fundraiser(function(response) {
      // save the fundraiser form every 15 seconds
      LongPoll.execute(curry(save_fundraiser, response.data)).every(15000).condition(function() {
        return get_route() == '#account/fundraisers/create';
      }).start();

      render({ into: fundraiser_form_div }, fundraiser_form(response.data));
    });

    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        'Create'
      ),
      fundraiser_form_div
    );
  });

  define('fundraiser_form', function(fundraiser) {
    return form({ id: 'fundraiser-form', 'class': 'fancy' },
      messages(),

      fundraiser_block({ title: 'Basic Details', description: "Provide some basic information about your proposal." },
        fieldset(
          label('Title:'),
          input({ name: 'title', 'class': 'long', placeholder: 'My OSS Project', value: fundraiser.title||'' })
        ),
        fieldset(
          label('Image URL:'),
          input({ name: 'image_url', 'class': 'long', placeholder: 'i.imgur.com/abc123', value: fundraiser.image_url||'' })
        ),
        fieldset(
          label('Homepage:'),
          input({ name: 'homepage_url', 'class': 'long', placeholder: 'bountysource.com', value: fundraiser.homepage_url||'' })
        ),
        fieldset(
          label('Source Repository:'),
          input({ name: 'repo_url', 'class': 'long', placeholder: 'github.com/badger/frontend', value: fundraiser.repo_url||'' })
        )
      ),

      br(),

      fundraiser_block({ title: 'Description', description: "This is where you convince people to contribute to your fundraiser. Why is your project interesting, and worthy of funding?" },
        fieldset(
          textarea({ name: 'description', style: 'width: 910px; height: 400px;', placeholder: "Very thorough description of your fundraiser proposal." }, fundraiser.description||'')
        )
      ),

      br(),

      fundraiser_block({ title: 'About Me', description: "Convince people that your are skilled enough to deliver on your promise." },
        fieldset(
          textarea({ name: 'about_me', style: 'width: 910px; height: 100px;', placeholder: "I am a Ruby on Rails engineer, with 8 years of experience." }, fundraiser.about_me||'')
        )
      ),

      br(),

      fundraiser_block({ title: 'Milestones', description: "Provide a roadmap of your planned development process. Once the fundraiser is published, you can update the progress of individual milestones. Keep your milestones up to date so that backers can track the progress of your work." },
        milestone_messages(),

        table({ id: 'milestone-table', style: 'border: 1px solid #C4C4C4;' },
          tr({ style: 'background: #FDFDFD;' },
            th('Milestone Description'),
            th({ style: 'width: 60px;' })
          ),

          // automatic 'started working' milestone
          tr({ 'class': 'editable' },
            td({ style: 'font-style: italic;' }, span({ style: 'margin-left: 15px;' }, 'Started working.')),
            td('')
          ),

          // inputs to add new milestone
          tr({ id: 'milestone-inputs' },
            td(input({ id: 'milestone-input-description', style: 'width: 810px; margin-left: 5px;', placeholder: 'What is your goal for this milestone?' })),
            td({ style: 'text-align: center;' }, a({ href: curry(push_milestone_row_from_inputs, 'milestone-inputs') }, img({ src: 'images/add.gif' })))
          ),

          // automatic 'finished working' milestone
          tr({ 'class': 'editable' },
            td({ style: 'font-style: italic;' }, span({ style: 'margin-left: 15px;' }, 'Finished working.')),
            td('')
          )
        )
      ),

      br(),

      fundraiser_block({ title: 'Funding Details', description: "How much funding do you need to finish this project? How do you want to receive the funding?" },
        fieldset(
          label('Funding Goal:'),
          span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'), input({ name: 'funding_goal', placeholder: '50,000', value: fundraiser.funding_goal||'' })
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

      a({ 'class': 'green', href:     curry(save_fundraiser, fundraiser),    style: 'display: inline-block; width: 150px; margin: 10px;' }, 'Save'),
      a({ 'class': 'green', onclick:  curry(preview_fundraiser, fundraiser), style: 'display: inline-block; width: 150px; margin: 10px;' }, 'Preview'),
      a({ 'class': 'blue',  href:     curry(publish_fundraiser, fundraiser), style: 'float: right; width: 150px; margin: 10px;' },          'Publish')
    );
  });

  define('milestone_messages', function() { return div({ id: 'milestone-errors', style: 'margin-bottom: 10px;' }); });
  define('render_milestone_message', function(yield) { render({ target: 'milestone-errors' }, yield); });
  define('clear_milestone_messages', function() { document.getElementById('milestone-errors').innerHTML=""; })

  // generate a random ID
  define('generate_id', function() { return 'milestone-table-row_'+Math.ceil((new Date()).getTime() * Math.random()) });

  // return a row, with the correct id (based on the number of added milestones)
  define('milestone_row_elements', function(milestone_row_id, milestone_data) {
    return [
      { id: milestone_row_id, 'class': 'editable' },
      td({ style: 'padding-left: 20px;' }, milestone_data.description),
      td({ style: 'text-align: center;' },
        a({ href: curry(unlock_milestone_row, milestone_row_id) }, img({ style: 'margin: 0 3px;', src: 'images/edit.gif' })),
        a({ href: curry(delete_milestone_row, milestone_row_id) }, img({ style: 'margin: 0 3px;', src: 'images/trash.gif' }))
      )
    ];
  });

  // make a row editable after being inserted into the table.
  define('unlock_milestone_row', function(milestone_row_id) {
    var t                   = Teddy.snuggle('milestone-table'),
      milestone_description = t.at(milestone_row_id).children[0].innerText;
    t.at(milestone_row_id).replace({ id: milestone_row_id, 'class': 'editable' },
      td(input({ style: 'width: 810px; margin-left: 5px;', name: 'milestone-description', placeholder: 'What is your goal for this milestone?', value: milestone_description||'' })),
      td({ style: 'text-align: center;' }, a({ href: curry(lock_milestone_row, milestone_row_id) }, img({ style: 'margin: 0 3px;', src: 'images/save.gif' })))
    ).setAttribute('locked-for-edit', true);
  });

  // lock a row that is being edited
  define('lock_milestone_row', function(milestone_row_id) {
    var t = Teddy.snuggle('milestone-table');
    t.at(milestone_row_id).removeAttribute('locked-for-edit');
    t.at(milestone_row_id).replace(milestone_row_elements(milestone_row_id, {
      description: t.at(milestone_row_id).children[0].children[0].value
    }));
  });

  define('delete_milestone_row', function(milestone_row_id) {
    var t = Teddy.snuggle('milestone-table');
    if (confirm('Delete milestone?')) t.at(milestone_row_id).remove();
  });

  // take what is on the inputs row of the milestones table, add it as a new row, and empty the inputs row.
  define('push_milestone_row_from_inputs', function(milestone_row_id) {
    clear_milestone_messages();

    var input_row = Teddy.snuggle('milestone-table').at('milestone-inputs'),
      description_input = document.getElementById('milestone-input-description');

    if (!description_input.value || description_input.value.length == 0) {
      render_milestone_message(error_message("You must provide a description!"));
    } else {
      input_row.insert(milestone_row_elements(milestone_row_id, { description: description_input.value }));
      description_input.value="";
      description_input.focus();
    }
  });

  define('publish_fundraiser', function(fundraiser) {
    if (confirm('Are you sure? Once published, a proposal CANNOT be edited. Publish your proposal?')) {
      // first, save it. callback hell: population 2
      save_fundraiser(fundraiser, function(save_response) {
        BountySource.publish_fundraiser(fundraiser.id, function(response) {
          if (response.meta.success) {
            set_route('#account/fundraisers');
          } else {
            window.scrollTo(0,0);
            render_message(error_message(response.data.error));
          }
        });
      });
    }
  });

  // convert the serialized form (array of inputs) to a hash to send to server as request params.
  // requires unique name attributes on elements.
  define('serialized_form_to_hash', function(serialized_form) {
    var request_data = {};
    serialized_form.map(function(e) { request_data[e.name] = e.value });
    return request_data;
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


  // preview fundraiser in a new window
  define('preview_fundraiser', function(fundraiser) {
    window.open(BountySource.www_host+'#fundraisers/'+fundraiser.id+'/preview','','width=1050,height=900');
  });

  define('save_fundraiser', function(fundraiser, callback) {
    var serialized_form = serialize_form('fundraiser-form'),
      request_data      = serialized_form_to_hash(serialized_form);

    // append serialized milestones array to request_data.
    var t = Teddy.snuggle('milestone-table');
    request_data.milestones = [];
    t.forEach(function(row) {
      if (row.className == 'editable' && !row.getAttribute('locked-for-edit')) {
        request_data.milestones.push({ description: row.children[0].innerText });
      }
    });
    request_data.milestones = JSON.stringify(request_data.milestones); // serialize array

    BountySource.update_fundraiser(fundraiser.id, request_data, function(response) {
      if (callback) callback.call(response);
    });
  });

  define('destroy_fundraiser', function(fundraiser) {
    if (confirm('Are you sure? It will be gone forever!')) {
      BountySource.destroy_fundraiser(fundraiser.id, function(response) {
        window.location.reload();
      });
    }
  });
}
