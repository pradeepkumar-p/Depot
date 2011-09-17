require 'rubygems'
require 'net/http'
require 'uri'

class GeotrioApi
	
	def create_tour(tour_title,user_name)
		url = URI.parse('http://192.168.1.29:3000/api/v2/tours/new')
		res = Net::HTTP.start(url.host, url.port) {|http|
			http.get("/api/v2/tours/new?title=#{tour_title}&username=#{user_name}")
		}
		puts res.body
	end

	def create_stops(tour_id,stoplatitude,stoplongitude,tracklatitude,tracklongitude)
		url = URI.parse("http://192.168.1.29:3000/api/v2/tours/#{tour_id}/stops/new")
		res = Net::HTTP.start(url.host, url.port) {|http|
			http.get("/api/v2/tours/#{tour_id}/stops/new/?slat=#{stoplatitude}&slong=#{stoplongitude}&tlat=#{tracklatitude}&tlong=#{tracklongitude}")
		}
		puts res.body
	end

end
