with (scope('Fundraisers','App')) {

  // used to store the EpicEditor object
  var description_editor;

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
              return tr({ style: 'height: 40px;' },
                td(a({ href: '#account/fundraisers/'+fundraiser.id }, abbreviated_text(fundraiser.title || 'Untitled Fundraiser', 100))),
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

  /*
  * Create a horizontal nav. Arguments are li elements.
  * */
  define('horizontal_nav', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments),
        elements  = [];
    for (var i=0; i<arguments.length; i++) {
      var element = arguments[i];
      element.style.width = (100.0/arguments.length)+'%';
      elements.push(element);
    }
    options['class'] = 'horizontal-nav';
    return ul(options, elements);
  });

  define('fundraiser_form_nav', function() {
    for (var i=0; i<arguments.length; i++) arguments[i].className = arguments[i].className || 'fundraiser-form-nav';
    return horizontal_nav({ id: 'fundraiser-form-nav', style: 'border: 1px solid #D5D5D5; background: #EEE;' }, arguments);
  });

  route('#account/fundraisers/:fundraiser_id', function(fundraiser_id) {
    var target_div = div('Loading...'),
        header_div = breadcrumbs(
          'Home',
          a({ href: '#account' }, 'Account'),
          a({ href: '#account/fundraisers' }, 'Fundraisers'),
          'Loading...'
        );

    render(header_div, target_div);

    // TODO: handle errors
    BountySource.get_fundraiser(fundraiser_id, function(response) {
      if (!response.meta.success) {
        render(error_message(response.data.error));
      } else {
        var fundraiser = response.data;

        // which part of the fundraiser is being edited on this page?
        var page_title = get_route().match(/#account\/fundraisers\/\d+(?:\/(\w+))?/)[1];
        if (page_title) {
          render({ into: header_div },
            breadcrumbs(
              'Home',
              a({ href: '#account' }, 'Account'),
              a({ href: '#account/fundraisers' }, 'Fundraisers'),
              a({ href: '#account/fundraisers/'+fundraiser_id }, abbreviated_text(response.data.title, 45)),
              page_title.replace(/_/,' ')
            )
          );
        } else {
          render({ into: header_div },
            breadcrumbs(
              'Home',
              a({ href: '#account' }, 'Account'),
              a({ href: '#account/fundraisers' }, 'Fundraisers'),
              abbreviated_text(response.data.title, 45)
            )
          );
        }

        render({ into: target_div },
          fundraiser_form_nav(
            li({ id: 'previous-button' }, '«'),
            li({ id: 'nav-basic-info', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'basic-info') },
              'Basic Info'
            ),
            li({ id: 'nav-description', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'description') },
              'Description'
            ),
            li({ id: 'nav-about-me', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'about-me') },
              'About Me'
            ),
            li({ id: 'nav-funding-details', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'funding-details') },
              'Funding'
            ),
            li({ id: 'nav-milestones', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'milestones') },
              'Milestones'
            ),
            li({ id: 'nav-rewards', onclick: curry(select_fundraiser_form_section, fundraiser_id, 'rewards') },
              'Rewards'
            ),
            li({ id: 'next-button' }, '»')
          ),

          messages({ style: 'height: 40px;' }),

          div({ 'class': 'split-main' },
            form({ id: 'fundraiser-form', 'class': 'fancy' },
              fundraiser_block({ id: 'basic-info', title: 'Basic Information', description: "Provide some basic information about your proposal." },
                div({ style: 'padding: 20px 10px; background: #eee;' },
                  fieldset(
                    label('Title:'),
                    input({ name: 'title', 'class': 'long', placeholder: 'My OSS Project', value: fundraiser.title||'' })
                  ),
                  fieldset(
                    label('Banner Image:'),
                    input({ name: 'image_url', 'class': 'long', placeholder: 'i.imgur.com/abc123', value: fundraiser.image_url||'' })
                  ),
                  fieldset(
                    label('Project Homepage:'),
                    input({ name: 'homepage_url', 'class': 'long', placeholder: 'bountysource.com', value: fundraiser.homepage_url||'' })
                  ),
                  fieldset(
                    label('Source Repository:'),
                    input({ name: 'repo_url', 'class': 'long', placeholder: 'github.com/badger/frontend', value: fundraiser.repo_url||'' })
                  )
                )
              ),

              fundraiser_block({ id: 'description', title: 'Description', description: "Convince people to contribute. Why is your project interesting and worthy of funding?" },
                div({ style: 'padding: 20px 10px; background: #eee;' },
                  fieldset(
//                    textarea({ name: 'description', style: 'width: 630px; height: 300px;', placeholder: "Very thorough description of your fundraiser proposal." }, fundraiser.description||'')
                    div({ id: 'description' })
                  )
                )
              ),

              fundraiser_block({ id: 'about-me', title: 'About Me', description: "Convince people that you will be able to deliver." },
                div({ style: 'padding: 20px 10px; background: #eee;' },
                  fieldset(
                    textarea({ name: 'about_me', style: 'width: 630px; height: 300px;', placeholder: "I am a Ruby on Rails engineer, with 8 years of experience." }, fundraiser.about_me||'')
                  )
                )
              ),

              fundraiser_block({ id: 'funding-details', title: 'Funding Details', description: "How much funding do you need to complete this project? How do you want to receive the funds?" },
                div({ style: 'padding: 20px 10px; background: #eee;' },
                  fieldset(
                    label('Funding Goal:'),
                    span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'), input({ name: 'funding_goal', placeholder: '50,000', value: fundraiser.funding_goal||'' })
                  ),
                  fieldset(
                    label('Payout Method:'),
                    select({ name: 'payout_method', style: 'width: 400px;' },
                      option({ value: 'on_funding' },   'All upon funding goal being reached.'),
                      option({ value: 'fifty_fifty' },  'Half on funding goal being reached, half after delivery.'),
                      option({ value: 'on_delivery' },  'All upon delivery.')
                    )
                  )
                )
              ),

              fundraiser_block({ id: 'milestones', title: 'Milestones', description: "Provide a road map of your development process. Once published, each milestone can be updated to show your current progress." },
                table({ id: 'milestone-table' },
                  // inputs to add new milestone
                  tr({ id: 'milestone-inputs' },
                    td(
                      input({
                        id: 'milestone-input-description',
                        style: 'width: 95%; margin-left: 5px;',
                        placeholder: 'What is your goal for this milestone?',
                        onkeyup: function(e) { if (e.keyCode == 13) push_milestone_row_from_inputs() }
                      })
                    ),
                    td({ style: 'width: 100px;' },
                      a({ 'class': 'green', href: push_milestone_row_from_inputs, style: 'width: 90px;' }, 'Add')
                    )
                  )
                )
              ),

              fundraiser_block({ id: 'rewards', title: 'Rewards', description: "Thank your backers." },
                table({ id: 'rewards-table' },
                  tr({ id: 'reward-inputs' },
                    td(
                      div({ style: 'display: inline-block; vertical-align: middle' },
                        fieldset(
                          label('Amount:'),
                          span({ style: 'font-size: 25px; padding-right: 5px; vertical-align: middle;' }, '$'),
                          input({ id: 'reward-input-amount', style: 'width: 100px;', placeholder: 100 })
                        ),

                        fieldset(
                          label('Limit (Optional):'),
                          input({ id: 'reward-input-quantity', placeholder: 10, style: 'width: 100px; margin-left: 18px;' })
                        )
                      ),

                      textarea({
                        id:           'reward-input-description',
                        style:        'margin-left: 10px; display: inline-block;',
                        placeholder:  'Description of the reward'
                      })
                    ),

                    td({ style: 'width: 100px;' },
                      a({ 'class': 'green', href: push_reward_row_from_inputs, style: 'width: 90px;' }, 'Add')
                    )
                  )
                )
              )
            )
          ),

          div({ 'class': 'split-side' },
            grey_box(
              a({ 'class': 'green', 'href': curry(save_fundraiser, fundraiser_id) }, 'Save'),
              br(),
              a({ 'class': 'green', href: curry(preview_fundraiser, fundraiser_id) }, 'Preview'),
              br(),
              a({ 'class': 'blue', href: curry(publish_fundraiser, fundraiser_id) }, 'Publish')
            )
          ),

          div({ 'class': 'split-end' })
        );

        // render saved milestones into table
        var t = Teddy.snuggle('milestone-table');
        (fundraiser.milestones || []).forEach(function(milestone) {
          t.at('milestone-inputs').insert(milestone_row_elements(generate_milestone_row_id(), milestone));
        });

        // render saved rewards into table
        var t = Teddy.snuggle('rewards-table');
        (fundraiser.rewards || []).forEach(function(reward) {
          t.at('reward-inputs').insert(reward_row_elements(generate_reward_row_id(), reward));
        });

        // initialize the description markdown edit form.
        // NOTE: description_editor is intentionally made global.
        description_editor = new EpicEditor({
          container:          'description',
          clientSideStorage:  false,
          file: {
            name:           'description',
            defaultContent: fundraiser.description || default_description()
          },
          theme: {
            preview: '/themes/preview/github.css'
          }
        });
        description_editor.settings.basePath = "lib/epiceditor";
        description_editor.element.style.height = '520px';
        description_editor.load();

        // if this is the first time the editor is being loaded, throw it into preview mode.
        // this way, the user has to click the edit button to work, teaching them how to use the editor.
        if (!fundraiser.description || fundraiser.description.length <= 0) description_editor.preview();

        select_fundraiser_form_section(fundraiser_id, 'basic-info');
      }
    })
  });

  define("default_description", function() {
    return "Description\n===========\n"
      +"This is the main body of your fundraiser. It is formatted using Markdown.\n\n"
      +"**To get started, put the editor into edit mode**\n\n"
      +"Using the Editor\n================\n"
      +"* To edit the description, click the edit button. ![alt text](/lib/epiceditor/images/edit.png)\n"
      +"* To preview the rendered description, click the preview button. ![alt text](/lib/epiceditor/images/preview.png)\n"
      +"* Hyperlinks are automatically made when you include a URL like https://www.bountysource.com\n"
  });

  /*
  * Show a part of the fundraiser edit form. Also, set the actions for next/previous buttons
  * */
  define('select_fundraiser_form_section', function(fundraiser_id, section_id) {
    // show the right part of the form
    var form_section  = document.getElementById(section_id);
    var form_elements = document.getElementById('fundraiser-form').children;
    for (var i=0; i<form_elements.length; i++) hide(form_elements[i]);
    show(form_section);

    // next and back buttons. changes the onclick methods
    var active_nav_element      = document.getElementById('nav-'+section_id),
        next_arrow_element      = document.getElementById('next-button'),
        previous_arrow_element  = document.getElementById('previous-button');
    if (active_nav_element && active_nav_element.nextSibling && active_nav_element.nextSibling.id && active_nav_element.nextSibling.id.match(/nav-\w+/)) {
      next_arrow_element.onclick = curry(select_fundraiser_form_section, fundraiser_id, active_nav_element.nextSibling.id.split('-').slice(1).join('-'));
    }
    if (active_nav_element && active_nav_element.previousSibling && active_nav_element.previousSibling.id && active_nav_element.previousSibling.id.match(/nav-\w+/)) {
      previous_arrow_element.onclick = curry(select_fundraiser_form_section, fundraiser_id, active_nav_element.previousSibling.id.split('-').slice(1).join('-'));
    }

    // highlight the correct nav element
    var nav_elements = document.getElementsByClassName('fundraiser-form-nav');
    for (var i=0; i<nav_elements.length; i++) remove_class(nav_elements[i], 'fundraiser-form-nav-active');
    add_class(active_nav_element, 'fundraiser-form-nav-active');
  });

  // a pretty, formatted container for a set of inputs.
  // ARGUMENTS: options, *yield
  // yield                - what you want inside of the block
  // options.title        - the title of the block
  // options.description  - description of the inputs in the block
  define('fundraiser_block', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return div({ id: options.id||'', style: '#eee; border: 1px solid #ccc;' },
      div({ style: 'background: #F7F7F7; border-bottom: 1px solid #D5D5D5; padding: 20px 10px;' },
        span({ style: 'font-size: 25px;' }, options.title),
        div({ style: 'margin-left: 15px; padding-top: 10px; color: gray;' }, options.description)
      ),
      arguments
    );
  });

  define('publish_fundraiser', function(fundraiser) {
    if (confirm('Are you sure? Once published, a fundraiser CANNOT be edited.')) {
      // first, save it. callback hell: population 2
      save_fundraiser(fundraiser, function(save_response) {
        BountySource.publish_fundraiser(fundraiser.id, function(response) {
          if (response.meta.success) {
            set_route('#account/fundraisers');
          } else {
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

  // preview fundraiser in a new window
  define('preview_fundraiser', function(fundraiser) {
    window.open(BountySource.www_host+'#fundraisers/'+fundraiser.id+'/preview','','width=1050,height=900');
  });

  define('save_fundraiser', function(fundraiser_id, callback) {
    var serialized_form = serialize_form('fundraiser-form'),
        request_data    = serialized_form_to_hash(serialized_form);

    // append serialized milestones array to request_data.
    var t = Teddy.snuggle('milestone-table');
    request_data.milestones = [];
    t.forEach(function(row) {
      if (row.className == 'editable' && !row.getAttribute('locked-for-edit')) {
        request_data.milestones.push({ description: row.children[0].innerText });
      }
    });
    request_data.milestones = JSON.stringify(request_data.milestones); // serialize array

    // append serialized rewards array to request_data
    var t = Teddy.snuggle('rewards-table');
    request_data.rewards = [];
    t.forEach(function(row) {
      if (row.className == 'editable' && !row.getAttribute('locked-for-edit')) {
        var spans = row.getElementsByTagName('span');
        request_data.rewards.push({
          description:  spans[2].innerText,
          amount:       parseInt((spans[0].innerText).match(/\$(\d+)/)[1]),
          limited_to:   parseInt(spans[1].innerText)
        });
      }
    });
    request_data.rewards = JSON.stringify(request_data.rewards); // serialize array

    // pull markdown out of the description form
    request_data.description = description_editor.exportFile();

    BountySource.update_fundraiser(fundraiser_id, request_data, function(response) {
      if (response.meta.success) {
        // show messages after saved
        render_message(small_success_message("Fundraiser draft saved"));
        setTimeout(clear_message, 1250);
      } else {
        render_message(small_error_message("Fundraiser draft saved"));
      }

      if (callback) callback(response);
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
