object false

child @cards[:fundraisers] => :fundraisers do
  extends('api/v1/fundraisers/partials/card')
end

child @cards[:repositories] => :repositories do
  extends('api/v1/trackers/partials/card')
end

child @cards[:issues] => :issues do
  extends('api/v1/issues/partials/card')
end
