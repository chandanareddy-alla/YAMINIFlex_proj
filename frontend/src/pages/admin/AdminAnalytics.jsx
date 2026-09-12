import { useEffect, useMemo, useState } from 'react';
import {
  FaArrowTrendUp,
  FaBoxesStacked,
  FaCalendarDay,
  FaChartBar,
  FaClipboardList,
  FaDownload,
  FaFilter,
  FaMoneyBillWave,
  FaArrowsRotate,
  FaMagnifyingGlass,
  FaXmark,
  FaUsers,
} from 'react-icons/fa6';
import { api } from '../../api/client';
import './AdminAnalytics.css';

const RANGE_OPTIONS = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  'awaiting-approval': 'Awaiting Approval',
  approved: 'Approved',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const AdminAnalytics = () => {
  const [range, setRange] = useState('month');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/orders', { page: 1, limit: 100 }),
      api.get('/admin/customers', { page: 1, limit: 100 }),
      api.get('/admin/categories'),
      api.get('/admin/designs', { page: 1, limit: 100 }),
    ])
      .then(([ordersRes, customersRes, categoriesRes, designsRes]) => {
        const orderList = ordersRes?.data || [];
        const customerList = customersRes?.data || [];
        const categoryList = categoriesRes?.data || [];
        const designList = designsRes?.data || [];

        setOrders(orderList);
        setCustomers(customerList);
        setCategories(categoryList);
        setDesigns(designList);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Unable to load analytics');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rangeDays = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const days = rangeDays[range] || 30;

    return orders.filter((order) => {
      const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
      const diff = Math.max(0, Math.round((now - createdAt) / 86400000));
      return diff <= days;
    });
  }, [orders, range]);

  const searchedOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return filteredOrders;

    return filteredOrders.filter((order) => {
      const customer = order.name || order.customer?.name || '';
      const phone = order.phone || order.customer?.phone || '';
      const design = order.design?.title || '';
      const id = order.orderId || order._id || '';
      return `${id} ${customer} ${phone} ${design}`.toLowerCase().includes(term);
    });
  }, [filteredOrders, search]);

  const totals = useMemo(() => {
    const totalRevenue = searchedOrders.reduce((sum, order) => sum + Number(order.totalAmount || order.grandTotal || 0), 0);
    const totalOrders = searchedOrders.length;
    const totalVolume = searchedOrders.reduce((sum, order) => sum + Number(order.quantity || 1), 0);
    const uniqueCustomers = new Set(searchedOrders.map((order) => order.customer?._id || order.phone || order.email || order.name)).size;

    const statusCounts = STATUS_LABELS ? STATUS_LABELS : {};
    const statusMap = searchedOrders.reduce((acc, order) => {
      const key = order.status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const averageValue = totalOrders ? totalRevenue / totalOrders : 0;
    const categoryCount = categories.length;
    const designCount = designs.length;
    const customerCount = customers.length;

    return {
      totalRevenue,
      totalOrders,
      totalVolume,
      averageValue,
      uniqueCustomers,
      categoryCount,
      designCount,
      customerCount,
      statusMap,
      statusCounts,
    };
  }, [searchedOrders, customers.length, categories.length, designs.length]);

  const chartData = useMemo(() => {
    const buckets = {
      day: 24,
      week: 7,
      month: 30,
      year: 12,
    };

    const points = Array.from({ length: buckets[range] || 30 }, (_, i) => {
      const bucketItems = searchedOrders.filter((order) => {
        const created = order.createdAt ? new Date(order.createdAt) : new Date();
        const now = new Date();
        const diff = Math.max(0, Math.round((now - created) / 86400000));
        if (range === 'day') return i < 24 && new Date(order.createdAt).getHours() === i;
        if (range === 'week') return diff >= i && diff < i + 1;
        if (range === 'year') return new Date(order.createdAt).getMonth() === i;
        return diff >= i && diff < i + 1;
      });

      return {
        label: range === 'year' ? new Date(2026, i, 1).toLocaleString('en-US', { month: 'short' }) : `${i + 1}`,
        value: bucketItems.reduce((sum, order) => sum + Number(order.totalAmount || order.grandTotal || 0), 0),
      };
    });

    return points;
  }, [searchedOrders, range]);

  const maxChartValue = Math.max(...chartData.map((bar) => bar.value), 1);

  return (
    <div className="admin-analytics-page">
      <section className="analytics-top">
        <div>
          <span className="analytics-kicker">Admin / Analytics</span>
          <h1 className="analytics-title">Analytics Dashboard</h1>
          <p className="analytics-subtitle">Live studio performance, sales, customer and production intelligence.</p>
        </div>

        <div className="analytics-top-actions">
          <button className="analytics-button analytics-button-soft"><FaCalendarDay /> {RANGE_OPTIONS[range]}</button>
          <button className="analytics-button analytics-button-dark"><FaDownload /> Export</button>
          <button className="analytics-button analytics-button-primary"><FaArrowsRotate /> Refresh</button>
        </div>
      </section>

      <section className="analytics-filter-strip">
        <div className="analytics-filter-tabs">
          {Object.entries(RANGE_OPTIONS).map(([key, label]) => (
            <button key={key} className={`analytics-range ${range === key ? 'active' : ''}`} onClick={() => setRange(key)}>{label}</button>
          ))}
        </div>

        <div className="analytics-search">
          <FaMagnifyingGlass />
          <input value={search} placeholder="Search order/customer/design" onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      {error && <div className="analytics-error">{error}</div>}

      {loading ? (
        <div className="analytics-loader">
          <span className="analytics-loader-spin" /> Loading analytics...
        </div>
      ) : (
        <>
          <section className="analytics-kpi-grid">
            <article className="analytics-kpi-card analytics-kpi-revenue">
              <div className="analytics-kpi-head">
                <span className="analytics-kpi-icon"><FaMoneyBillWave /></span>
                <span className="analytics-kpi-label">Revenue</span>
              </div>
              <div className="analytics-kpi-value">₹{Math.round(totals.totalRevenue).toLocaleString('en-IN')}</div>
              <div className="analytics-kpi-meta">{RANGE_OPTIONS[range]} sales</div>
            </article>

            <article className="analytics-kpi-card analytics-kpi-orders">
              <div className="analytics-kpi-head">
                <span className="analytics-kpi-icon"><FaClipboardList /></span>
                <span className="analytics-kpi-label">Orders</span>
              </div>
              <div className="analytics-kpi-value">{totals.totalOrders}</div>
              <div className="analytics-kpi-meta">Processed orders</div>
            </article>

            <article className="analytics-kpi-card analytics-kpi-volume">
              <div className="analytics-kpi-head">
                <span className="analytics-kpi-icon"><FaBoxesStacked /></span>
                <span className="analytics-kpi-label">Volume</span>
              </div>
              <div className="analytics-kpi-value">{totals.totalVolume}</div>
              <div className="analytics-kpi-meta">Units requested</div>
            </article>

            <article className="analytics-kpi-card analytics-kpi-customers">
              <div className="analytics-kpi-head">
                <span className="analytics-kpi-icon"><FaUsers /></span>
                <span className="analytics-kpi-label">Customers</span>
              </div>
              <div className="analytics-kpi-value">{totals.uniqueCustomers}</div>
              <div className="analytics-kpi-meta">Active profiles</div>
            </article>
          </section>

          <section className="analytics-main-grid">
            <article className="analytics-panel analytics-panel-large">
              <div className="analytics-panel-head">
                <div>
                  <span className="analytics-panel-kicker"><FaChartBar /> Sales Trend</span>
                  <span className="analytics-panel-title">Revenue Performance</span>
                </div>
                <div className="analytics-panel-controls">
                  <button className="icon-button"><FaFilter /></button>
                  <button className="icon-button"><FaXmark /></button>
                </div>
              </div>

              <div className="analytics-bar-chart">
                {chartData.map((bar, idx) => (
                  <div className="analytics-chart-col" key={`${bar.label}-${idx}`}> 
                    <span className="analytics-chart-value">₹{Math.round(bar.value).toLocaleString('en-IN')}</span>
                    <div className="analytics-chart-track">
                      <span className="analytics-chart-bar" style={{ height: `${Math.max(8, (bar.value / maxChartValue) * 180)}px` }}></span>
                    </div>
                    <span className="analytics-chart-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="analytics-panel analytics-panel-aside">
              <div className="analytics-panel-head compact">
                <div>
                  <span className="analytics-panel-kicker"><FaChartBar /> Flow Status</span>
                  <span className="analytics-panel-title">Production Flow</span>
                </div>
              </div>

              <div className="analytics-flow-list">
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = totals.statusMap[key] || 0;
                  return (
                    <div className="analytics-flow-row" key={key}>
                      <span className="analytics-flow-label">{label}</span>
                      <span className="analytics-flow-bar"><span style={{ width: `${Math.max(4, (count / Math.max(totals.totalOrders, 1)) * 100)}%` }}></span></span>
                      <span className="analytics-flow-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section className="analytics-lower-grid">
            <article className="analytics-panel">
              <div className="analytics-panel-head">
                <div>
                  <span className="analytics-panel-kicker"><FaUsers /> Customers</span>
                  <span className="analytics-panel-title">Top Customers</span>
                </div>
              </div>

              <div className="analytics-list">
                {customers.slice(0, 5).map((customer) => (
                  <div className="analytics-list-item" key={customer._id}>
                    <span className="analytics-avatar">{customer.name?.charAt(0) || 'C'}</span>
                    <div>
                      <span className="analytics-list-name">{customer.name || 'Customer'}</span>
                      <span className="analytics-list-meta">{customer.phone || 'No phone'} • {customer.email || 'No email'}</span>
                    </div>
                    <span className="analytics-list-value">{orders.filter((o) => (o.customer?._id || o.phone || o.name) === (customer._id || customer.phone || customer.name)).length}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="analytics-panel">
              <div className="analytics-panel-head">
                <div>
                  <span className="analytics-panel-kicker"><FaBoxesStacked /> Categories</span>
                  <span className="analytics-panel-title">Category Mix</span>
                </div>
              </div>

              <div className="analytics-category-list">
                {categories.slice(0, 8).map((category) => {
                  const count = designs.filter((design) => String(design.category?._id || design.category) === String(category._id)).length;
                  return (
                    <div className="analytics-category-row" key={category._id}>
                      <span className="analytics-category-name">{category.name}</span>
                      <span className="analytics-category-bar"><span style={{ width: `${Math.max(8, (count / Math.max(designs.length, 1)) * 100)}%` }}></span></span>
                      <span className="analytics-category-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section className="analytics-panel analytics-activity-panel">
            <div className="analytics-panel-head">
              <div>
                <span className="analytics-panel-kicker"><FaArrowTrendUp /> Orders</span>
                <span className="analytics-panel-title">Recent Sales Activity</span>
              </div>
            </div>

            <div className="analytics-activity-table">
              <div className="analytics-activity-row analytics-activity-head">
                <span>Order</span>
                <span>Customer</span>
                <span>Design</span>
                <span>Revenue</span>
                <span>Status</span>
                <span>Date</span>
              </div>

              {searchedOrders.slice(0, 8).map((order) => (
                <div className="analytics-activity-row" key={order._id || order.orderId}>
                  <span className="analytics-order-id">#{order.orderId || order._id}</span>
                  <span>{order.name || order.customer?.name || 'Customer'}</span>
                  <span>{order.design?.title || 'Custom Design'}</span>
                  <span className="analytics-money">₹{Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}</span>
                  <span><em className={`analytics-status analytics-status-${order.status || 'pending'}`}>{STATUS_LABELS[order.status] || 'Pending'}</em></span>
                  <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Today'}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
