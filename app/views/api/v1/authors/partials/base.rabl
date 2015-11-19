node(:author) do |obj|
  if obj.author && obj.author.person
    partial("api/v1/people/partials/base", :object => obj.author.person)
  elsif obj.author
    partial("api/v1/linked_accounts/partials/faux_person", :object => obj.author)
  else
    { type: 'LinkedAccount::Unknown', display_name: obj.author_name, image_url: LinkedAccount::Base.new.image_url }
  end
end
