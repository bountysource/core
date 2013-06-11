with (scope('Pledge', 'Bountysource')) {

  attribute('amount', 'created_at');

  belongs_to('fundraiser');


}