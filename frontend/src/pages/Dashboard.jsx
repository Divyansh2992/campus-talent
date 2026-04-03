import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_COLORS = {
  pending: 'badge-accent', accepted: 'badge-primary',
  'in-progress': 'badge-primary', completed: 'badge-success', cancelled: 'badge-danger',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/listings/user/${user._id}`),
      axios.get('/orders/received'),
      axios.get('/orders/my'),
    ]).then(([l, ro, mo]) => {
      setMyListings(l.data);
      setReceivedOrders(ro.data);
      setMyOrders(mo.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/listings/${id}`);
      setMyListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (listing) => {
    try {
      const { data } = await axios.put(`/listings/${listing._id}`, { isActive: !listing.isActive });
      setMyListings(prev => prev.map(l => l._id === data._id ? data : l));
    } catch { toast.error('Failed to update'); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/orders/${orderId}/status`, { status });
      setReceivedOrders(prev => prev.map(o => o._id === data._id ? data : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header">
          <div>
            <h2>👋 Welcome, <span className="gradient-text">{user.name}</span></h2>
            <p>SVNIT Surat · {user.hostel} · {user.year}</p>
          </div>
          <Link to="/create-listing" className="btn btn-primary">+ New Listing</Link>
        </div>
        <div className="dash-tabs">
          {[
            { key: 'listings', label: `📦 My Listings (${myListings.length})` },
            { key: 'received', label: `📥 Orders Received (${receivedOrders.length})` },
            { key: 'placed', label: `🛒 My Orders (${myOrders.length})` },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* MY LISTINGS */}
            {tab === 'listings' && (
              <div className="dash-section">
                {myListings.length === 0 ? (
                  <div className="dash-empty glass">
                    <p>You haven't created any listings yet.</p>
                    <Link to="/create-listing" className="btn btn-primary">Create Your First Listing</Link>
                  </div>
                ) : (
                  <div className="dash-list">
                    {myListings.map(l => (
                      <div key={l._id} className="dash-item glass">
                        <div className="dash-item-img">
                          {l.images?.[0] ? <img src={l.images[0]} alt="" /> : <span style={{fontSize:'1.8rem'}}>🎨</span>}
                        </div>
                        <div className="dash-item-info">
                          <Link to={`/listing/${l._id}`} className="dash-item-title">{l.title}</Link>
                          <div className="flex gap-8 mt-8">
                            <span className="badge badge-primary">{l.category}</span>
                            <span className={`badge ${l.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {l.isActive ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <p className="dash-item-meta">₹{l.price} · {l.totalOrders} orders · ⭐ {l.avgRating}</p>
                        </div>
                        <div className="dash-item-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => toggleActive(l)}>
                            {l.isActive ? 'Hide' : 'Activate'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RECEIVED ORDERS */}
            {tab === 'received' && (
              <div className="dash-section">
                {receivedOrders.length === 0 ? (
                  <div className="dash-empty glass"><p>No orders received yet. Keep promoting your listings! 🚀</p></div>
                ) : (
                  <div className="dash-list">
                    {receivedOrders.map(o => (
                      <div key={o._id} className="dash-item glass">
                        <div className="dash-item-img">
                          {o.listing?.images?.[0] ? <img src={o.listing.images[0]} alt="" /> : <span style={{fontSize:'1.8rem'}}>📦</span>}
                        </div>
                        <div className="dash-item-info">
                          <p className="dash-item-title">{o.listing?.title}</p>
                          <p style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>By: {o.buyer?.name} ({o.buyer?.hostel})</p>
                          {o.message && <p style={{fontSize:'0.82rem',color:'var(--text-muted)',marginTop:4}}>"{o.message}"</p>}
                          <div className="flex gap-8 mt-8">
                            <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                            <span style={{fontSize:'0.8rem',color:'var(--accent)'}}>₹{o.price}</span>
                            {o.isPaid && <span className="badge badge-success">💳 Paid</span>}
                          </div>
                        </div>
                        <div className="dash-item-actions">
                          {o.status === 'accepted' && (
                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, 'in-progress')}>Start Work</button>
                          )}
                          {o.status === 'in-progress' && (
                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, 'completed')}>Mark Complete</button>
                          )}
                          {o.status === 'pending' && (
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(o._id, 'cancelled')}>Cancel</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY ORDERS PLACED */}
            {tab === 'placed' && (
              <div className="dash-section">
                {myOrders.length === 0 ? (
                  <div className="dash-empty glass">
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
                  </div>
                ) : (
                  <div className="dash-list">
                    {myOrders.map(o => (
                      <div key={o._id} className="dash-item glass">
                        <div className="dash-item-img">
                          {o.listing?.images?.[0] ? <img src={o.listing.images[0]} alt="" /> : <span style={{fontSize:'1.8rem'}}>🛒</span>}
                        </div>
                        <div className="dash-item-info">
                          <Link to={`/listing/${o.listing?._id}`} className="dash-item-title">{o.listing?.title}</Link>
                          <p style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Seller: {o.seller?.name}</p>
                          <div className="flex gap-8 mt-8">
                            <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                            <span style={{fontSize:'0.8rem',color:'var(--accent)'}}>₹{o.price}</span>
                            {o.isPaid && <span className="badge badge-success">💳 Paid</span>}
                          </div>
                          <p style={{fontSize:'0.74rem',color:'var(--text-dim)',marginTop:6}}>Order ID: {o._id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
