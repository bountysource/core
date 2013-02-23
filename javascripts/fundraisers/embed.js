with (scope('Embed', 'Fundraiser')) {
  route('#fundraiser/:fundraiser_id/embed', function(fundraiser_id) {
        var fundraiser_iframe = '<iframe src="' + BountySource.api_host + 'user/fundraisers/embed/' + fundraiser_id + '" ' +
                                'style="border:0;width:250px;height:500px"></iframe>';
        var fundraiser_textarea = textarea({ style: 'color: #ccc; font-size: 100%; white-space:nowrap;', rows: 2, width: 100 }, fundraiser_iframe);
        console.log(fundraiser_textarea);
        render(fundraiser_textarea);
  });
}
