import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import './CreateListing.css';

const CATEGORIES = [
  { key: 'art-craft', label: '🎨 Art & Craft' },
  { key: 'drawing', label: '✏️ Drawing / Illustration' },
  { key: 'music', label: '🎵 Music / Singing' },
  { key: 'writing', label: '✍️ Writing / Lyrics' },
  { key: 'photography', label: '📸 Photography / Videography' },
  { key: 'dance', label: '💃 Dance Coaching' },
  { key: 'coding', label: '💻 Coding / Tech' },
  { key: 'tutoring', label: '📚 Tutoring' },
  { key: 'design', label: '🎮 Graphic Design' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'art-craft',
    price: '', deliveryTime: '', tags: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      images.forEach(img => fd.append('images', img));
      const { data } = await axios.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Listing created! 🎉');
      navigate(`/listing/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <div className="create-page">
      <div className="container create-container">
        <div className="create-header animate-fade-up">
          <h1>✨ Create a <span className="gradient-text">Listing</span></h1>
          <p>Share your skill with the SVNIT community and start earning</p>
        </div>
        <div className="create-card glass animate-fade-up">
          <form onSubmit={handleSubmit} className="create-form">
            <div className="create-grid">
              <div className="create-left">
                <div className="form-group">
                  <label className="form-label">Listing Title *</label>
                  <input className="form-input" placeholder="e.g. I'll draw your portrait in pencil sketch"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" placeholder="Describe what you offer in detail..."
                    style={{minHeight:160}}
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div className="create-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" placeholder="e.g. 299" min="1"
                      value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Time</label>
                    <input className="form-input" placeholder="e.g. 2-3 days"
                      value={form.deliveryTime} onChange={e => setForm({...form, deliveryTime: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="e.g. portrait, pencil, art"
                    value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
                </div>
              </div>
              <div className="create-right">
                <div className="form-group">
                  <label className="form-label">Upload Images (max 4)</label>
                  <label className="img-upload-box">
                    <input type="file" accept="image/*" multiple onChange={handleImages} style={{display:'none'}} />
                    {previews.length > 0 ? (
                      <div className="img-previews">
                        {previews.map((p, i) => <img key={i} src={p} alt="" className="img-preview" />)}
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>📁</span>
                        <p>Click to upload images</p>
                        <small>JPG, PNG, WEBP · Max 5MB each</small>
                      </div>
                    )}
                  </label>
                </div>
                <div className="tips-box glass">
                  <h4>💡 Tips for a great listing</h4>
                  <ul>
                    <li>Use a clear, specific title</li>
                    <li>Upload real photos of your work</li>
                    <li>Describe exactly what buyer gets</li>
                    <li>Set a fair price (check similar listings)</li>
                    <li>Mention realistic delivery time</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="create-footer">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Listing 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
