
class RemoteStore
  def self.build(config = {})
    klass = case config[:type]
      when 's3' then RemoteStore::S3
      else raise "Unknown remote store"
    end
  
    return klass.new(config)
  end
end