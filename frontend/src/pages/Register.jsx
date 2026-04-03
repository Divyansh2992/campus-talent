import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];
const HOSTELS = [
  'Bhabha Bhavan', 'Gajjar Bhavan', 'Mother Teresa Bhavan', 'Narmad Bhavan', 'Nehru Bhavan', 
  'Raman Bhavan', 'Sarabhai Bhavan', 'Swami Dayanand Saraswati Bhavan', 'Tagore Bhavan'
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', hostel: HOSTELS[0], year: '1st Year' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const svnitRegex = /^[a-z0-9.]+@([a-z0-9-]+\.)*svnit\.ac\.in$/i;
    if (!svnitRegex.test(form.email)) {
      return toast.error('Please use your official @svnit.ac.in email');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', form);
      login(data);
      toast.success(`Welcome to CampusKart SVNIT, ${data.name}! 🚀`);
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-card glass animate-fade-up">
        <div className="auth-logo">🎓</div>
        <h2>Join CampusKart SVNIT</h2>
        <p className="auth-sub">Create your exclusive SVNIT student account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Priya Sharma"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">SVNIT Email Address</label>
            <input type="email" className="form-input" placeholder="u23cs080@coed.svnit.ac.in"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Your Hostel</label>
            <select className="form-select" value={form.hostel}
              onChange={e => setForm({...form, hostel: e.target.value})}>
              {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year of Study</label>
            <select className="form-select" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Free Account 🚀'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

