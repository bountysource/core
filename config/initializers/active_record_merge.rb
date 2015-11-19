ActiveRecord::Base.class_eval do

  # merge many models, taking lowest ID
  def self.merge!(*models)
    transaction do
      # good team is one with lowest ID
      good_model, *bad_models = models.flatten.uniq.sort_by(&:id)

      bad_models.each do |bad_model|
        good_model.merge!(bad_model)
      end

      return good_model.reload
    end
  end

  def merge!(bad_model)
    # basic validations
    return unless bad_model && bad_model != self
    raise "Can't merge unsaved model" if self.new_record? || bad_model.new_record?

    transaction do
      # loop through merging each
      self.premerge(bad_model) if self.respond_to?(:premerge)

      self.class.reflect_on_all_associations.each do |association|
        case association.macro
          when :belongs_to
            # nothing to do
          when :has_many, :has_one
            next if association.through_reflection
            collection = association.klass.where(association.foreign_key => bad_model.id)
            collection = collection.where("#{association.options[:as]}_type" => bad_model.class.name) if association.options[:as]
            collection.update_all(association.foreign_key => self.id)
          when :has_and_belongs_to_many
            raise "not implemented yet"
        end
      end

      # so we can look it up later
      MergedModel.create(good_id: self.id, bad_id: bad_model.id, bad_type: self.class.name)

      bad_model.destroy

      self.postmerge(bad_model) if self.respond_to?(:postmerge)
    end
  end

  def self.find_with_merge(id, options={})
    relation = (options[:relation] || all).where(id: id)
    relation = relation.includes(options[:include]) if options.has_key?(:include)
    relation.first!
  rescue ActiveRecord::RecordNotFound
    raise unless merge = MergedModel.where("bad_type in (?) and bad_id=?", ([self]+self.subclasses).map(&:name), id.to_i).first
    find_with_merge(merge.good_id, options)
  end

end
