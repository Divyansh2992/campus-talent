import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import ListingCard from '../components/ListingCard';
import CategoryFilter from '../components/CategoryFilter';
import './Marketplace.css';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const category = searchParams.get('category') || 'all';

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const { data } = await axios.get('/listings', { params });
      setListings(data);
    } catch (e) { setListings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, [category, sort, search]);
  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

  return (
    <div className="marketplace-page">
      <div className="mp-hero">
        <div className="container">
          <h1>🛍️ SVNIT <span className="gradient-text">Skill</span> Marketplace</h1>
          <p>Discover and hire talented students from across SVNIT hostels</p>
          <form onSubmit={handleSearch} className="search-bar">
            <input className="form-input search-input" placeholder="Search skills, titles..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>
      <div className="container mp-body">
        <div className="mp-filters">
          <CategoryFilter active={category} onChange={c => setSearchParams(c === 'all' ? {} : { category: c })} />
          <div className="mp-sort">
            <select className="form-select sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="top-rated">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="mp-results-info">
          <span>{listings.length} listings found</span>
        </div>
        {loading ? (
          <div className="mp-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 16, display: 'flex', flexDirection:'column', gap:10 }}>
                  <div className="skeleton" style={{ height: 18, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, width: '100%' }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="mp-empty">
            <div className="empty-icon">🔍</div>
            <h3>No listings found</h3>
            <p>Try a different category or search term</p>
          </div>
        ) : (
          <div className="mp-grid">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
