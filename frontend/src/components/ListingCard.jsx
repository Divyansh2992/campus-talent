import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './ListingCard.css';

const CATEGORY_ICONS = {
  'art-craft': '🎨', 'drawing': '✏️',
  'writing': '✍️', 'photography': '📸',
  'coding': '💻', 'tutoring': '📚', 'design': '🎮',
};

const ListingCard = ({ listing }) => {
  const icon = CATEGORY_ICONS[listing.category] || '⭐';
  const image = listing.images?.[0];

  return (
    <Link to={`/listing/${listing._id}`} className="listing-card card">
      <div className="listing-img-wrap">
        {image
          ? <img src={image} alt={listing.title} className="listing-img" />
          : <div className="listing-img-placeholder">{icon}</div>}
        <span className="listing-category-badge">
          {icon} {listing.category.replace('-', ' ')}
        </span>
      </div>
      <div className="listing-body">
        <h4 className="listing-title">{listing.title}</h4>
        <p className="listing-desc">{listing.description?.slice(0, 80)}...</p>
        <div className="listing-meta">
          <div className="listing-seller">
            {listing.seller?.profilePic
              ? <img src={listing.seller.profilePic} alt="" className="avatar avatar-sm" />
              : <div className="avatar-placeholder avatar-sm">{listing.seller?.name?.[0]?.toUpperCase()}</div>}
            <div>
              <p className="seller-name">{listing.seller?.name}</p>
              <p className="seller-college">{listing.seller?.hostel}</p>
            </div>
          </div>
        </div>
        <div className="listing-footer">
          <div className="listing-rating">
            <StarRating rating={listing.avgRating} size="0.85rem" />
            <span className="rating-count">({listing.totalReviews})</span>
          </div>
          <div className="listing-price">₹{listing.price}</div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
