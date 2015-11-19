module Badge

  SHIELDS_HOST = 'https://img.shields.io/'

  class Base
    include ActionView::Helpers::NumberHelper
    include ActionView::Helpers::TextHelper
    include NumberToDollarsHelper

    attr_accessor :subject, :status, :color

    def initialize(status, subject: 'bountysource', color: '129e5e')
      self.subject = subject
      self.status = status
      self.color = color
    end

    def to_xml
      shield_svg
    end

    private

    def shield_url
      escaped_subject = CGI::escape(subject.to_s).gsub('+','%20')
      escaped_status = CGI::escape(status.to_s).gsub('+','%20')
      escaped_color = CGI::escape(color.to_s)
      File.join(SHIELDS_HOST, "/badge/#{escaped_subject}-#{escaped_status}-#{escaped_color}.svg")
    end

    def shield_svg
      url = shield_url
      if badge = BadgeCache.where(url: url).first
        return badge.raw_xml
      else
        response = HTTParty.get(url, timeout: 3, verify: false)
        if response.success?
          BadgeCache.create(url: url, raw_xml: response.body)
          return response.body
        else
          raise "Failed generating badge: #{url}"
        end
      end
    end
  end
end
