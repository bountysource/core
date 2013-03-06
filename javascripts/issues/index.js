with (scope('Issue', 'App')) {

  route('#trackers/:tracker_id/issues', function(tracker_id) {
    var target_div = div('Loading...');

    render(target_div);


    BountySource.get_tracker(tracker_id, function(response) {
      if (!response.meta.success) {
        render({ into: target_div }, error_message(response.data.error));
      } else {
        var tracker = response.data;
        var new_target_div = div('Loading...');

        render({ into: target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: tracker.frontend_path }, tracker.name),
            "Issues"
          ),

          new_target_div
        );
      }

      BountySource.get_issues(tracker_id, function(response) {
        if (!response.meta.success) {
          render({ into: new_target_div }, error_message(response.data.error));
        } else {
          render({ into: new_target_div },
            Repository.issue_table({ header_class: 'thick-line-green' }, 'All Issues', response.data)
          );
        }
      });

    });

  });

}
