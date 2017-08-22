# == Schema Information
#
# Table name: tax_forms
#
#  id                :integer          not null, primary key
#  person_id         :integer          not null
#  created_at        :datetime         not null
#  uploaded_at       :datetime         not null
#  updated_at        :datetime         not null
#  file_name         :string(255)
#  remote_id         :string(255)
#  approved          :bool             default(false), not null
#  checked           :bool             default(false), not null
#  reason            :text             default(""), not null
#

class TaxForm < ActiveRecord::Base
  attr_accessible :person, :created_at, :updated_at, :file_name, :remote_id, :checked, :approved, :reason
  belongs_to :person

  def self.validator(type, attrs={})
    klass = case type
      when 'fw8ben' then TaxForm::Fw8Validator
      when 'fw9' then TaxForm::Fw9Validator
      else raise "Unrecognised form type"
    end
    
    return klass.new(attrs)
  end


  def self.build(user, data)
    time = Time.now 

    time_str = time.strftime "%Y-%m-%d_%H\:%M\:%S"
    file_name = "#{data.form_type}_uid#{user.id}_#{time_str}.pdf"
    tmp_file_name = Api::Application.config.fillpdf[:tmp_dir].join(file_name).to_s
    
    ret = fill_form(tmp_file_name, data)

    if ret[:status] != 0
      if Rails.env.production?
        raise "Unable to create pdf"
      else
        raise "Unable to create pdf.\nStatus: #{ret[:status]}\nstdout: #{ret[:stdout]}\nstderr: #{ret[:stderr]}"
      end
    end

    user.tax_form = TaxForm.new(file_name: file_name, person: user, created_at: time, updated_at: time)
    user.tax_form.backup(tmp_file_name)


    Mailer.send(:tax_form_received, {person: user, attach_file: tmp_file_name}).deliver
    File.delete(tmp_file_name)

    return user.tax_form
  end


  def approve(is_approved, rejection_reason = nil)
    if is_approved
      Mailer.send(:tax_form_approved, {person: person}).deliver
    elsif rejection_reason
      Mailer.send(:tax_form_rejected, {person: person, reason: rejection_reason}).deliver
    end

    update_attributes(checked: true, approved: is_approved, reason: rejection_reason)
  end


  def self.fill_form(tmp_file, valid_data)
    form_type = valid_data.form_type
    attrs = valid_data.as_json
    
    # convert any dates from yyyy-mm-dd to mm-dd-yyyy
    ["dated", "date_of_birth"].each { |name| 
      if attrs.has_key?(name)
        attrs[name] = attrs[name][5..-1] + "-" + attrs[name][0..3]
      end
    }

    script_name = Api::Application.config.fillpdf[:script_path].to_s

    Dir.chdir(Rails.root.to_s) do
      stderr_str, stdout_str, status = Open3.capture3("ruby #{script_name} #{form_type} #{tmp_file}", :stdin_data => JSON.dump(attrs.merge(dig_sign: true)))

      return {status: status, cmd: "ruby #{script_name} #{form_type} #{tmp_file}", stdout: stdout_str, stderr: stderr_str}
    end
  end

  def backup(tmp_file)
    id = remote_store.backup(tmp_file, remote_dirname)
    update_attributes(remote_id: id)
  end

  def read_backup
    remote_store.read(remote_id, remote_dirname)
  end

  def remote_store
    RemoteStore.build(Api::Application.config.remote_store)
  end

  def remote_dirname
    "taxforms-#{created_at.year}"
  end
end
