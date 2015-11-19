child(root_object.github_account => :github_account) do |github_account|
  extends "api/v1/linked_accounts/partials/base"

  node(:permissions) { github_account.permissions }
end
