class CartItem

  attr_accessor :product, :quantity
  
  def initialize(product)
    @product = product
    @quantity = 1
  end
  
  def increment_quantity
    @quantity += 1	
  end
  
    def increment_new_quantity(quantity)
      if quantity>1
           @quantity-=1
    end
	    
  end

    def getproductid
     @product.id
    end
      

  def title
    @product.title
  end
  
  def price
    @product.price * @quantity
  end

end  

  



