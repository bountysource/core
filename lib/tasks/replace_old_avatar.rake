desc "Replace old bountysource image with random avatar"
task :replace_old_avatar => :environment do
  puts "Finding old avatars"

  avatars = ["Bountysource_Animals1_xsnvji.png", "Bountysource_Animals2_fxwiug.png", "Bountysource_Animals3_a9frjr.png", "Bountysource_Animals4_sovwbc.png", "Bountysource_Animals5_imwniv.png", "Bountysource_Animals6_kqeh9m.png", "Bountysource_Animals7_mtr634.png", "Bountysource_Animals8_xevlyu.png", "Bountysource_Animals9_czx74h.png", "Bountysource_Animals10_mjtuws.png", "Bountysource_Animals11_hsamnr.png", "Bountysource_Animals12_mt9ywh.png", "Bountysource_Animals13_edynks.png", "Bountysource_Animals14_bnuacq.png", "Bountysource_Animals15_mdbsxb.png", "Bountysource_Animals16_qlob5k.png", "Bountysource_Animals17_hh0anv.png", "Bountysource_Animals18_yqje9e.png", "Bountysource_Animals19_zafwti.png", "Bountysource_Animals20_rb9i5y.png", "Bountysource_Animals21_ke7cmy.png", "Bountysource_Animals22_s4zuxy.png", "Bountysource_Animals23_azvwug.png", "Bountysource_Animals24_s1h7ax.png", "Bountysource_Animals25_b0xp0r.png", "Bountysource_Animals26_knlvug.png", "Bountysource_Animals27_bjhsl8.png", "Bountysource_Animals28_xmsr5x.png", "Bountysource_Animals29_dcqhig.png", "Bountysource_Animals30_qg3cfm.png", "Bountysource_Animals31_tyt8be.png", "Bountysource_Animals32_kh77zi.png", "Bountysource_Animals33_ch4hs0.png", "Bountysource_Animals34_q3zk2c.png", "Bountysource_Animals35_zl5tae.png", "Bountysource_Animals36_vctv4s.png", "Bountysource_Animals37_sikg8d.png", "Bountysource_Animals38_vwccce.png", "Bountysource_Animals39_qcn9pn.png", "Bountysource_Animals40_lzaxzf.png", "Bountysource_Animals41_p0bqdv.png", "Bountysource_Animals42_tkjsbb.png", "Bountysource_Animals43_s7m0ew.png", "Bountysource_Animals44_xa5xwi.png", "Bountysource_Animals45_ecgl95.png", "Bountysource_Animals46_qe2ye0.png", "Bountysource_Animals47_nvypsc.png", "Bountysource_Animals48_gdsq6s.png", "Bountysource_Animals49_bru8tl.png", "Bountysource_Animals50_vxwrwf.png", "Bountysource_Animals51_byhedz.png", "Bountysource_Animals52_xudczp.png", "Bountysource_Animals53_u6kq6c.png", "Bountysource_Animals54_dothzz.png", "Bountysource_Animals55_vyabeb.png", "Bountysource_Animals56_ktxwet.png", "Bountysource_Animals57_yatmux.png", "Bountysource_Animals58_jhrby2.png", "Bountysource_Animals59_jmxeqg.png", "Bountysource_Animals60_rvpwfe.png", "Bountysource_Animals61_aprjzp.png", "Bountysource_Animals62_hxul6y.png", "Bountysource_Animals63_olgqd6.png", "Bountysource_Animals64_acwwy7.png", "Bountysource_Animals65_g38wlr.png", "Bountysource_Animals66_u8j2j3.png", "Bountysource_Animals67_rzqguf.png", "Bountysource_Animals68_i8kx7y.png", "Bountysource_Animals69_ywrptd.png", "Bountysource_Animals70_t5kjmo.png", "Bountysource_Animals71_wi5cvo.png", "Bountysource_Animals72_jel9in.png", "Bountysource_Animals73_qfzmck.png", "Bountysource_Animals74_zpw0pa.png", "Bountysource_Animals75_a0xqeq.png", "Bountysource_Animals76_g3jfjp.png", "Bountysource_Animals77_gjyiwi.png", "Bountysource_Animals78_hleldd.png", "Bountysource_Animals79_yhuwas.png", "Bountysource_Animals80_vjj88q.png", "Bountysource_Animals81_gydswx.png","Bountysource_Animals82_xinhil.png", "Bountysource_Animals83_ryixly.png", "Bountysource_Animals84_y8fmou.png", "Bountysource_Animals85_aepry9.png", "Bountysource_Animals86_au6xuk.png", "Bountysource_Animals87_vnmrie.png", "Bountysource_Animals88_tvcckn.png", "Bountysource_Animals89_puer8v.png", "Bountysource_Animals90_qlafi0.png", "Bountysource_Animals91_yet95g.png", "Bountysource_Animals92_htl0if.png", "Bountysource_Animals93_ky3nen.png", "Bountysource_Animals94_f7kv4t.png", "Bountysource_Animals95_oicclg.png", "Bountysource_Animals96_rwy9lj.png", "Bountysource_Animals97_iuw00n.png", "Bountysource_Animals98_ot4nxv.png", "Bountysource_Animals99_fzth4k.png", "Bountysource_Animals100_g8py5g.png", "Bountysource_Animals101_nulkio.png", "Bountysource_Animals102_hqrga7.png", "Bountysource_Animals103_lfgw75.png", "Bountysource_Animals104_uyblvi.png", "Bountysource_Animals105_dueqy6.png", "Bountysource_Animals106_irkwuc.png", "Bountysource_Animals107_czlltz.png", "Bountysource_Animals108_mojhfy.png", "Bountysource_Animals109_v8p3nq.png"]

  avatars_to_replace = []
  #Find people with gravatar as cloudinary id
  people = Person.where("cloudinary_id ~* ?", '\Agravatar').pluck(:id, :email)

  people.each do |person|
    email_hash = Digest::MD5.hexdigest(person[1])
	  response = HTTParty.get("http://gravatar.com/avatar/#{email_hash}.png?d=404")
	  avatars_to_replace << person[0] if response.code.to_i == 404
	end

  people_group = avatars_to_replace.each_slice((avatars_to_replace.count / avatars.count) + 1).to_a

  avatars.count.times do |i|
  	Person.where(id: people_group[i]).update_all(cloudinary_id: "upload/#{avatars[i]}")
  end

end

