import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaImages,
  FaThLarge,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
  FaSearch,
  FaChartBar,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <span className="admin-brand-icon-inner">Y</span>
          </div>
          <div className="admin-brand-copy">
            <span className="admin-brand-title">YAMINI FLEX PRINTING</span>
            <span className="admin-brand-subtitle">Cherukupalli • Guntur</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/admin/designs" className={linkClass}>
            <FaImages /> Designs
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            <FaThLarge /> Categories
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>
          <NavLink to="/admin/customers" className={linkClass}>
            <FaUsers /> Customers
          </NavLink>
          <NavLink to="/admin/analytics" className={linkClass}>
            <FaChartBar /> Analytics
          </NavLink>
        </nav>

        <div className="admin-machine">
          <span className="admin-machine-title">Machine Run Site</span>
          <span className="admin-machine-subtitle">Print 3.2m UV • Live</span>
        </div>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-kicker">YAMINI FLEX PRINTING</span>
            <span className="admin-topbar-subtitle">Print Hub</span>
          </div>
          <div className="admin-topbar-search">
            <FaSearch />
            <span>Search boards, invoices...</span>
          </div>
          <div className="admin-topbar-user">
            <span className="admin-topbar-user-icon">{admin?.name?.charAt(0) || 'A'}</span>
            <span className="admin-topbar-user-name">{admin?.name || 'Admin'}</span>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
