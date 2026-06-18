import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', sku: '', price: '', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', sku: '', price: '', stock: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const data = {
      name: form.name,
      description: form.description || null,
      sku: form.sku,
      price: parseFloat(form.price),
      stock: parseInt(form.stock)
    };

    try {
      if (editing) {
        await updateProduct(editing.id, { name: data.name, description: data.description, price: data.price, stock: data.stock });
      } else {
        await createProduct(data);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><code>{product.sku}</code></td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(product)} style={{ marginRight: '8px' }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required disabled={!!editing} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
