module Features
  module SessionHelpers
    def expect_signin(person)
      expect(current_path).to eq('/signin')
      fill_in 'email', with: person.email
      fill_in 'password', with: person.password
      click_button "Sign In"
      click_button "Not interested"
      expect(current_path).not_to eq('/signin')
    end

    # def sign_up_with(email, password)
    #   visit sign_up_path
    #   fill_in 'Email', with: email
    #   fill_in 'Password', with: password
    #   click_button 'Sign up'
    # end
    #
    # def sign_in
    #   user = create(:user)
    #   visit sign_in_path
    #   fill_in 'Email', with: user.email
    #   fill_in 'Password', with: user.password
    #   click_button 'Sign in'
    # end
  end
end