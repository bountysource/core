# == Schema Information
#
# Table name: postbacks
#
#  id         :integer          not null, primary key
#  namespace  :string(255)
#  method     :string(255)
#  url        :string(255)
#  raw_post   :text
#  headers    :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Postback < ApplicationRecord
  def self.my_url
    "https://api-qa.bountysource.com/postbacks/#{`hostname`.strip}"
  end

  def self.retrieve(clear=false)
    uri = URI.parse(my_url + "/retrieve" + (clear ? '?clear=true' : ''))
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.port == 443)
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.get(uri.request_uri)

    JSON.parse(response.body).map do |json|
      Postback.new(
        method: json['method'],
        url: json['url'],
        raw_post: json['raw_post'],
        headers: json['headers']
      )
    end
  end

end
