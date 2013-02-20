with (scope('LazyHacks', 'App')) {
  route('#undefined', curry(set_route, '#'));
}