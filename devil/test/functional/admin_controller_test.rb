require File.dirname(__FILE__) + '/../test_helper'
require 'admin_controller'


class AdminControllerTest < ActionController::TestCase
  fixtures :users
  def setup
    @controller = AdminController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end

  
  if false
    
    def test_index 
      get :index 
      assert_response :success 
    end
    
  end

  
  def test_index_without_user
    get :index
    assert_redirected_to :action => "login"
    assert_equal "Please log in", flash[:notice]
  end
  
  def test_index_with_user
    get :index, {}, { :user_id => users(:pradeep).id }
    assert_response :success
    assert_template "index"
  end
  
  def test_login
    dave = users(:dave)
    post :login, :name => dave.name, :password => 'secret'
    assert_redirected_to :action => "index"
    assert_equal dave.id, session[:user_id]
  end
  
  def test_bad_password
    dave = users(:dave)
    post :login, :name => dave.name, :password => 'wrong'
    assert_template "login"
  end
end
