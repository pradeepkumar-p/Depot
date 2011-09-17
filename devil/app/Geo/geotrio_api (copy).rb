require 'rubygems'
require 'net/http'
require 'uri'

class GeotrioApi
	
def create_tour(tour_title,user_name)
	puts a.inspect
	puts b.inspect
	
url = URI.parse('http://192.168.1.29:3000/api/v2/tours/new')
res = Net::HTTP.start(url.host, url.port) {|http|
	http.get("/api/v2/tours/new?title=#{tour_title}&username=#{user_name}")
}
puts res.body
end

end
