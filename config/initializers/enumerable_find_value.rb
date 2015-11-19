module Enumerable
  def find_value
    each { |i| obj = yield(i); return obj unless obj.nil? }
    nil
  end
end
