if Rails.env.production?
  Searchkick.aws_credentials = {
    access_key_id: ENV["AWS_ACCESS_KEY_ID"],
    secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"],
    region: "us-east-1"
  } 
end