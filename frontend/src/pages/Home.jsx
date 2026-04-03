import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import ListingCard from '../components/ListingCard';
import './Home.css';

const STEPS = [
  { icon: '🔓', title: 'Verify Email', desc: 'Secure campus access with your official @svnit.ac.in ID' },
  { icon: '✍️', title: 'List Skills', desc: 'Post your services—coding, design, notes, or creative arts' },
  { icon: '💳', title: 'Trade Safely', desc: 'Execute trades within hostels and pay securely via Razorpay' },
];

const STATS = [
  { value: '500+', label: 'Active Sellers' },
  { value: '9', label: 'Hostels Supported' },
  { value: '1000+', label: 'Successful Trades' },
  { value: '4.8⭐', label: 'Student Rating' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get('/listings?sort=top-rated').then(r => setFeatured(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <section className="section hero-section">
        <div className="container hero-container animate-fade-up">
          <div className="hero-content">
            <span className="badge badge-primary hero-badge">Exclusive to SVNIT Surat</span>
            <h1 className="hero-title">
              Unlock the <span className="gradient-text">Student Economy</span> of SVNIT
            </h1>
            <p className="hero-subtitle">
              The professional peer-to-peer marketplace for SVNITians. 
              Find engineering notes, book tutoring sessions, or hire creative talents from your neighbors.
            </p>
            <div className="hero-btns">
              <Link to="/marketplace" className="btn btn-primary btn-lg">Explore Marketplace 🛒</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Start Selling 🚀</Link>
            </div>
          </div>
          <div className="hero-stats glass animate-fade-in">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section hiw-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How <span className="gradient-text">CampusKart</span> Works</h2>
            <p>Seamlessly integrated with the SVNIT campus lifestyle</p>
          </div>
          <div className="hiw-grid">
            {STEPS.map((step, i) => (
              <div key={i} className="hiw-card glass">
                <div className="hiw-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header flex justify-between items-center" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32}}>
              <div>
                <h2>🔥 <span className="gradient-text">Featured</span> Talents</h2>
                <p>Top-rated work and services from fellow students</p>
              </div>
              <Link to="/marketplace" className="btn btn-outline">View All →</Link>
            </div>
            <div className="listings-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:24}}>
              {featured.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section cta-banner">
        <div className="container">
          <div className="cta-card glass">
            <h2 className="section-title">Fuel Your <span className="gradient-text">Campus Hustle</span></h2>
            <p>Join the 500+ SVNIT students already earning and learning through CampusKart.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Join SVNIT Network 🚀</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

