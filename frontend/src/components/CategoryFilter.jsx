import './CategoryFilter.css';

const CATEGORIES = [
  { key: 'all', label: 'All Skills', icon: '✨' },
  { key: 'art-craft', label: 'Art & Craft', icon: '🎨' },
  { key: 'drawing', label: 'Drawing', icon: '✏️' },
  { key: 'writing', label: 'Writing', icon: '✍️' },
  { key: 'photography', label: 'Photography', icon: '📸' },
  { key: 'coding', label: 'Coding', icon: '💻' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚' },
  { key: 'design', label: 'Design', icon: '🎮' },
];

const CategoryFilter = ({ active, onChange }) => {
  return (
    <div className="category-filter">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          className={`cat-btn ${active === cat.key ? 'active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          <span className="cat-icon">{cat.icon}</span>
          <span className="cat-label">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
