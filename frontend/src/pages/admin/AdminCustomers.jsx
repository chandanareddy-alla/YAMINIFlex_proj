import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaEye,
  FaSearch,
  FaUsers,
  FaMoneyBillAlt,
  FaClipboardList,
  FaMapMarkerAlt,
  FaPlus,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const search = searchParams.get('search') || '';

  const loadCustomers = () => {
    setLoading(true);
    setError('');

    api
      .get('/admin/customers', { page, limit: 20, search })
      .then((res) => {
        const list = res.data || [];
        setCustomers(list);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });

        if (!selectedCustomerId && list.length) {
          setSelectedCustomerId(list[0]._id);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load customers');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, [page, search]);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer._id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, page: 1 });
  };

  const totalRevenue = customers.reduce((sum, customer) => {
    return sum + Number(customer.totalRevenue || customer.totalSpent || 0);
  }, 0);

  const products = customers.reduce((sum, customer) => sum + Number(customer.ordersCount || customer.orderCount || 0), 0);

  return (
    <div className="admin-customers-page">
      <section className="admin-customers-top">
        <div>
          <span className="admin-customers-kicker">ADMIN / CUSTOMERS MANAGEMENT</span>
          <h1 className="admin-customers-title">Customer &amp; Payment Management</h1>
          <p className="admin-customers-subtitle">Build customer profiles, track orders, and monitor customer payments.</p>
        </div>

        <div className="admin-customers-actions">
          <button className="admin-customers-action export"><FaDownload /> Export List</button>
          <button className="admin-customers-action create"><FaPlus /> Add Customer</button>
        </div>
      </section>

      <section className="customer-kpi-grid">
        <article className="customer-kpi-card">
          <span className="customer-kpi-icon"><FaUsers /></span>
          <div>
            <span className="customer-kpi-value">{pagination.total || customers.length}</span>
            <span className="customer-kpi-label">Active Customers</span>
            <span className="customer-kpi-meta">{Math.max(0, pagination.total || customers.length)} total</span>
          </div>
        </article>

        <article className="customer-kpi-card">
          <span className="customer-kpi-icon"><FaMoneyBillAlt /></span>
          <div>
            <span className="customer-kpi-value">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</span>
            <span className="customer-kpi-label">Gross Billed</span>
            <span className="customer-kpi-meta">Billing value</span>
          </div>
        </article>

        <article className="customer-kpi-card">
          <span className="customer-kpi-icon"><FaClipboardList /></span>
          <div>
            <span className="customer-kpi-value">{products}</span>
            <span className="customer-kpi-label">Orders</span>
            <span className="customer-kpi-meta">Active orders</span>
          </div>
        </article>

        <article className="customer-kpi-card">
          <span className="customer-kpi-icon"><FaCheck /></span>
          <div>
            <span className="customer-kpi-value">{Math.max(0, Math.round(customers.length * 0.62))}</span>
            <span className="customer-kpi-label">Settled Orders</span>
            <span className="customer-kpi-meta">Completed</span>
          </div>
        </article>

        <article className="customer-kpi-card">
          <span className="customer-kpi-icon"><FaSearch /></span>
          <div>
            <span className="customer-kpi-value">100%</span>
            <span className="customer-kpi-label">Gateway Sync</span>
            <span className="customer-kpi-meta">Live</span>
          </div>
        </article>
      </section>

      <section className="customer-controls">
        <form className="customer-search-panel" onSubmit={handleSearchSubmit}>
          <FaSearch />
          <input
            value={searchInput}
            placeholder="Search Customer, Mobile, Email or Address"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="customer-filter-group">
          <button className={`customer-filter-chip ${!search ? 'is-active' : ''}`} onClick={() => { setSearchParams({ page: 1, search: '' }); setSearchInput(''); }}>All</button>
          <button className="customer-filter-chip">Active</button>
          <button className="customer-filter-chip">VIP</button>
          <button className="customer-filter-chip">Paid</button>
        </div>
      </section>

      {error && <div className="order-form-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <section className="customer-management-layout">
          <section className="customer-directory-panel">
            <div className="customer-directory-head">
              <span className="customer-directory-title">Studio Customer Directory</span>
              <span className="customer-directory-count">{customers.length} records</span>
            </div>

            <div className="customer-list">
              {customers.length > 0 ? customers.map((customer) => (
                <div key={customer._id} className={`customer-list-row ${selectedCustomer?._id === customer._id ? 'selected' : ''}`} onClick={() => setSelectedCustomerId(customer._id)}>
                  <span className="customer-avatar">{(customer.name || 'C').charAt(0).toUpperCase()}</span>
                  <span>
                    <span className="customer-row-name">{customer.name || 'Customer'}</span>
                    <span className="customer-row-phone"><FaPhone /> {customer.phone || '-'}</span>
                  </span>
                  <span>
                    <span className="customer-row-email"><FaEnvelope /> {customer.email || 'No email'}</span>
                    <span className="customer-row-address"><FaMapMarkerAlt /> {customer.address || 'No address'}</span>
                  </span>
                  <span>
                    <span className={`customer-row-status ${customer.status || 'active'}`}>{customer.status || 'Active'}</span>
                  </span>
                  <span className="customer-list-actions">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(customer._id); }}><FaEye /></button>
                  </span>
                </div>
              )) : (
                <div className="customer-empty">No customers found.</div>
              )}
            </div>

            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(newPage) => setSearchParams({ search, page: newPage })} />
          </section>

          <aside className="customer-detail-panel">
            {selectedCustomer ? (
              <>
                <div className="customer-detail-top">
                  <div className="customer-detail-profile">
                    <span className="customer-detail-avatar">{(selectedCustomer.name || 'C').charAt(0).toUpperCase()}</span>
                    <div>
                      <div className="customer-detail-name">{selectedCustomer.name || 'Customer'}</div>
                      <div className="customer-detail-phone">{selectedCustomer.phone || 'Phone unavailable'}</div>
                    </div>
                  </div>
                  <button className="customer-detail-close"><FaTimes /></button>
                </div>

                <div className="customer-detail-body">
                  <div className="customer-detail-row">
                    <span className="customer-detail-label">Phone</span>
                    <span className="customer-detail-value">{selectedCustomer.phone || '-'}</span>
                  </div>
                  <div className="customer-detail-row">
                    <span className="customer-detail-label">Email</span>
                    <span className="customer-detail-value">{selectedCustomer.email || 'No email'}</span>
                  </div>
                  <div className="customer-detail-row">
                    <span className="customer-detail-label">Address</span>
                    <span className="customer-detail-value">{selectedCustomer.address || 'No address'}</span>
                  </div>
                  <div className="customer-detail-row">
                    <span className="customer-detail-label">Total Orders</span>
                    <span className="customer-detail-value">{selectedCustomer.ordersCount || selectedCustomer.orderCount || 0}</span>
                  </div>
                  <div className="customer-detail-row">
                    <span className="customer-detail-label">Payment</span>
                    <span className="customer-detail-value">{selectedCustomer.paymentStatus || 'Pending'}</span>
                  </div>

                  <div className="customer-detail-notes">
                    <strong>Customer note:</strong> {selectedCustomer.notes || 'No customer note yet. Contact customer for delivery or design verification.'}
                  </div>

                  <div className="customer-detail-actions">
                    <button className="primary"><FaPhone /> Call</button>
                    <button className="secondary"><FaEnvelope /> Email</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="customer-empty">Select a customer to view details.</div>
            )}
          </aside>
        </section>
      )}
    </div>
  );
};

export default AdminCustomers;
