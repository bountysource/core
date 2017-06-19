#Not an active record, a model which validates data for the tax form. 

class TaxForm::Fw9Validator
  include ActiveModel::Validations
  include ActiveModel::Validations::Callbacks
  include ActiveModel::Serializers::JSON
  include ActiveModel::Model


  attr_accessor :form_type, :personal_name, :business_name,
                :tax_class, :llc_type, :other_text,
                :payee_exemption, :fatca_exemption, :list_ac_numbers,
                :address_1, :address_2, 
                :ssn, :employee_id, :signed, :dated

  # The :message values are not actually messages, they are error type names used in fw8_errors.html/fw9_errors.html
  # 
  validates_presence_of :personal_name, message: 'required'
  validates :tax_class, :inclusion => { :in => ["individual", "corp_c", "corp_s", "partnership", "trust", "llc", "other"], :message => 'required'}
  validates :llc_type, presence: {if: :tax_class_llc?, message: 'required'}, :inclusion => { in: ["C", "S", "P"], message: 'pattern', allow_blank: true }
  validates_presence_of :other_text, :if => :tax_class_other?, message: 'required'

  validates :payee_exemption, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 13, only_integer: true, allow_blank: true, message: 'pattern' } 
  validates :fatca_exemption, format: { with: /\A[A-M]\z/, allow_blank: true, message: 'pattern' } 

  validates_presence_of :address_1, message: 'required'
  validates_presence_of :address_2, message: 'required'

  validates :ssn, presence: {:unless => "employee_id.present?", message: 'required'}, format: { with: /\A[0-9]{9}\z/, allow_blank: true, message: 'date' }
  validates :employee_id, presence: {:unless => "ssn.present?", message: 'required'}, format: { with: /\A[0-9]{9}\z/, allow_blank: true, message: 'date' }

  validates_presence_of :signed, message: 'required'
  validates :dated, presence: {message: 'required'}, format: { with: /\A[0-9]{4}-[0-9]{2}-[0-9]{2}\z/, allow_blank: true, message: 'date'}

  before_validation :uppercase_codes

  def tax_class_llc?
    tax_class == 'llc'
  end

  def tax_class_other?
    tax_class == 'other'
  end

  def tax_class_individual
    tax_class == 'individual' ? "1" : nil
  end

  def tax_class_corp_c
    tax_class == 'corp_c' ? "2" : nil
  end

  def tax_class_corp_s
    tax_class == 'corp_s' ? "3" : nil
  end

  def tax_class_partnership
    tax_class == 'partnership' ? "4" : nil
  end

  def tax_class_trust
    tax_class == 'trust' ? "5" : nil
  end

  def tax_class_llc
    tax_class == 'llc' ? "6" : nil
  end

  def tax_class_other
    tax_class == 'other' ? "7" : nil
  end

  def uppercase_codes
    llc_type.upcase! if llc_type.present?
    fatca_exemption.upcase if fatca_exemption.present?
  end

  def split_ids
    parts = {ssn_1:"", ssn_2:"", ssn_2:"", employee_id_1:"", employee_id_2:""}

    if ssn.present?
      parts[:ssn_1] = ssn[0..3]
      parts[:ssn_2] = ssn[3..5]
      parts[:ssn_3] = ssn[5..9]
    end

    if employee_id.present?
      parts[:employee_id_1] = employee_id[0..2]
      parts[:employee_id_2] = employee_id[2..9]
    end

    return parts
  end

  def attributes
    instance_values
  end

  def serializable_hash(options = {})
    super({only: [:form_type, :personal_name, :business_name, :other_text, :payee_exemption, 
                  :fatca_exemption, :list_ac_numbers, :address_1, :address_2, :signed, :dated],
          methods: [:tax_class_individual, :tax_class_llc, :tax_class_other, :tax_class_corp_c, :tax_class_corp_s, :tax_class_partnership, :tax_class_trust]}
          ).merge(split_ids).merge({requester: "Bountysource Inc.,\nCalifornia,\nU.S.A."})
  end
end

