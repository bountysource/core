class ActiveRecord::Base
  CLOUDINARY_BASE_URL = ENV['CLOUDINARY_BASE_URL']
  
  def self.has_cloudinary_image
    self.class_eval do

      attr_accessible :cloudinary_id, :image_url
      attr_writer :image_url

      # TAKES LOTS OF FORMATS
      #   "http://..." -- uploads image automatically
      #   "twitter:bountysource" -- username only
      #   "twitter_uid:12345" -- UID only
      #   "facebook:bountysource" -- username or UID
      #   "user@something.com" -- email address auto-hashed to gravatar URL
      #   "a676b67565c6767a6767d6767f676fe1" -- hash assumed to be gravtar URL

      before_validation do
        input = @image_url
        
        if input.blank?
          return
        elsif input =~ /^https?:\/\/([a-z0-9]+\.)?gravatar\.com\/avatar\/[a-f0-9]{32}/
          # gravatar URL, just extract hash
          self.cloudinary_id = "gravatar/#{input[/[a-f0-9]{32}/]}"
        elsif input =~ /github/
          Rails.logger.info "CLOUDINARY: Uploading image URL to cloudinary: #{input}"
          response = Cloudinary::Uploader.upload(input, discard_original_filename: true).with_indifferent_access
          self.cloudinary_id = "upload/" + response[:url].split('/').last
        elsif input =~ /^https:\/\/identicons\.github\.com\// || input =~ /assets\.github\.com/
          # identicons? quick, assmeble the transformers! er, wait, let's just run!
          self.cloudinary_id = nil
        elsif (matches = input.match(/^#{CLOUDINARY_BASE_URL}([a-z_]+)\/.*?([^\/]+)$/))
          # already a cloudinary image, just extract container and filename
          self.cloudinary_id = "#{matches[1]}/#{matches[2]}"
        elsif input =~ /^https?:\/\//
          begin
            # normal URL, try downloading it
            Rails.logger.info "CLOUDINARY: Uploading image URL to cloudinary: #{input}"
            response = Cloudinary::Uploader.upload(input, discard_original_filename: true).with_indifferent_access
            self.cloudinary_id = "upload/" + response[:url].split('/').last
          rescue
            errors.add(:image_url, "wasn't found")
          end
        elsif input =~ /^twitter:[A-Za-z0-9_]{1,15}$/
          # twitter images allow transparency, so let's use .png for everything
          self.cloudinary_id = "twitter_name/#{input.split(':').last}.png"
        elsif input =~ /^twitter_uid:\d+$/
          # twitter images allow transparency, so let's use .png for everything
          self.cloudinary_id = "twitter/#{input.split(':').last}.png"
        elsif input =~ /^facebook:[A-Za-z0-9.]+$/
          # facebook only allows jpg, so might as well force it
          self.cloudinary_id = "facebook/#{input.split(':').last}.jpg"
        elsif input =~ /^gravatar:[a-f0-9]{32}$/ || input =~ /^[a-f0-9]{32}$/
          # gravatar hash
          self.cloudinary_id = "gravatar/#{input.split(':').last}"
        elsif input =~ /^([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})$/i
          # email address... hash it for gravatar
          self.cloudinary_id = "gravatar/#{Digest::MD5.hexdigest(input)}"
        else
          errors.add(:image_url, "not recognized: #{input}")
        end

        if self.cloudinary_id.nil?
          image = randomized_image(rand(18))
          self.cloudinary_id = "upload/#{image}"
        end
      end

      def has_image?
        cloudinary_id.present?
      end

      # return 100px square default image
      def image_url(options={})
        
        options = {
          size: 100,
          default: "upload/noaoqqwxegvmulwus0un.png" # big gray B
        }.merge(options)

        container, filename = (cloudinary_id || '').split('/')
        container, filename = options[:default].split('/') if container.blank? || filename.blank?
        "#{CLOUDINARY_BASE_URL}#{container}/d_#{options[:default].split('/').last},c_pad,w_#{options[:size]},h_#{options[:size]},b_white/#{filename}"
      end

      # return a randomized default image
      def randomized_image(index)
        # avatars = ["somecat_asunu9.png", "snake_u4dgtd.png", "pig_dfcnhd.png", "panther_icp2bi.png", "panda_sdu77u.png", "monkey_bmcetd.png", "lion_wsmfjz.png", "leaf_x9n8db.png", "koala_x1a7sj.png", "grasshopper_xlfeu8.png", "goat_oxsdh2.png", "frog_zzcmuy.png", "fox_byssge.png", "duck_exyai1.png", "cow_ricpqp.png", "chick_aggmvs.png", "bear_uonphf.png", "mouse_x7tc4w.png"]

        avatars = ["bear_nrk1bi.png", "mouse_x7tc4w.png", "chick_j0wkni.png", "cow_mcjryl.png", "fox_eckias.png", "frog_yyde6n.png", "grasshopper_jpaof7.png", "koala_doq8nt.png", "lion_vdpp3z.png", "monkey_hptfsk.png", "panda_gd5ucw.png", "panther_jtwlsg.png", "penguin_bvn3mx.png", "pig_iy3ma0.png", "plant_awhajx.png", "ram_hzxrgv.png", "snake_g3li4z.png", "somecat_krdhos.png"  ]
        avatars[index] 
      end

      def medium_image_url
        image_url(size: 200)
      end

      def large_image_url
        image_url(size: 400)
      end

    end
  end
end
