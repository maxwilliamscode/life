import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter
} from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Package, Truck, CheckCircle, AlertTriangle, Clock, Search, Filter, ArrowUpDown, RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_type?: string;
  size?: string;
}

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            product_id,
            product_name,
            quantity,
            price,
            product_type,
            size
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        toast({
          title: 'Error fetching orders',
          description: ordersError.message,
          variant: 'destructive'
        });
        return;
      }

      // Ensure order_items is always an array
      const processedOrders = (ordersData || []).map(order => ({
        ...order,
        items: order.order_items || []
      }));

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setCurrentOrder(order);
    setIsUpdateDialogOpen(true);
  };

  const saveStatusUpdate = async () => {
    if (!currentOrder) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: currentOrder.status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentOrder.id);
      
      if (error) throw error;
      
      await fetchOrders(); // Refresh orders after update
      
      toast({
        title: 'Status updated',
        description: `Order ${currentOrder.id} status changed to ${currentOrder.status}`,
      });
      
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Package className="mr-1 h-3 w-3" /> Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">
          <AlertTriangle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };
  
  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredOrders = orders
    .filter(order => {
      // Apply status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.customer_email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Apply sorting
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="space-y-6 p-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </div>
            <ShadcnButton 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </ShadcnButton>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Products</TableHead>
                  <TableHead className="w-[100px]">Total</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aqua-700"></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Loading orders...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="text-gray-500">No orders found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                          {/* Show product count on mobile */}
                          <div className="md:hidden text-sm text-gray-500 mt-1">
                            {(order.items || []).length} items
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {(order.items || []).length} items
                      </TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ShadcnButton
                            size="icon"
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </ShadcnButton>
                          <ShadcnButton
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdateStatus(order)}
                            className="hidden sm:inline-flex"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </ShadcnButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-lg border p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Items</p>
                    <p className="font-medium">{(order.items || []).length}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <ShadcnButton size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </ShadcnButton>
                  <ShadcnButton 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpdateStatus(order)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Update
                  </ShadcnButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Order #{currentOrder?.id.slice(-6)}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {currentOrder && (
                <>
                  <span>Placed on {formatDate(currentOrder.created_at)}</span>
                  <span>•</span>
                  {getStatusBadge(currentOrder.status)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order Status</span>
                        <span>{getStatusBadge(currentOrder.status)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium">{currentOrder.payment_method}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order Date</span>
                        <span className="font-medium">{formatDate(currentOrder.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium">{currentOrder.customer_name}</p>
                        <p className="text-sm text-gray-500">{currentOrder.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                        <p className="text-sm">{currentOrder.shipping_address}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Order Items Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg overflow-hidden border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOrder.items.map((item) => (
                            <TableRow key={item.product_id}>
                              <TableCell className="font-medium">
                                {item.product_name}
                                {item.product_type === 'fish' && item.size && (
                                  <div className="text-sm text-aqua-600 mt-1">
                                    Size: {item.size}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {item.product_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.price)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.price * item.quantity)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={4}>Subtotal</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(currentOrder.total_amount)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4}>Shipping</TableCell>
                            <TableCell className="text-right">Free</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(currentOrder.total_amount)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="pt-4">
            <ShadcnButton onClick={() => setIsViewDialogOpen(false)}>
              Close
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {currentOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select 
                  value={currentOrder.status} 
                  onValueChange={(value: Order['status']) => 
                    setCurrentOrder({...currentOrder, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </ShadcnButton>
            <ShadcnButton onClick={saveStatusUpdate}>
              Save Changes
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
