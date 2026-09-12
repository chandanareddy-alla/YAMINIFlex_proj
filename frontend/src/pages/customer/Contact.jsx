import { FaClock, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { BUSINESS, WHATSAPP_LINK } from '../../constants/business';
import './Contact.css';

const Contact = () => {
  return (
    <div className="page-container contact-page">
      <section className="contact-panel">
        <div className="contact-panel-head">
          <div className="contact-title-wrap">
            <span className="contact-kicker">YAMINI FLEX PRINTING</span>
            <h1 className="section-title contact-title">Contact Us</h1>
            <p className="section-subtitle contact-subtitle">
              We would love to help with your next printing project.
            </p>
          </div>

          <a className="contact-whatsapp" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Chat on WhatsApp
          </a>
        </div>

        <div className="contact-grid">
          <article className="contact-card">
            <span className="contact-icon">
              <FaMapMarkerAlt />
            </span>
            <div>
              <span className="contact-label">Studio Address</span>
              <p className="contact-value">{BUSINESS.address}</p>
            </div>
          </article>

          <article className="contact-card">
            <span className="contact-icon">
              <FaPhoneAlt />
            </span>
            <div>
              <span className="contact-label">Call Us</span>
              <p className="contact-value">{BUSINESS.phone}</p>
            </div>
          </article>

          <article className="contact-card">
            <span className="contact-icon">
              <FaClock />
            </span>
            <div>
              <span className="contact-label">Open Hours</span>
              <p className="contact-value">Monday - Sunday<br />8:30 AM - 9:30 PM</p>
            </div>
          </article>
        </div>

        <div className="contact-help-row">
          <div className="contact-help-copy">
            <span className="contact-help-title">Need Printing Help?</span>
            <span className="contact-help-text">Send your requirement on WhatsApp for a quick quote, design support, and print pickup guidance.</span>
          </div>
          <a className="contact-help-link" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Start WhatsApp Conversation
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
