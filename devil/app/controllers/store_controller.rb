class StoreController < ApplicationController
before_filter :find_cart, :except => :empty_cart
  def index
    @products = Product.find_products_for_sale
    @cart = find_cart
  end
  
  def add_to_cart
  begin
    product = Product.find(params[:id])
    @cart = find_cart
    @current_item = @cart.add_product(product)
    respond_to do |format|
    format.js if request.xhr?
    format.html {redirect_to_index}
    end
  rescue ActiveRecord::RecordNotFound
    logger.error("Attempt to access invalid product #{params[:id]}")
    redirect_to_index("Invalid Product")
  end
  end

  def checkout
    @cart = find_cart
    if @cart.items.empty?
      redirect_to_index("Your cart is empty")
    else
      @order = Order.new
    end
  end
  

  
  def save_order
    @cart = find_cart
    @order = Order.new(params[:order]) 
    @order.add_line_items_from_cart(@cart) 
    if @order.save                     
      session[:cart] = nil
      redirect_to_index("Thank you for your order")
    else
      render :action => 'checkout'
    end
  end

   # def cart_update
    #    @product = Product.find(params[:id])
    #    @cart = find_cart
   #     @quantity = params[:cart_item][:quantity]
    #    @price=@product.price
  #      @total_price =@price  * @quantity.to_i
#	
#	puts @total_price.inspect
	#@cart.total_price
        
    #    @cart.total_price 
   #      render(:partial => "cart_item", :object => @product) 
#	redirect_to_index  
 #   end
  
  def cart_update
  begin
    product = Product.find(params[:id])
    @cart = find_cart

    @current_item = @cart.update_product(product)
  
   
    respond_to do |format|
    format.js if request.xhr?
    format.html {redirect_to_index}
    end
  rescue ActiveRecord::RecordNotFound
    logger.error("Attempt to access invalid product #{params[:id]}")
    redirect_to_index("Invalid Product")

  end

  end

    def remove_cart_item
        @product = Product.find(params[:id])
        @cart = find_cart
        @cart.remove_product(@product)
        redirect_to_index("The item was removed")
    end



  def empty_cart
    session[:cart] = nil
    redirect_to_index
  end

  


private

  def redirect_to_index(msg = nil)
    flash[:notice] = msg if msg
    redirect_to :action => 'index'
  end


  def find_cart
   @cart = (session[:cart] ||= Cart.new)
  end


protected

  def authorize
   
  end


end

