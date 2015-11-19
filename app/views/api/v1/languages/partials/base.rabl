attribute :id
attribute :name
node(:weight) { root_object.search_weight || 0 }
