# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_devil_session',
  :secret      => '4c44d83cdd41c933a85ca1412a6ce08d817edf99c2375eabf116a9ae9e67e91a9d7eab2661056d0a193eaf8a38b422416861872f3b549c06a48c8f613a484e25'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
