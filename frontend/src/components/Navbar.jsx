import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaWhatsapp,
  FaUserCircle,
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { BUSINESS, WHATSAPP_LINK } from '../constants/business';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import brandLogo from '../assets/image.png';
import './Navbar.css';

const Navbar = () => {
  const navLinkClass = ({ isActive }) => `navbar-link${isActive ? ' navbar-link-active' : ''}`;
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/catalogue${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-topbar">
        <div className="navbar-topbar-inner">
          <span className="navbar-topbar-item">
            <FaMapMarkerAlt /> {BUSINESS.address}
          </span>
          <a href={`tel:${BUSINESS.phone}`} className="navbar-topbar-item navbar-topbar-link">
            <FaPhoneAlt /> {BUSINESS.phone}
          </a>
          <span className="navbar-topbar-item navbar-topbar-hours">
            <span className="navbar-topbar-dot" /> {BUSINESS.workingHours}
          </span>
        </div>
      </div>

      <div className="navbar-main">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <img src={brandLogo} alt={BUSINESS.name} className="navbar-brand-logo" />
            
          </Link>

          <button
            className="navbar-menu-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`}> 
            <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/catalogue" className={navLinkClass} onClick={closeMenu}>Designs</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} onClick={closeMenu}>How It Works</NavLink>
            <NavLink to="/contact" className={navLinkClass} onClick={closeMenu}>Contact</NavLink>
          </nav>

          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <FaSearch className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search flex, vinyl, boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <div className="navbar-actions">
            <NavLink to={isAuthenticated ? '/account' : '/login'} className="navbar-account-link" onClick={closeMenu}>
              <FaUserCircle />
              <span>{isAuthenticated ? customer?.name?.split(' ')[0] || 'My Account' : 'My Orders'}</span>
            </NavLink>
            <a href={`tel:${BUSINESS.phone}`} className="btn btn-outline navbar-call-btn">
              {BUSINESS.phone}
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="navbar-whatsapp">
              <FaWhatsapp />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
