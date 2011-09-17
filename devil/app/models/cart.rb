class Cart 
  attr_accessor :items   
  
  def initialize
    @items = []
  end
  
  def add_product(product)
    current_item = @items.find {|item| item.product == product}
    if current_item
      current_item.increment_quantity
    else      
      current_item = CartItem.new(product)
      @items << current_item 
    end
    current_item
  end

  def total_price
     @items.sum { |item| item.price }
  end

  def total_items
     @items.sum { |item| item.quantity }
  end

#def inc_pro_quantity(total_price)
  #  @a=total_price
  #  getprice(@a)
   # unless current_item.empty?
    #  current_item.quantity = quantity
   #end
  # current_item.quantity

#end

def update_product(product)
   current_item = @items.find {|item| item.product == product}
   @price=current_item.price
   @quantity=current_item.quantity
   @tot=@price * @quantity
    if current_item
      current_item.increment_new_quantity(@quantity)
    end
    current_item
end

def remove_product(product)
   @items.delete_if {|item| item.product == product }
end

  
end

