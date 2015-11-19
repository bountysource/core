node(:type) { root_object.class.name }
child(:owner => :owner) { extends "api/v1/owners/partials/base" }
