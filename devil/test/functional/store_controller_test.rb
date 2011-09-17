require '/home/pradeep/MyApplications/depot/devil/test/test_helper'

class StoreControllerTest < ActionController::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  def rescue_action(e) 
	  raise e 
  end
end
