class String
  def to_bool
    return true if self == true || self =~ (/(true|t|yes|y|1|on)$/i)
    return false if self == false || self.blank? || self =~ (/(false|f|no|n|0||off)$/i)
    raise ArgumentError.new("invalid value for Boolean: \"#{self}\"")
  end
end

class Integer
  def to_bool
    return true if self == 1
    return false if self == 0
    raise ArgumentError.new("invalid value for Boolean: \"#{self}\"")
  end
end

class TrueClass
  def to_bool
    true
  end
end

class FalseClass
  def to_bool
    false
  end
end

class NilClass
  def to_bool
    false
  end
end
