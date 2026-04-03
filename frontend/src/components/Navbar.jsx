import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">CampusKart <span className="gradient-text">SVNIT</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/marketplace" className="nav-link" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          {user ? (
            <>
              <Link to="/create-listing" className="nav-link" onClick={() => setMenuOpen(false)}>+ Sell Skill</Link>
              <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to={`/profile/${user._id}`} className="navbar-avatar" onClick={() => setMenuOpen(false)}>
                {user.profilePic
                  ? <img src={user.profilePic} alt={user.name} className="avatar avatar-sm" />
                  : <div className="avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join Free</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
