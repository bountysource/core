desc "Replace old bountysource image with random avatar"
task :replace_avatar => :environment do
  puts "Finding folks without cloudinary_id"
	Person.where(cloudinary_id: nil).update_all do |person|
		image = person.randomized_image(rand(18))
    person.cloudinary_id = "upload/#{image}"
	end


	SQL = <<-SQL 
		UPDATE people
		SET cloudinary_id = Person.randomized_image(rand(18))
    update test as t set
    column_a = c.column_a,
    column_c = c.column_c
    from (values
           ('123', 1, '---'),
           ('345', 2, '+++')  
         ) as c(column_b, column_a, column_c) 
    where c.column_b = t.column_b;
    SQL

	Person.connection.execute(SQL)
	puts "done."
end


