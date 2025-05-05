import { supabase } from '@/integrations/supabase/client';

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  payment_method: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_type: string;
    quantity: number;
    price: number;
    size?: string;  // Add size field
  }>;
}

export const orderService = {
  async createOrder(input: CreateOrderInput, userId: string) {
    try {
      const total_amount = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      // Create order with new schema
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: userId,
          customer_name: input.customer_name,
          customer_email: input.customer_email,
          shipping_address: input.shipping_address,
          total_amount,
          status: 'pending',
          payment_method: input.payment_method,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with size information
      const orderItems = input.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_type: item.product_type,
        quantity: item.quantity,
        price: item.price,
        size: item.size,  // Add size to order items
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback order creation if items fail
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      return { order, orderItems };
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  },

  async getOrdersByUser(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }
};
