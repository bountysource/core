class TaxForm::Fw8Validator
  include ActiveModel::Validations
  include ActiveModel::Validations::Callbacks
  include ActiveModel::Serializers::JSON
  include ActiveModel::Model

  attr_accessor :form_type, :personal_name, :citizen_of,
                :residence_address_1, :residence_address_2, :residence_country,
                :mail_address_1, :mail_address_2, :mail_country,
                :us_tax_id, :foreign_tax_id, :ref_num, :date_of_birth, :list_ac_numbers,
                :ptii_country, :ptii_treaty_para, :ptii_withholding,
                :ptii_income_type, :ptii_eligibility_1, :ptii_eligibility_2,
                :signed, :dated, :print_signed, :proxy_signers_role

  validates_presence_of :personal_name, message: 'required'
  validates_presence_of :citizen_of, message: 'required'

  validates_presence_of :residence_address_1, message: 'required'
  validates_presence_of :residence_address_2, message: 'required'
  validates_presence_of :residence_country, message: 'required'

  validates_presence_of :mail_address_1, if: "mail_address_2.present? || mail_country.present?", message: 'required'
  validates_presence_of :mail_address_2, if: "mail_address_1.present? || mail_country.present?", message: 'required'
  validates_presence_of :mail_country, if: "mail_address_1.present? || mail_address_2.present?", message: 'required'

  validates_presence_of :foreign_tax_id

  validates :date_of_birth, presence: {message: 'required'}, format: { with: /\A[0-9]{4}-[0-9]{2}-[0-9]{2}\z/, allow_blank: true, message: 'date'}

  validates_presence_of :signed, message: 'required'
  validates :dated, presence: {message: 'required'}, format: { with: /\A[0-9]{4}-[0-9]{2}-[0-9]{2}\z/, allow_blank: true, message: 'date'}
  validates :print_signed, presence: {message: 'required'}
  validate :signed_by_match

  def signed_by_match
    if print_signed != signed 
      errors.add(:print_signed, 'pattern')
    end
  end

  def attributes
    instance_values
  end

  def serializable_hash(options = {})
    super(only: [:form_type, :personal_name, :citizen_of, :residence_address_1, :residence_address_2, :residence_country,
                 :mail_address_1, :mail_address_2, :mail_country, :us_tax_id, :foreign_tax_id, :ref_num, :date_of_birth, :list_ac_numbers,
                 :ptii_country, :ptii_treaty_para, :ptii_withholding, :ptii_income_type, :ptii_eligibility_1, :ptii_eligibility_2,
                 :signed, :dated, :print_signed, :proxy_signers_role]
          )
  end

end