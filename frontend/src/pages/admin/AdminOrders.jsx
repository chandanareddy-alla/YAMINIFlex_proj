import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaBox,
  FaCalendarAlt,
  FaCheck,
  FaClipboardList,
  FaClock,
  FaDownload,
  FaFilePdf,
  FaMoneyBillAlt,
  FaSearch,
  FaSync,
  FaUpload,
  FaUser,
  FaList,
  FaImage,
  FaPrint,
  FaTimes,
  FaEye,
  FaPlus,
} from 'react-icons/fa';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminOrders.css';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'in-progress',
  'awaiting-approval',
  'approved',
  'ready',
  'delivered',
  'cancelled',
];

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

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace('/api', '');

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const status = searchParams.get('status') || '';

  const loadOrders = () => {
    setLoading(true);
    setError('');

    api
      .get('/admin/orders', {
        page,
        limit: 20,
        status,
        search: searchTerm,
      })
      .then((res) => {
        const list = res.data || [];
        setOrders(list);
        setPagination(
          res.pagination || {
            page: 1,
            totalPages: 1,
          }
        );
      })
      .catch((err) => {
        setError(err.message || 'Failed to load orders');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  const selectedOrder = useMemo(() => {
    return orders.find((order) => order._id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const handleStatusChange = async (orderId, newStatus) => {
    setError('');

    try {
      await api.put(`/admin/orders/${orderId}`, {
        status: newStatus,
      });

      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleFileUpload = async (orderId, file) => {
    setError('');
    setUploadingId(orderId);

    try {
      const formData = new FormData();
      formData.append('finalDesignFile', file);

      await api.put(`/admin/orders/${orderId}`, formData);

      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to upload final design file');
    } finally {
      setUploadingId(null);
    }
  };

  const getDeliveryAddress = (order) => {
    return order.deliveryAddress || order.address || order.functionHallAddress || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getDetailNotes = (order) => {
    const material = order.material || 'Flex Printing';
    const substrate = order.pricePerSqFt ? `(${order.pricePerSqFt ? `₹${Number(order.pricePerSqFt).toLocaleString('en-IN')}/sq.ft` : 'custom'})` : '(₹8/sq.ft)';
    const celebrantName = order.celebrantName || order.name || 'Customer';
    const occasion = order.occasion || order.slogan || order.specialChanges || 'No occasion';
    const eventDate = order.eventDate || 'No event date';
    const deliveryText = order.deliveryMode === 'home-dispatch' || order.deliveryMode === 'home'
      ? 'Home / Function Hall Dispatch'
      : order.deliveryMode === 'studio-pickup'
        ? 'Studio Pickup'
        : getDeliveryAddress(order) || 'Studio Pickup';

    return `Material/Substrate: ${material} ${substrate} Celebrant/Family Name: ${celebrantName} Occasion/Slogan: ${occasion} Event Date: ${eventDate} Delivery: ${deliveryText}`;
  };

  const totalVolume = orders.reduce((sum, order) => sum + Number(order.quantity || 1), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || order.grandTotal || 0), 0);
  const countByStatus = STATUS_OPTIONS.reduce((acc, key) => {
    acc[key] = orders.filter((order) => (order.status || 'pending') === key).length;
    return acc;
  }, {});

  return (
    <div className="admin-orders-page">
      <section className="admin-orders-top">
        <div>
          <span className="admin-orders-kicker">ADMIN / ORDERS MANAGEMENT</span>
          <h1 className="admin-orders-title">Order Management</h1>
          <p className="admin-orders-subtitle">View orders, update production flow, capture delivery and payment status.</p>
        </div>
        <div className="admin-orders-actions">
          <button className="admin-orders-action export"><FaDownload /> Export CSV</button>
          <button className="admin-orders-action export"><FaFilePdf /> Export PDF</button>
          <button className="admin-orders-action new"><FaPlus /> Create Order</button>
        </div>
      </section>

      <section className="admin-orders-summary">
        <article className="summary-card">
          <span className="summary-icon"><FaBox /></span>
          <div>
            <span className="summary-label">Total Orders</span>
            <span className="summary-value">{pagination.totalPages > 0 ? orders.length : 0}</span>
            <span className="summary-help">Orders today</span>
          </div>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><FaMoneyBillAlt /></span>
          <div>
            <span className="summary-label">Revenue</span>
            <span className="summary-value">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</span>
            <span className="summary-help">Current page value</span>
          </div>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><FaClipboardList /></span>
          <div>
            <span className="summary-label">Volume</span>
            <span className="summary-value">{totalVolume}</span>
            <span className="summary-help">Pieces requested</span>
          </div>
        </article>
        <article className="summary-card">
          <span className="summary-icon"><FaClock /></span>
          <div>
            <span className="summary-label">Pending Flow</span>
            <span className="summary-value">{countByStatus.pending || 0}</span>
            <span className="summary-help">New orders</span>
          </div>
        </article>
      </section>

      <section className="admin-orders-filter-bar">
        <div className="admin-orders-search">
          <FaSearch />
          <input value={searchTerm} placeholder="Search Order Id / Customer / Design / Location" onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchParams({ page: 1, status, search: searchTerm }); loadOrders(); } }} />
        </div>
        <div className="admin-orders-status-group">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => { setSearchParams({ status: s, page: 1 }); }}> {STATUS_LABELS[s]}</button>
          ))}
        </div>
        <button className="admin-orders-action clear" onClick={() => { setSearchTerm(''); setSearchParams({ page: 1, status: '' }); }}>Clear</button>
      </section>

      {error && <p className="order-form-error">{error}</p>}

      {loading ? (
        <Loader />
      ) : (
        <section className="admin-orders-main-wrapper">
          <section className="admin-orders-list-wrap">
            <div className="admin-orders-list-head">
              <div className="admin-orders-list-head-left">
                <span className="list-count"><FaList /> {orders.length} Orders</span>
              </div>
              <div className="admin-orders-list-head-right">
                <select className="form-select admin-orders-filter" value={status} onChange={(e) => setSearchParams({ status: e.target.value, page: 1 })}>
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-orders-table-wrap">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Design</th>
                    <th>Size</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    return (
                      <tr key={order._id} className={selectedOrder?._id === order._id ? 'selected-row' : ''} onClick={() => setSelectedOrderId(order._id)} style={{ cursor: 'pointer' }}>
                        <td>
                          <span className="table-order-id">#{order.orderId || order._id}</span>
                        </td>
                        <td>
                          <span className="customer-name">{order.name || order.customer?.name || 'Customer'}</span>
                          <span className="customer-phone">{order.phone || order.customer?.phone || '-'}</span>
                        </td>
                        <td>
                          <span className="design-title">{order.design?.title || 'Custom Design'}</span>
                          <span className="design-category">{order.design?.category?.name || 'Custom'}</span>
                        </td>
                        <td>
                          <span className="design-size">{order.size || order.hoardingSize || '—'}</span>
                          <span className="design-qty">Qty {order.quantity || 1}</span>
                        </td>
                        <td>
                          <span className={`payment-status ${order.paymentStatus || 'Pending'}`}>{order.paymentStatus || 'Pending'}</span>
                          <span className="payment-method">{order.paymentMethod || 'COD'}</span>
                        </td>
                        <td>
                          <span className="amount-value">₹{Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <select className="form-select order-status-select" value={order.status || 'pending'} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                        <td className="action-cell">
                          <div className="order-actions">
                            <button className="icon-action" onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); }}><FaEye /></button>
                            <button className="icon-action upload" onClick={(e) => { e.stopPropagation(); const input = document.createElement('input'); input.type = 'file'; input.accept = '.pdf,image/*'; input.onchange = (ev) => { const file = ev.target.files?.[0]; if (file) handleFileUpload(order._id, file); }; input.click(); }}><FaUpload /></button>
                            <button className="icon-action print" onClick={(e) => { e.stopPropagation(); window.print(); }}><FaPrint /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {orders.length === 0 && <div className='no-results'>No orders found</div>}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(newPage) => setSearchParams({ status, page: newPage })} />
          </section>

          {selectedOrder && (
            <div className="order-details-modal-backdrop" onClick={() => setSelectedOrderId('')}>
              <aside className="order-details-panel order-details-popup" onClick={(e) => e.stopPropagation()}>
                <div className="order-details-head">
                  <div>
                    <span className="detail-kicker">Order #{selectedOrder.orderId || selectedOrder._id}</span>
                    <span className="detail-date">{formatDate(selectedOrder.createdAt || selectedOrder.updatedAt)}</span>
                  </div>
                  <button className="close-panel" onClick={() => setSelectedOrderId('')}><FaTimes /></button>
                </div>

                <div className="order-details-body">
                  <section className="detail-card customer-card">
                    <div className="detail-card-head">
                      <span><FaUser /> Customer</span>
                      <span className="detail-action-badge">Verified</span>
                    </div>
                    <div className="customer-block">
                      <span className="customer-main-name">{selectedOrder.name || selectedOrder.customer?.name || 'Customer Name'}</span>
                      <span className="customer-main-phone">{selectedOrder.phone || selectedOrder.customer?.phone || '00000000000'}</span>
                      <span className="customer-main-email">{selectedOrder.email || selectedOrder.customer?.email || 'No email'}</span>
                    </div>
                  </section>

                  <section className="detail-card image-card">
                    <div className="design-image-wrap">
                      {selectedOrder.customerFileUploads?.[0] ? (
                        <img className="detail-image" src={`${API_ORIGIN}${selectedOrder.customerFileUploads[0]}`} alt="reference" />
                      ) : (
                        <span className="detail-image-placeholder"><FaImage /></span>
                      )}
                    </div>
                    <div className="detail-design-title">
                      <span>{selectedOrder.design?.title || 'Birthday'}</span>
                    </div>
                  </section>

                  <section className="detail-card order-spec">
                    <div className="detail-card-head">
                      <span><FaClipboardList /> Order Specification</span>
                    </div>
                    <div className="spec-grid">
                      <div><span className="spec-label">Quantity</span><span className="spec-value">{selectedOrder.quantity || 1}</span></div>
                      <div><span className="spec-label">Size</span><span className="spec-value">{selectedOrder.size || selectedOrder.hoardingSize || '200'}</span></div>
                      <div><span className="spec-label">Mode</span><span className="spec-value">{selectedOrder.deliveryMode || 'home-dispatch'}</span></div>
                      <div><span className="spec-label">Amount</span><span className="spec-value">₹{Number(selectedOrder.totalAmount || selectedOrder.grandTotal || 0).toLocaleString('en-IN')}</span></div>
                    </div>
                  </section>

                  <section className="detail-card product-card">
                    <div className="detail-card-head">
                      <span><FaMoneyBillAlt /> Payment & Delivery</span>
                    </div>
                    <div className="payment-grid">
                      <div><span className="spec-label">Payment</span><span className="spec-value">{selectedOrder.paymentMethod || 'COD'}</span></div>
                      <div><span className="spec-label">Status</span><span className="spec-value">{STATUS_LABELS[selectedOrder.status] || 'Pending'}</span></div>
                      <div><span className="spec-label">Delivery</span><span className="spec-value">{getDeliveryAddress(selectedOrder) || 'house'}</span></div>
                    </div>
                  </section>

                  <section className="detail-card production-card">
                    <div className="detail-card-head">
                      <span><FaSync /> Production Flow</span>
                    </div>
                    <div className="flow-grid">
                      {STATUS_OPTIONS.map((s, index) => (
                        <button key={s} className={`flow-step ${selectedOrder.status === s ? 'active' : ''}`} onClick={() => handleStatusChange(selectedOrder._id, s)}>{index + 1}</button>
                      ))}
                    </div>
                    <div className="flow-status-line">
                      <span className="flow-current">Step: {STATUS_LABELS[selectedOrder.status] || 'Pending'}</span>
                    </div>
                  </section>

                  <section className="detail-card final-file-card">
                    <div className="detail-card-head">
                      <span><FaUpload /> Final Design File</span>
                    </div>
                    <div className="upload-zone">
                      {selectedOrder.finalDesignFile ? (
                        <a className="attached-file" href={`${API_ORIGIN}${selectedOrder.finalDesignFile}`} target="_blank" rel="noopener noreferrer">
                          <FaDownload /> {selectedOrder.finalDesignFile.split('/').pop()}
                        </a>
                      ) : (
                        <span className="no-file">No uploaded final design</span>
                      )}
                      <input type="file" accept=".pdf,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(selectedOrder._id, file); }} />
                    </div>
                  </section>

                  <section className="detail-card comments-card">
                    <div className="detail-card-head">
                      <span><FaClipboardList /> Notes</span>
                    </div>
                    <p className="order-notes">{getDetailNotes(selectedOrder)}</p>
                  </section>

                  <section className="detail-card control-card">
                    <button className="save-btn" onClick={() => handleStatusChange(selectedOrder._id, selectedOrder.status || 'pending')}><FaCheck /> Save</button>
                    <button className="cancel-btn" onClick={() => setSelectedOrderId('')}><FaTimes /> Close</button>
                  </section>
                </div>
              </aside>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminOrders;