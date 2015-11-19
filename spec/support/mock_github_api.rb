class MockGithubApi

  def method_missing(*args)
    true
  end

  class Success < MockGithubApi
    def success?
      true
    end
  end

  class Error < MockGithubApi
    def success?
      false
    end
  end

end