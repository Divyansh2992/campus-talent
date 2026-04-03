import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import './ListingDetail.css';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay() {
  return new Promise((res) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) return res(true);
    const s = document.createElement('script');
    s.src = RAZORPAY_SCRIPT;
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewOrder, setReviewOrder] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`/listings/${id}`),
      axios.get(`/reviews/listing/${id}`)
    ]).then(([l, r]) => {
      setListing(l.data);
      setReviews(r.data);
    }).catch(() => toast.error('Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) return toast.error('Please login to place an order');
    setOrdering(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) return toast.error('Razorpay failed to load');
      const { data } = await axios.post('/orders', { listingId: id, message });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'CampusKart SVNIT',
        description: listing.title,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await axios.post('/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: data.order._id,
            });
            toast.success('Payment successful! Order placed 🎉');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#FCA311' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setOrdering(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    if (!reviewOrder) return toast.error('Enter your Order ID to verify purchase');
    setSubmittingReview(true);
    try {
      const { data } = await axios.post('/reviews', { listingId: id, ...reviewForm, orderId: reviewOrder });
      setReviews(prev => [data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review posted! ⭐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="container"><div className="spinner" /></div>;
  if (!listing) return <div className="container" style={{padding:'80px 0',textAlign:'center'}}><h3>Listing not found</h3></div>;

  const isSeller = user?._id === listing.seller?._id;

  return (
    <div className="listing-detail-page">
      <div className="container ld-grid">
        {/* LEFT */}
        <div className="ld-left">
          <div className="ld-images">
            <div className="ld-main-img">
              {listing.images?.length > 0
                ? <img src={listing.images[activeImg]} alt={listing.title} />
                : <div className="ld-no-img">🎨</div>}
            </div>
            {listing.images?.length > 1 && (
              <div className="ld-thumbs">
                {listing.images.map((img, i) => (
                  <img key={i} src={img} alt="" className={`ld-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>
          {/* REVIEWS */}
          <div className="ld-reviews glass">
            <h3>⭐ Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first! 🌟</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r._id} className="review-item">
                    <div className="review-header">
                      <div className="review-user">
                        {r.reviewer?.profilePic
                          ? <img src={r.reviewer.profilePic} alt="" className="avatar avatar-sm" />
                          : <div className="avatar-placeholder">{r.reviewer?.name?.[0]}</div>}
                        <div>
                          <p style={{fontWeight:600,fontSize:'0.88rem',color:'var(--text)'}}>{r.reviewer?.name}</p>
                          <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>SVNIT Surat · {r.reviewer?.hostel}</p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size="0.9rem" />
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Write review */}
            {user && !isSeller && (
              <form onSubmit={handleReview} className="review-form">
                <h4>Write a Review</h4>
                <div className="form-group">
                  <label className="form-label">Your Order ID</label>
                  <input className="form-input" placeholder="Paste your Order ID"
                    value={reviewOrder} onChange={e => setReviewOrder(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select className="form-select" value={reviewForm.rating}
                    onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea className="form-textarea" placeholder="Share your experience..."
                    value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} required />
                </div>
                <button className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Posting...' : 'Post Review ⭐'}
                </button>
              </form>
            )}
          </div>
        </div>
        {/* RIGHT */}
        <div className="ld-right">
          <div className="ld-info glass">
            <span className="badge badge-primary">
              {listing.category?.replace('-', ' ')}
            </span>
            <h1 className="ld-title">{listing.title}</h1>
            <div className="ld-rating-row">
              <StarRating rating={listing.avgRating} />
              <span className="rating-count">({listing.totalReviews} reviews)</span>
              <span className="ld-orders">{listing.totalOrders} orders</span>
            </div>
            <div className="ld-price">₹{listing.price}</div>
            <p className="ld-desc">{listing.description}</p>
            {listing.deliveryTime && (
              <div className="ld-delivery">⏱️ Delivery: <strong>{listing.deliveryTime}</strong></div>
            )}
            {listing.tags?.length > 0 && (
              <div className="ld-tags">
                {listing.tags.map(tag => <span key={tag} className="badge badge-primary">{tag}</span>)}
              </div>
            )}
            {!isSeller && (
              <div className="ld-order-box">
                <textarea className="form-textarea" placeholder="Describe your requirements..." rows={3}
                  value={message} onChange={e => setMessage(e.target.value)} />
                <button className="btn btn-accent btn-lg w-full" onClick={handleOrder} disabled={ordering}>
                  {ordering ? 'Processing...' : `Pay ₹${listing.price} & Order 🚀`}
                </button>
                {!user && <p style={{textAlign:'center',fontSize:'0.85rem',color:'var(--text-muted)',marginTop:8}}>
                  <Link to="/login" style={{color:'var(--primary-light)'}}>Login</Link> to place order
                </p>}
              </div>
            )}
          </div>
          {/* SELLER CARD */}
          <div className="seller-card glass">
            <h4>About the Seller</h4>
            <Link to={`/profile/${listing.seller?._id}`} className="seller-info">
              {listing.seller?.profilePic
                ? <img src={listing.seller.profilePic} alt="" className="avatar avatar-lg" />
                : <div className="avatar-placeholder avatar-lg">{listing.seller?.name?.[0]}</div>}
              <div>
                <p className="seller-name-big">{listing.seller?.name}</p>
                <p style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>SVNIT Surat · {listing.seller?.hostel}</p>
                <div className="flex gap-8 items-center mt-8">
                  <StarRating rating={listing.seller?.avgRating} size="0.85rem" />
                  <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>({listing.seller?.avgRating})</span>
                </div>
              </div>
            </Link>
            {listing.seller?.bio && <p style={{fontSize:'0.85rem',marginTop:12}}>{listing.seller.bio}</p>}
            <p style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:8}}>
              Total Sales: <strong style={{color:'var(--accent)'}}>{listing.seller?.totalSales}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
