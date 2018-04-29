# == Schema Information
#
# Table name: quickbooks_vendors
#
#  id         :integer          not null, 
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class QuickbooksVendor < QuickbooksBase
  belongs_to :person
  has_many :cash_outs

  def self.create_from_cash_out!(cash_out)
    response = self.api_call(
      path: "vendor",
      method: :post,
      post_body: post_body_from_cash_out(cash_out)
    )
    raise "Expected Vendor" unless response['Vendor']

    new.tap do |vendor|
      vendor.id = response['Vendor']['Id']
      vendor.save!
    end
  end

  def update_from_cash_out!(cash_out)
    vendor_fields = self.class.api_call(
      path: "vendor/#{id}",
    )
    post_body = vendor_fields['Vendor'].merge(self.class.post_body_from_cash_out(cash_out))

    response = self.class.api_call(
      path: "vendor?operation=update",
      method: :post,
      post_body: post_body
    )
  end

  protected

  def self.post_body_from_cash_out(cash_out)
    {
      "Vendor1099" => cash_out.is_1099_eligible?,
      "GivenName" => cash_out.address.name.split(" ", 2).first.to_s[0..24],
      "FamilyName" => cash_out.address.name.split(" ", 2).last.to_s[0..24],
      "DisplayName" => "#{cash_out.address.name.first(90)} ##{cash_out.address.person.id}",
      "PrintOnCheckName" => cash_out.address.name.first(100),
      "AcctNum" => cash_out.address.person.id,
      "BillAddr" => {
        "Line1" => cash_out.address.address1,
        "Line2" => cash_out.address.address2,
        "Line3" => cash_out.address.address3,
        "City" => cash_out.address.city,
        "Country" => cash_out.address.country,
        "CountrySubDivisionCode" => cash_out.address.state,
        "PostalCode" => cash_out.address.postal_code,
      },
    }
  end
end
