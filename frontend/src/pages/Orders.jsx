import { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrderStatus, getProducts, getCustomers } from '../api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        getOrders(),
        getProducts(),
        getCustomers()
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }

  function openCreate() {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setError('');
    setShowModal(true);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  }

  function removeItem(index) {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: items.length > 0 ? items : [{ product_id: '', quantity: 1 }] });
  }

  function updateItem(index, field, value) {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const data = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      await createOrder(data);
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  }

  function getCustomerName(customerId) {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : `Customer #${customerId}`;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No orders found</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{getCustomerName(order.customer_id)}</td>
                  <td>{order.items.length} item(s)</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Order</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required>
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>Order Items</label>
                {form.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <select
                      value={item.product_id}
                      onChange={e => updateItem(index, 'product_id', e.target.value)}
                      required
                      style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock}) - ${p.price}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', e.target.value)}
                      required
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      placeholder="Qty"
                    />
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>
                  + Add Item
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
