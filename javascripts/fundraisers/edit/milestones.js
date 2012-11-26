with (scope('Fundraisers')) {
  route('#account/fundraisers/:fundraiser_id/milestones', function(fundraiser_id) {
    edit_fundraiser_layout(fundraiser_id, function(fundraiser) {
      return ;
    });
  });


  // generate a random ID
  define('generate_milestone_row_id', function() { return 'milestone-table-row_'+Math.ceil((new Date()).getTime() * Math.random()) });

  // return a row, with the correct id (based on the number of added milestones)
  define('milestone_row_elements', function(milestone_row_id, milestone_data) {
    return [
      { id: milestone_row_id, 'class': 'editable' },
      td({ style: 'width: 800px; padding-left: 20px;' }, milestone_data.description),
      td({ style: 'text-align: center; width: 100px;' },
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
      td(
        input({
          style:        'width: 95%; margin-left: 5px;',
          name:         'milestone-description',
          placeholder:  'What is your goal for this milestone?',
          value:        milestone_description||'',
          onkeyup:      function(e) { if (e.keyCode == 13) lock_milestone_row(milestone_row_id) }
        })
      ),
      td({ style: 'text-align: center;' },
        a({ href: curry(lock_milestone_row, milestone_row_id) },
          img({ style: 'margin: 0 3px;', src: 'images/save.gif' })
        )
      )
    ).setAttribute('locked-for-edit', true);
    t.at(milestone_row_id).children[0].children[0].focus();
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
    t.at(milestone_row_id).remove();
  });

  // take what is on the inputs row of the milestones table, add it as a new row, and empty the inputs row.
  define('push_milestone_row_from_inputs', function() {
    clear_message();

    var input_row         = Teddy.snuggle('milestone-table').at('milestone-inputs'),
      description_input = document.getElementById('milestone-input-description');

    if (!description_input.value || description_input.value.length == 0) {
      render_message(error_message("You must provide a description."));
    } else {
      input_row.insert(milestone_row_elements(generate_milestone_row_id(), { description: description_input.value }));
      description_input.value="";
      description_input.focus();
    }
  });
}