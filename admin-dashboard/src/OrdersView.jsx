import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Check, X, CreditCard } from 'lucide-react';
import './OrdersView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, partnersRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`),
        axios.get(`${API_URL}/api/delivery-partners`)
      ]);
      // Sort orders by date descending
      const sortedOrders = ordersRes.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sortedOrders);
      setDeliveryPartners(partnersRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Error loading orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    try {
      await axios.put(`${API_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
        status: 'ASSIGNED',
        deliveryPartnerId: partnerId
      });
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Failed to assign partner:", err);
      alert("Error assigning delivery partner.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
        status: newStatus
      });
      fetchData();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Order Management</h2>
        <button onClick={fetchData} className="refresh-btn">Refresh</button>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Delivery Partner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="9" className="no-orders">No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td>
                    <div style={{fontWeight: 'bold'}}>{order.customerid}</div>
                    {order.deliveryAddress ? (
                       <small style={{color: '#666', display: 'block', marginTop: '4px'}}>
                         {order.deliveryAddress.houseNumber && <span>{order.deliveryAddress.houseNumber}, </span>}
                         {order.deliveryAddress.buildingName && <span>{order.deliveryAddress.buildingName}, </span>}
                         {order.deliveryAddress.street && <div>{order.deliveryAddress.street}</div>}
                         {order.deliveryAddress.area && <div>{order.deliveryAddress.area}</div>}
                         {order.deliveryAddress.city && <div>{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</div>}
                         {(order.deliveryAddress.latitude && order.deliveryAddress.longitude) ? 
                            <div style={{color: '#007bff', marginTop: 4}}>📍 GPS Confirmed</div> : null
                         }
                       </small>
                    ) : (
                       <small style={{color: '#999'}}>No Address ({order.addressid})</small>
                    )}
                  </td>
                  <td>
                    <div className="order-items-list">
                      {order.items && order.items.map(item => (
                        <div key={item.id} className="item-badge">
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="order-total">₹{parseFloat(order.total).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge payment-${(order.paymentStatus || '').toLowerCase()}`}>
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${(order.status || '').toLowerCase().replace('_', '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="partner-select"
                      value={order.deliveryPartnerId || ''}
                      onChange={(e) => handleAssignPartner(order.id, e.target.value)}
                    >
                      <option value="" disabled>Assign Partner...</option>
                      {deliveryPartners.map(dp => (
                        <option key={dp.id} value={dp.id}>{dp.name} ({dp.phone})</option>
                      ))}
                    </select>
                  </td>
                  <td className="actions-cell">
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                       <select 
                         className="status-action-select"
                         value=""
                         onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                       >
                         <option value="" disabled>Update Status...</option>
                         <option value="ASSIGNED">Mark Assigned</option>
                         <option value="OUT_FOR_DELIVERY">Mark Out for Delivery</option>
                         <option value="DELIVERED">Mark Delivered</option>
                         <option value="CANCELLED">Cancel Order</option>
                       </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersView;
