object @linked_account

extends "api/v1/linked_accounts/partials/base"
extends "api/v1/linked_accounts/partials/extended" if can? :manage, @linked_account