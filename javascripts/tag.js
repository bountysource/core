with (scope('Tag', 'App')) {

  route('#tags', function() {
    render('Loading...');

    BountySource.api('/tags', function(response) {
      if (response.meta.success) {
        render(
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            'Tags'
          ),

          div({ id: 'inline-tags' },
            response.data.map(function(tag) {
              return div({ 'class': 'inline-tag' },
                a({ href: '#tags/'+tag.name }, tag.name), span({ style: 'font-size: 80%;' }, '(' + formatted_number(tag.weight) + ')')
              );
            })
          )
        );
      } else {
        render(p('You have reached the end of the world.'));
      }
    });
  });

  route('#tags/:name', function(name) {
    render(div('Loading...'));

    BountySource.api('/tags/'+name, function(response) {
      if (response.meta.success) {
        var tag = response.data;

        var projects_div = div();

        render(
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: '#tags' }, 'Tags'),
            tag.name
          ),

          div(
            img({ src: tag.image_url, style: 'width: 75px; height: 75px; vertical-align: middle; margin-right: 10px; float: left'}),
            h2({ style: 'margin: 0 0 10px 0' }, tag.name),
            div({ style: 'clear: both' })
          ),

          // projects
          br,
          projects_div
        );

        BountySource.api('/tags/'+name+'/projects', function(response) {
          if (response.meta.success && response.data.length > 0) {
            var projects = response.data;

            render({ into: projects_div },
              div({ id: 'card-rows-container' },
                Home.cards_row('Projects', projects, Project.card)
              )
            );
          } else {
            render({ into: projects_div }, p('No projects tagged with '+name));
          }
        });
      } else {
        render(response.data.error);
      }
    });

  });



  define('init', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);

    // get item or throw
    Tag.item = options.item;
    if (!item) return console.log('item required');

    // require tags on item
    Tag.tag_relations = Tag.item.tags;
    if (!Tag.tag_relations) return console.log("item doesn't support tags");

    // need to specify api root path for item
    Tag.api_path = options.api_path;
    if (!Tag.api_path) return console.log("must specify root api path for item");
  });

  define('inline_for_item', function() {
    init(arguments);

    if (Tag.tag_relations) {
      return div({ id: 'inline-tags' },
        item.tags.map(function(tag) { return inline_tag(tag) }),
        inline_create
      )
    }
  });

  define('inline_tag', function(tag_relation) {
    var tag = tag_relation.tag;

    return div({ 'class': 'inline-tag', 'data-id': tag.id },
      a({ href: '#tags/'+tag.name }, tag.name), span({ style: 'font-size: 80%;' }, '(' + formatted_number(tag_relation.weight) + ')'),
      a({ 'class': 'downvote', href: downvote_inline_tag_method(tag) }, '[-]'),
      a({ 'class': 'upvote', href: upvote_inline_tag_method(tag) }, '[+]')
    )
  });

  define('inline_create', function() {
    return div({ 'class': 'inline-tag' },
      form({ action: create_inline_tag },
        input({ name: 'name', placeholder: 'add tag' }),
        submit('+')
      )
    )
  });

  define('upvote_inline_tag_method', function(tag) {
    return curry(BountySource.api, Tag.api_path, 'PUT', { name: tag.name }, function(response) {
      update_inline_tag_element(tag, response);
      reload_inline_tags();
    });
  });

  define('downvote_inline_tag_method', function(tag) {
    return curry(BountySource.api, Tag.api_path, 'DELETE', { name: tag.name }, function(response) {
      update_inline_tag_element(tag, response);
      reload_inline_tags();
    });
  });

  define('update_inline_tag_element', function(tag, vote_response) {
    // iterate through tags until the right one is found. dumb, but good enough
    var elements = document.getElementsByClassName('inline-tag');
    for (var i=0; i<elements.length; i++) {
      var tag_id = parseInt(elements[i].getAttribute('data-id'));
      if (tag_id == tag.id) {
        var e = elements[i];
        remove_class(e, 'upvoted');
        remove_class(e, 'downvoted');

        if (vote_response.data.weight > 0)  { add_class(e, 'upvoted') }
        if (vote_response.data.weight < 0)  { add_class(e, 'downvoted') }


        // replace cached tag relation
        Tag.tag_relations[i] = vote_response.data;

        break;
      }
    }
  });

  define('create_inline_tag', function(form_data) {
    if (form_data.name && form_data.name.length > 0) {
      BountySource.api(Tag.api_path, 'POST', form_data, function(response) {
        if (response.meta.success) {
          // append to tags unless already present.
          // note: trying to add tag again returns successfully, but
          // doesn't create a tag/tag_relation
          var add_it = true;
          for(var i=0; i<Tag.tag_relations.length; i++) {
            if (response.data.id == Tag.tag_relations[i].id) {
              add_it = false;
              break;

              // TODO some kind of error message?
            }
          }
          if (add_it) Tag.tag_relations.push(response.data);

          // reload the tags
          reload_inline_tags();
        }
      });
    }
  });

  define('reload_inline_tags', function() {
    // re-sort and render tags again
    sort_tag_relations();
    render({ target: 'inline-tags' },
      Tag.tag_relations.map(function(tag_relation) { return inline_tag(tag_relation) }),
      inline_create
    );
  });

  define('sort_tag_relations', function() {
    Tag.tag_relations.sort(function(a,b) {
      if (a.weight < b.weight) return 1;
      if (a.weight > b.weight) return -1;
      return 0;
    })
  });







  define('table_for_item', function() {
    init(arguments);

    return div({ 'class': 'tags-table-wrapper' },
      div({ 'class': 'tags-table-header' }, 'Tags'),

      table({ 'class': 'table-tags' }, Tag.tags.map(table_row)),

      div({ 'class': 'tags-table-footer' },
        form({ action: create_tag },
          fieldset(
            input({ id: 'name', name: 'name' })
          ),
          fieldset(
            submit('Add Tag')
          )
        )
      )
    )
  });

  define('table_row', function(tag) {
    return tr({ 'class': 'table-tags-row', 'data-id': tag.id },
      td(tag.name),
      td(
        a({ 'class': 'downvote', href: downvote_inline_tag_method(tag) }, '[-]'),
        a({ 'class': 'upvote', href: upvote_inline_tag_method(tag) }, '[+]')
      )
    );
  });

}