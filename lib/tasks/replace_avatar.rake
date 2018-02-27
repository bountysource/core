desc "Replace old bountysource image with random avatar"
task :replace_avatar => :environment do
  puts "Finding folks without cloudinary_id"
	Person.where(cloudinary_id: nil).update_all(cloudinary_id: "upload/#{Person.randomized_image(rand(18))}")
	puts "done."
end


