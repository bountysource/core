class RemoteStore::S3
  def initialize(config = {})
    @client = Aws::S3::Client.new(
      access_key_id: config[:aws_key],
      secret_access_key: config[:aws_secret],
      region: config[:aws_region]
    )

    @resource = Aws::S3::Resource.new(client: @client)
  end

  def read(remote_id, remote_dir)
    return @client.get_object(bucket: remote_dir, key: remote_id).data.body.read
  end

  def backup(local_path, remote_dir)
    file_name = File.basename(local_path)
    bucket = @resource.bucket(remote_dir)

    if !bucket.exists?
      bucket.create
    end

    if bucket.object(file_name).exists?
      raise "Trying to create an remote file that already exists"
    end

    obj = bucket.object(file_name)

    if !obj.upload_file(local_path)
      raise "Unable to upload pdf to remote storage"
    end

    return obj.key
  end
end