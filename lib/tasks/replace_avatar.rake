desc "Replace old bountysource image with random avatar"
task :replace_avatar => :environment do
  puts "Finding folks without cloudinary_id"
	
  avatars = ["bear_nrk1bi.png", "mouse_x7tc4w.png", "chick_j0wkni.png", "cow_mcjryl.png", "fox_eckias.png", "frog_yyde6n.png", "grasshopper_jpaof7.png", "koala_doq8nt.png", "lion_vdpp3z.png", "monkey_hptfsk.png", "panda_gd5ucw.png", "panther_jtwlsg.png", "penguin_bvn3mx.png", "pig_iy3ma0.png", "plant_awhajx.png", "ram_hzxrgv.png", "snake_g3li4z.png", "somecat_krdhos.png"  ]

  people = Person.where(cloudinary_id: nil).pluck(:id).shuffle!
 
  people_group = people.each_slice((people.count / 18) + 1)
 
  18.times do |i|
    Person.where(id: people_group[i]).update_all(cloudinary_id: "upload/#{avatars[i]}")
  end
  puts "done."
end


