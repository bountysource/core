desc "Replace old bountysource image with random avatar"
task :replace_avatar => :environment do
 #find everyone with no cloudinary_id
  puts "Finding folks without cloudinary_id"
	Person.where(cloudinary_id: nil).find_each do |person|
	   image = person.randomized_image(rand(18))
	   person.cloudinary_id = "upload/#{image}"
	   person.save
	end 
	puts "done."
end
