# == Schema Information
#
# Table name: payment_notification_logs
#
#  id                :integer          not null, primary key
#  processor         :string           not null
#  notification_type :string
#  content           :text             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class PaymentNotificationLog < ApplicationRecord
end
