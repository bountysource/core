with (scope('LazyHacks', 'App')) {
  route('#undefined', curry(set_route, '#'));

}

with (scope('LegacyRoutes', 'LazyHacks')) {
  // fundraiser edit
  route('#account/fundraisers/:id/basic_info', function(id) { set_route('#fundraisers/'+id+'/edit/basic-info') });
  route('#account/fundraisers/:id/description', function(id) { set_route('#fundraisers/'+id+'/edit/description') });
  route('#account/fundraisers/:id/rewards', function(id) { set_route('#fundraisers/'+id+'/edit/rewards') });
  route('#account/fundraisers/:id/funding', function(id) { set_route('#fundraisers/'+id+'/edit/funding') });
  route('#account/fundraisers/:id/duration', function(id) { set_route('#fundraisers/'+id+'/edit/duration') });

  route('#bounties', curry(set_route, '#'));

}