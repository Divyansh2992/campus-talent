import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import ListingCard from '../components/ListingCard';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const PREDEFINED_SKILLS = [
  'Art & Craft', 'Drawing', 'Writing', 'Photography', 'Coding', 'Tutoring', 'Design', 'Other'
];

export default function Profile() {
  const { id } = useParams();
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({ name: '', bio: '', hostel: '', year: '', skills: [], newSkill: '', selectedSkillCategory: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`/users/${id}`),
      axios.get(`/listings/user/${id}`)
    ]).then(([p, l]) => {
      setProfile(p.data);
      setListings(l.data);
      setFormState({
        name: p.data.name || '',
        bio: p.data.bio || '',
        hostel: p.data.hostel || '',
        year: p.data.year || '1st Year',
        razorpayAccountId: p.data.razorpayAccountId || '',
        skills: Array.isArray(p.data.skills) ? p.data.skills : [],
        newSkill: '',
        selectedSkillCategory: ''
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const canEdit = authUser && profile && authUser._id === profile._id;

  const addSkill = () => {
    let skillToAdd = '';
    if (formState.selectedSkillCategory === 'Other') {
      skillToAdd = formState.newSkill.trim();
    } else if (formState.selectedSkillCategory) {
      skillToAdd = formState.selectedSkillCategory;
    }
    if (!skillToAdd) return;
    if (!formState.skills.includes(skillToAdd)) {
      setFormState(prev => ({ ...prev, skills: [...prev.skills, skillToAdd], newSkill: '', selectedSkillCategory: '' }));
    } else {
      setFormState(prev => ({ ...prev, newSkill: '', selectedSkillCategory: '' }));
    }
  };

  const removeSkill = (skill) => {
    setFormState(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    setSaving(true);

    try {
      const payload = {
        name: formState.name,
        bio: formState.bio,
        hostel: formState.hostel,
        year: formState.year,
        skills: formState.skills.join(',')
      };
      const { data } = await axios.put('/users/profile', payload);

      setProfile(prev => ({ ...prev, ...data }));
      setIsEditing(false);

      if (authUser && authUser._id === data._id) {
        const updatedUser = { ...authUser, ...data };
        login({ ...updatedUser, token: authUser.token });
      }
    } catch (error) {
      console.error('Profile update failed', error);
      alert('Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><div className="spinner" /></div>;
  if (!profile) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h3>User not found</h3></div>;

  return (
    <div className="profile-page">
      <div className="profile-cover"><div className="cover-blob" /></div>
      <div className="container profile-body">
        <div className="profile-header glass">
          <div className="profile-avatar-wrap">
            {profile.profilePic
              ? <img src={profile.profilePic} alt={profile.name} className="avatar avatar-xl profile-avatar" />
              : <div className="avatar-placeholder profile-avatar" style={{ width: 100, height: 100, fontSize: '2rem' }}>{profile.name?.[0]?.toUpperCase()}</div>}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <form className="profile-edit-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={formState.name} onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))} required />
                  <label className="form-label">Hostel</label>
                  <input className="form-input" value={formState.hostel} onChange={(e) => setFormState(prev => ({ ...prev, hostel: e.target.value }))} required />
                  <label className="form-label">Year</label>
                  <select className="form-select" value={formState.year} onChange={(e) => setFormState(prev => ({ ...prev, year: e.target.value }))}>
                    {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                  <label className="form-label">Razorpay Account ID</label>
                  <input className="form-input" value={formState.razorpayAccountId || ''} onChange={(e) => setFormState(prev => ({ ...prev, razorpayAccountId: e.target.value }))} placeholder="acc_XXXXXXXX" />
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={formState.bio} onChange={(e) => setFormState(prev => ({ ...prev, bio: e.target.value }))} rows={3} />
                </div>

                <div className="skills-edit">
                  <label className="form-label">Skills</label>
                  <div className="skills-input-row">
                    <select
                      className="form-select"
                      value={formState.selectedSkillCategory}
                      onChange={(e) => setFormState(prev => ({ ...prev, selectedSkillCategory: e.target.value, newSkill: e.target.value === 'Other' ? prev.newSkill : '' }))}
                    >
                      <option value="">Select a skill</option>
                      {PREDEFINED_SKILLS.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                    {formState.selectedSkillCategory === 'Other' && (
                      <input
                        className="form-input"
                        value={formState.newSkill}
                        onChange={(e) => setFormState(prev => ({ ...prev, newSkill: e.target.value }))}
                        placeholder="Enter custom skill"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                    )}
                    <button type="button" className="btn btn-primary btn-sm" onClick={addSkill} disabled={!formState.selectedSkillCategory || (formState.selectedSkillCategory === 'Other' && !formState.newSkill.trim())}>
                      +
                    </button>
                  </div>
                  <div className="profile-skills">
                    {formState.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary badge-pill">
                        {skill} <button type="button" onClick={() => removeSkill(skill)} className="skill-remove">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="edit-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setFormState({ ...formState, name: profile.name, hostel: profile.hostel, year: profile.year, razorpayAccountId: profile.razorpayAccountId || '', bio: profile.bio || '', skills: profile.skills || [], newSkill: '', selectedSkillCategory: '' }); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-top-row">
                  <h2>{profile.name}</h2>
                  {canEdit && <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>}
                </div>
                <p className="profile-college">🎓 SVNIT Surat · {profile.hostel} · {profile.year}</p>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                {profile.skills?.length > 0 && (
                  <div className="profile-skills">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary badge-pill">
                        {skill}
                        {canEdit && <button type="button" onClick={() => removeSkill(skill)} className="skill-remove">×</button>}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="profile-stats">
              <div className="pstat"><strong>{profile.totalSales}</strong><span>Sales</span></div>
              <div className="pstat"><strong>{profile.avgRating || '—'}</strong><span>Rating</span></div>
              <div className="pstat"><strong>{profile.totalReviews}</strong><span>Reviews</span></div>
              <div className="pstat"><strong>{listings.length}</strong><span>Listings</span></div>
            </div>
          </div>
        </div>

        <div className="profile-listings">
          <h3>📦 Active Listings ({listings.length})</h3>
          {listings.length === 0 ? (
            <div className="empty-state glass">
              <div style={{ fontSize: '2.5rem' }}>💼</div>
              <p>No listings yet</p>
            </div>
          ) : (
            <div className="profile-listings-grid">
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
