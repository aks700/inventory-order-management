import { useState, useEffect } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          getProducts(),
          getCustomers(),
          getOrders()
        ]);
        setStats({
          products: productsRes.data.length,
          customers: customersRes.data.length,
          orders: ordersRes.data.length
        });
        setRecentOrders(ordersRes.data.slice(-5).reverse());
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Products</h3>
          <div className="count">{stats.products}</div>
        </div>
        <div className="card">
          <h3>Total Customers</h3>
          <div className="count">{stats.customers}</div>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <div className="count">{stats.orders}</div>
        </div>
      </div>

      <div className="table-container">
        <h3 style={{ padding: '16px' }}>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No orders yet</td></tr>
            ) : (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                  <td>₹{order.total_amount.toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
