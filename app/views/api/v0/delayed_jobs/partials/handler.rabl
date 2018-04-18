node(:handler) do |delayed_job|
  if (handler = YAML.load(delayed_job.handler) rescue nil)
    if handler.object.is_a?(Class)
      {
        object_type: handler.object.name,
        object_id: nil,
        object_attributes: {},
        method_name: handler.method_name,
        args: handler.args.map do |arg|
          if arg.is_a?(ApplicationRecord)
            "#{arg.class.name} (#{arg.id})"
          elsif arg.is_a?(Array) || arg.is_a?(Hash) || arg.is_a?(String)
            arg
          else
            arg.inspect
          end
        end
      }
    else
      {
        object_type: handler.object.class.name,
        object_id: handler.object.id,
        object_attributes: handler.object.try(:attributes) || {},
        method_name: handler.method_name,
        args: handler.args.map do |arg|
          if arg.is_a?(ApplicationRecord)
            "#{arg.class.name} (#{arg.id})"
          elsif arg.is_a?(Array) || arg.is_a?(Hash) || arg.is_a?(String)
            arg
          else
            arg.inspect
          end
        end
      }
    end
  end
end