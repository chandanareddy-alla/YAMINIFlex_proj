import { useEffect, useMemo, useState } from 'react';
import {
  FaImages,
  FaClipboardList,
  FaUsers,
  FaThLarge,
  FaPlus,
  FaEye,
  FaEdit,
  FaFileAlt,
  FaCheck,
  FaClock,
  FaMoneyBillWave,
  FaBoxes,
} from 'react-icons/fa';
import { api } from '../../api/client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    designs: 0,
    categories: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [orders, setOrders] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/designs', { limit: 8, page: 1 }),
      api.get('/admin/categories'),
      api.get('/admin/orders', { limit: 6, page: 1 }),
      api.get('/admin/customers', { limit: 1 }),
    ])
      .then(([designsRes, categories, ordersRes, customers]) => {
        const orderList = ordersRes.data || [];
        const revenue = orderList.reduce((sum, order) => sum + Number(order.totalAmount || order.grandTotal || 0), 0);

        setStats({
          designs: designsRes.pagination?.total ?? 0,
          categories: categories.count ?? categories.data?.length ?? 0,
          orders: ordersRes.pagination?.total ?? 0,
          customers: customers.pagination?.total ?? 0,
          revenue,
        });

        setOrders(orderList);
        setDesigns(designsRes.data || []);
      })
      .catch(() => {
        setOrders([]);
        setDesigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const key = order.status || 'pending';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { pending: 0, confirmed: 0, 'in-progress': 0, 'awaiting-approval': 0, approved: 0, ready: 0, delivered: 0, cancelled: 0 }
    );
  }, [orders]);

  const kpi = [
    { label: 'Total Designs', value: stats.designs, icon: <FaImages />, className: 'kpi-designs' },
    { label: 'Total Categories', value: stats.categories, icon: <FaThLarge />, className: 'kpi-categories' },
    { label: 'Total Orders', value: stats.orders, icon: <FaClipboardList />, className: 'kpi-orders' },
    { label: 'Total Customers', value: stats.customers, icon: <FaUsers />, className: 'kpi-customers' },
  ];

  const topOrder = orders?.[0];

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard-head">
        <div>
          <span className="admin-dashboard-kicker">COMMAND CENTER</span>
          <h1 className="admin-dashboard-title">Studio Operations Command Center</h1>
          <p className="admin-dashboard-subtitle">Real-time overview for large-format flex printing, Anu Telugu DTP proofs, and counter deliveries across Cherukupalli.</p>
        </div>
        <div className="admin-dashboard-actions">
          <button className="admin-dashboard-btn admin-dashboard-btn-primary"><FaPlus /> Add Design</button>
          <button className="admin-dashboard-btn admin-dashboard-btn-secondary"><FaClipboardList /> Add Category</button>
          <button className="admin-dashboard-btn admin-dashboard-btn-secondary"><FaFileAlt /> View Orders</button>
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        {kpi.map((card) => (
          <article key={card.label} className="dashboard-kpi-card">
            <div className="dashboard-kpi-card-top">
              <span className="dashboard-kpi-icon">{card.icon}</span>
              <span className="dashboard-kpi-label">{card.label}</span>
            </div>
            <div className="dashboard-kpi-value">{card.value}</div>
            <div className="dashboard-kpi-split">
              <span className="dashboard-kpi-line"></span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <span><FaClipboardList /> Today&apos;s Press &amp; DTP Workflow Overview</span>
          <span className="dashboard-live-badge">Live</span>
        </div>
        <div className="workflow-overview">
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 01</span>
            <span className="workflow-stage-number">{statusCounts.pending || 0}</span>
            <span className="workflow-stage-title">New Orders</span>
            <span className="workflow-stage-meta">Awaiting intake</span>
          </article>
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 02</span>
            <span className="workflow-stage-number">{statusCounts['in-progress'] || 0}</span>
            <span className="workflow-stage-title">Payment Pending</span>
            <span className="workflow-stage-meta">Pricing review</span>
          </article>
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 03</span>
            <span className="workflow-stage-number">{statusCounts['awaiting-approval'] || 0}</span>
            <span className="workflow-stage-title">Design in Progress</span>
            <span className="workflow-stage-meta">DTP Revision</span>
          </article>
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 04</span>
            <span className="workflow-stage-number">{statusCounts.approved || 0}</span>
            <span className="workflow-stage-title">Final Design</span>
            <span className="workflow-stage-meta">Approved</span>
          </article>
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 05</span>
            <span className="workflow-stage-number">{statusCounts.ready || 0}</span>
            <span className="workflow-stage-title">Printing</span>
            <span className="workflow-stage-meta">Output queue</span>
          </article>
          <article className="workflow-stage">
            <span className="workflow-stage-index">Stage 06</span>
            <span className="workflow-stage-number">{statusCounts.delivered || 0}</span>
            <span className="workflow-stage-title">Completed</span>
            <span className="workflow-stage-meta">Ready dispatch</span>
          </article>
        </div>
      </section>

      <section className="dashboard-orders">
        <div className="section-title-row">
          <div>
            <span className="section-row-title"><FaClipboardList /> Recent Orders</span>
            <span className="section-row-subtitle">Live order list and delivery status</span>
          </div>
          <button className="admin-dashboard-btn admin-dashboard-btn-small">All Orders</button>
        </div>

        {loading ? (
          <div className="dashboard-loader">Loading orders...</div>
        ) : (
          <div className="dashboard-order-list">
            {orders.length === 0 ? (
              <div className="empty-orders">No recent orders found.</div>
            ) : (
              orders.map((order) => (
                <article className="dashboard-order-row" key={order._id || order.orderId}>
                  <div className="dashboard-order-id">#{order.orderId || order._id}</div>
                  <div className="dashboard-order-customer">
                    <span className="dashboard-order-customer-name">{order.name || 'Customer'}</span>
                    <span className="dashboard-order-customer-phone">{order.phone || ''}</span>
                  </div>
                  <div className="dashboard-order-design">
                    <span className="dashboard-order-design-title">{order.design?.title || 'Flex Design'}</span>
                    <span className="dashboard-order-design-detail">{order.size || 'Custom'} • {order.quantity || 1} Qty</span>
                  </div>
                  <div className="dashboard-order-amount">₹{Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}</div>
                  <div className="dashboard-order-status">
                    <span className={`order-status status-${order.status || 'pending'}`}>{order.status || 'Pending'}</span>
                  </div>
                  <div className="dashboard-order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}</div>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <section className="dashboard-designs">
        <div className="section-title-row">
          <div>
            <span className="section-row-title"><FaImages /> Recently Added Designs</span>
            <span className="section-row-subtitle">Latest design files and catalogue assets</span>
          </div>
          <button className="admin-dashboard-btn admin-dashboard-btn-small"><FaPlus /> Add Design</button>
        </div>

        <div className="dashboard-design-grid">
          {designs.length === 0 ? (
            <div className="empty-designs">No designs added yet.</div>
          ) : (
            designs.map((design) => (
              <article className="dashboard-design-card" key={design._id}>
                <div className="dashboard-design-image">
                  {design.thumbnail ? <img src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}${design.thumbnail}`} alt="" /> : <span className="dashboard-design-image-alt"><FaImages /></span>}
                </div>
                <div className="dashboard-design-content">
                  <span className="dashboard-design-category">{design.category?.name || 'Print Design'}</span>
                  <span className="dashboard-design-title">{design.title}</span>
                  <div className="dashboard-design-meta">
                    <span>{design.price ? `₹${design.price}` : 'Custom'}</span>
                    <span>{design.isFeatured ? 'Featured' : 'Catalog'}</span>
                  </div>
                  <div className="dashboard-design-actions">
                    <button className="mini-btn"><FaEye /> Preview</button>
                    <button className="mini-btn"><FaEdit /> Edit</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-revenue">
        <article className="dashboard-revenue-card">
          <span className="dashboard-revenue-icon"><FaMoneyBillWave /></span>
          <div>
            <span className="dashboard-revenue-label">Revenue Today</span>
            <span className="dashboard-revenue-value">₹{stats.revenue.toLocaleString('en-IN')}</span>
          </div>
        </article>
        <article className="dashboard-revenue-card">
          <span className="dashboard-revenue-icon"><FaBoxes /></span>
          <div>
            <span className="dashboard-revenue-label">Active Production</span>
            <span className="dashboard-revenue-value">{Math.max(1, statusCounts['in-progress'] || 0 + statusCounts.ready || 0)}</span>
          </div>
        </article>
        <article className="dashboard-revenue-card">
          <span className="dashboard-revenue-icon"><FaClock /></span>
          <div>
            <span className="dashboard-revenue-label">Pending Review</span>
            <span className="dashboard-revenue-value">{statusCounts['awaiting-approval'] || 0}</span>
          </div>
        </article>
      </section>

      {topOrder && (
        <section className="dashboard-alert">
          <span><FaCheck /> Latest order #{topOrder.orderId || topOrder._id} is now {topOrder.status || 'pending'}.</span>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
