const StarRating = ({ rating, size = '1rem' }) => {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : ''}`} style={{ fontSize: size }}>
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
