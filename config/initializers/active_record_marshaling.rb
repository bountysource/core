ApplicationRecord.class_eval do
  def marshal_dump
    raise "Can't marshal a new_record" if new_record?
    id
  end

  def marshal_load(id)
    init_with('attributes' => self.class.find(id).attributes)
  end
end
