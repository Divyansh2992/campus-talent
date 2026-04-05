import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">🎓 Campus<span className="gradient-text">Kart</span></Link>
        <p>The exclusive marketplace for SVNIT Surat. Buy and sell skills within our campus community.</p>
      </div>
      <div className="footer-links">
        <h5>Marketplace</h5>
        <Link to="/marketplace">Browse All</Link>
        <Link to="/marketplace?category=art-craft">Art & Craft</Link>
        <Link to="/marketplace?category=drawing">Drawing</Link>
        <Link to="/marketplace?category=music">Music</Link>
      </div>
      <div className="footer-links">
        <h5>Account</h5>
        <Link to="/register">Join Free</Link>
        <Link to="/login">Login</Link>
        <Link to="/create-listing">Sell a Skill</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <div className="footer-links">
        <h5>About</h5>
        <p>Made with ❤️ for SVNITians</p>
        <p>© {new Date().getFullYear()} CampusKart</p>
      </div>
    </div>
  </footer>
);

export default Footer;
