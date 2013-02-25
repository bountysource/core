with (scope('Embed', 'Fundraiser')) {
  route('#fundraisers/:fundraiser_id/embed', function(fundraiser_id) {
    var fundraiser_iframe = '<iframe src="' + BountySource.api_host + 'user/fundraisers/' + fundraiser_id + '/embed" ' +
                            'style="border:0;width:255px;height:515px;overflow:auto"></iframe>';
    var fundraiser_textarea = textarea({ style: 'color: #ccc; font-size: 100%; white-space:nowrap;', rows: 2, width: 100 }, fundraiser_iframe);
    render(fundraiser_textarea);
  });
}
