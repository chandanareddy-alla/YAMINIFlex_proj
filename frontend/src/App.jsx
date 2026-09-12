import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

import Home from './pages/customer/Home';
import Catalogue from './pages/customer/Catalogue';
import DesignDetails from './pages/customer/DesignDetails';
import OrderForm from './pages/customer/OrderForm';
import OrderSuccess from './pages/customer/OrderSuccess';
import PaymentMethod from './pages/customer/PaymentMethod';


import TrackOrder from './pages/customer/TrackOrder';
import Contact from './pages/customer/Contact';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerAccount from './pages/customer/CustomerAccount';
import { PrivacyPolicy, TermsAndConditions, RefundPolicy } from './pages/customer/LegalPages';
import NotFound from './pages/customer/NotFound';
import HowIt from "./pages/customer/HowIt";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDesigns from './pages/admin/AdminDesigns';
import AdminDesignAdd from './pages/admin/AdminDesignAdd';
import AdminDesignEdit from './pages/admin/AdminDesignEdit';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  useEffect(() => {
    const selector = [
      'section',
      '.page-container',
      '.contact-panel',
      '.catalogue-grid',
      '.order-form-panel',
      '.payment-panel',
      '.auth-card',
      '.track-panel',
      '.preview-card',
      '.service-card',
      '.design-card',
      '.hero-visual-card'
    ].join(', ');

    const allTargets = Array.from(document.querySelectorAll(selector));

    allTargets.forEach((node, index) => {
      node.classList.add('scroll-reveal');
      node.style.transitionDelay = `${Math.min(index * 40, 360)}ms`;
    });

    if (!('IntersectionObserver' in window)) {
      allTargets.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px',
    });

    allTargets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <AuthProvider>
    <CustomerAuthProvider>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/design/:id" element={<DesignDetails />} />
          <Route path="/order/:designId" element={<OrderForm />} />
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/track-order/:orderId" element={<TrackOrder />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route element={<CustomerProtectedRoute />}>
            <Route path="/account" element={<CustomerAccount />} />
          </Route>
          <Route path="/how-it-works" element={<HowIt />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/designs" element={<AdminDesigns />} />
            <Route path="/admin/designs/add" element={<AdminDesignAdd />} />
            <Route path="/admin/designs/edit/:id" element={<AdminDesignEdit />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
