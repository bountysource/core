ApplicationRecord.class_eval do
  CLOUDINARY_BASE_URL = ENV['CLOUDINARY_BASE_URL']

  def self.has_cloudinary_image
    self.class_eval do
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

        # Clear image_url to prevent multiple validation on the same instance uploading twice
        @image_url = nil
        if input.blank?
          if cloudinary_id.nil?
            image = randomized_image(rand(108))
            self.cloudinary_id = "upload/#{image}"
          else
            # skip if no new input and image already exists
          end
        elsif input =~ /github/
          self.cloudinary_id = input
        elsif input =~ /^https?:\/\/([a-z0-9]+\.)?gravatar\.com\/avatar\/[a-f0-9]{32}/
          # gravatar URL, just extract hash
          self.cloudinary_id = "gravatar/#{input[/[a-f0-9]{32}/]}"
        elsif input =~ /^https:\/\/identicons\.github\.com\// || input =~ /assets\.github\.com/
          # identicons? quick, assmeble the transformers! er, wait, let's just run!
          image = randomized_image(rand(108))
          self.cloudinary_id = "upload/#{image}"
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
          email_hash = email_hash = Digest::MD5.hexdigest(input)
          response = HTTParty.get("http://gravatar.com/avatar/#{email_hash}.png?d=404")
          if response.code.to_i != 404
            self.cloudinary_id = "gravatar/#{Digest::MD5.hexdigest(input)}"
          else
            image = randomized_image(rand(108))
            self.cloudinary_id = "upload/#{image}"
          end
        else
          errors.add(:image_url, "not recognized: #{input}")
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
        #if cloudinary_url is github do this
        if ( cloudinary_id =~ /github/ )
          "#{cloudinary_id}&s=#{options[:size]}"
        else

          container, filename = (cloudinary_id || '').split('/')
          container, filename = options[:default].split('/') if container.blank? || filename.blank?
          "#{CLOUDINARY_BASE_URL}#{container}/d_#{options[:default].split('/').last},c_pad,w_#{options[:size]},h_#{options[:size]},b_white/#{filename}"
        end
      end

      # return a randomized default image
      def randomized_image(index)
        avatars = ["Bountysource_Animals1_xsnvji.png", "Bountysource_Animals2_fxwiug.png", "Bountysource_Animals3_a9frjr.png", "Bountysource_Animals4_sovwbc.png", "Bountysource_Animals5_imwniv.png", "Bountysource_Animals6_kqeh9m.png", "Bountysource_Animals7_mtr634.png", "Bountysource_Animals8_xevlyu.png", "Bountysource_Animals9_czx74h.png", "Bountysource_Animals10_mjtuws.png", "Bountysource_Animals11_hsamnr.png", "Bountysource_Animals12_mt9ywh.png", "Bountysource_Animals13_edynks.png", "Bountysource_Animals14_bnuacq.png", "Bountysource_Animals15_mdbsxb.png", "Bountysource_Animals16_qlob5k.png", "Bountysource_Animals17_hh0anv.png", "Bountysource_Animals18_yqje9e.png", "Bountysource_Animals19_zafwti.png", "Bountysource_Animals20_rb9i5y.png", "Bountysource_Animals21_ke7cmy.png", "Bountysource_Animals22_s4zuxy.png", "Bountysource_Animals23_azvwug.png", "Bountysource_Animals24_s1h7ax.png", "Bountysource_Animals25_b0xp0r.png", "Bountysource_Animals26_knlvug.png", "Bountysource_Animals27_bjhsl8.png", "Bountysource_Animals28_xmsr5x.png", "Bountysource_Animals29_dcqhig.png", "Bountysource_Animals30_qg3cfm.png", "Bountysource_Animals31_tyt8be.png", "Bountysource_Animals32_kh77zi.png", "Bountysource_Animals33_ch4hs0.png", "Bountysource_Animals34_q3zk2c.png", "Bountysource_Animals35_zl5tae.png", "Bountysource_Animals36_vctv4s.png", "Bountysource_Animals37_sikg8d.png", "Bountysource_Animals38_vwccce.png", "Bountysource_Animals39_qcn9pn.png", "Bountysource_Animals40_lzaxzf.png", "Bountysource_Animals41_p0bqdv.png", "Bountysource_Animals42_tkjsbb.png", "Bountysource_Animals43_s7m0ew.png", "Bountysource_Animals44_xa5xwi.png", "Bountysource_Animals45_ecgl95.png", "Bountysource_Animals46_qe2ye0.png", "Bountysource_Animals47_nvypsc.png", "Bountysource_Animals48_gdsq6s.png", "Bountysource_Animals49_bru8tl.png", "Bountysource_Animals50_vxwrwf.png", "Bountysource_Animals51_byhedz.png", "Bountysource_Animals52_xudczp.png", "Bountysource_Animals53_u6kq6c.png", "Bountysource_Animals54_dothzz.png", "Bountysource_Animals55_vyabeb.png", "Bountysource_Animals56_ktxwet.png", "Bountysource_Animals57_yatmux.png", "Bountysource_Animals58_jhrby2.png", "Bountysource_Animals59_jmxeqg.png", "Bountysource_Animals60_rvpwfe.png", "Bountysource_Animals61_aprjzp.png", "Bountysource_Animals62_hxul6y.png", "Bountysource_Animals63_olgqd6.png", "Bountysource_Animals64_acwwy7.png", "Bountysource_Animals65_g38wlr.png", "Bountysource_Animals66_u8j2j3.png", "Bountysource_Animals67_rzqguf.png", "Bountysource_Animals68_i8kx7y.png", "Bountysource_Animals69_ywrptd.png", "Bountysource_Animals70_t5kjmo.png", "Bountysource_Animals71_wi5cvo.png", "Bountysource_Animals72_jel9in.png", "Bountysource_Animals73_qfzmck.png", "Bountysource_Animals74_zpw0pa.png", "Bountysource_Animals75_a0xqeq.png", "Bountysource_Animals76_g3jfjp.png", "Bountysource_Animals77_gjyiwi.png", "Bountysource_Animals78_hleldd.png", "Bountysource_Animals79_yhuwas.png", "Bountysource_Animals80_vjj88q.png", "Bountysource_Animals81_gydswx.png","Bountysource_Animals82_xinhil.png", "Bountysource_Animals83_ryixly.png", "Bountysource_Animals84_y8fmou.png", "Bountysource_Animals85_aepry9.png", "Bountysource_Animals86_au6xuk.png", "Bountysource_Animals87_vnmrie.png", "Bountysource_Animals88_tvcckn.png", "Bountysource_Animals89_puer8v.png", "Bountysource_Animals90_qlafi0.png", "Bountysource_Animals91_yet95g.png", "Bountysource_Animals92_htl0if.png", "Bountysource_Animals93_ky3nen.png", "Bountysource_Animals94_f7kv4t.png", "Bountysource_Animals95_oicclg.png", "Bountysource_Animals96_rwy9lj.png", "Bountysource_Animals97_iuw00n.png", "Bountysource_Animals98_ot4nxv.png", "Bountysource_Animals99_fzth4k.png", "Bountysource_Animals100_g8py5g.png", "Bountysource_Animals101_nulkio.png", "Bountysource_Animals102_hqrga7.png", "Bountysource_Animals103_lfgw75.png", "Bountysource_Animals104_uyblvi.png", "Bountysource_Animals105_dueqy6.png", "Bountysource_Animals106_irkwuc.png", "Bountysource_Animals107_czlltz.png", "Bountysource_Animals108_mojhfy.png", "Bountysource_Animals109_v8p3nq.png"]
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
