import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];
const HOUSING_TYPES = ['Dorms', 'University Apartments', 'Off-Campus Apartments'];
const ROOM_TYPES = ['Classic', 'Deluxe', 'Plaza', 'Suite', 'Univ. Apt Single', 'Univ. Apt Double', 'Univ. Apt Triple'];
const MOVE_IN_TERMS = ['Fall 2025', 'Winter 2026', 'Spring 2026', 'Fall 2026', 'Winter 2027', 'Spring 2027'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const SLEEP_TIMES = ['8 PM to 10 PM', '10 PM to 12 AM', '12 AM to 2 AM', 'After 2 AM'];
const WAKE_TIMES = ['Before 6 AM', '6–8 AM', '8–10 AM', 'After 10 AM'];
const THERMOSTAT_TEMPS = ['Cool (Below 70°F)', 'Warm (70°F - 75°F)', 'Hot (Above 75°F)', 'No preference'];
const GUEST_POLICIES = [
  'No guests in our room',
  'No guests after 10 PM',
  'Ask before having guests',
  'No overnight guests',
  'Guests anytime, including overnight',
];
const NOISE_TOLERANCES = ['TV and music off', 'TV and music okay', 'TV and music preferred'];

const EMPTY_FORM = {
  full_name: '', academic_year: '', major: '', gender: '', contact_info: '',
  housing_type: '', room_type: '', move_in_term: '',
  sleep_time: '', wake_time: '', thermostat_temp: '', guest_policy: '', noise_tolerance: '',
};

function Field({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value || <span className="profile-field-empty">Not set</span>}</span>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div className="profile-edit-field">
      <label className="profile-edit-label">{label}</label>
      {children}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [account, setAccount] = useState({ username: '', email: '' });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();

      setAccount(data.account || { username: '', email: '' });

      const merged = {
        ...EMPTY_FORM,
        ...(data.profile || {}),
        ...(data.preferences || {}),
      };
      setForm(merged);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startEditing = () => {
    setEditForm({ ...form });
    setError('');
    setSuccessMsg('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const update = (field, value) => setEditForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!editForm.full_name.trim()) { setError('Full name is required.'); return; }
    if (!editForm.academic_year) { setError('Academic year is required.'); return; }
    if (!editForm.major.trim()) { setError('Major is required.'); return; }
    if (!editForm.gender) { setError('Gender is required.'); return; }
    if (!editForm.contact_info.trim()) { setError('Contact info is required.'); return; }
    if (!editForm.housing_type) { setError('Housing type is required.'); return; }
    if (!editForm.room_type) { setError('Room type is required.'); return; }
    if (!editForm.move_in_term) { setError('Move-in term is required.'); return; }
    if (!editForm.sleep_time) { setError('Sleep time is required.'); return; }
    if (!editForm.wake_time) { setError('Wake-up time is required.'); return; }
    if (!editForm.thermostat_temp) { setError('Temperature preference is required.'); return; }
    if (!editForm.guest_policy) { setError('Guest policy is required.'); return; }
    if (!editForm.noise_tolerance) { setError('Noise tolerance is required.'); return; }

    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }

      setForm({ ...editForm });
      setEditing(false);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.full_name
    ? form.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-hero-info">
          <h1 className="profile-hero-name">{form.full_name || 'Your Profile'}</h1>
          <p className="profile-hero-sub">
            {[form.academic_year, form.major].filter(Boolean).join(' · ') || 'No profile info yet'}
          </p>
        </div>
        {!editing && (
          <button className="profile-edit-btn" onClick={startEditing}>
            Edit Profile
          </button>
        )}
      </div>

      {successMsg && <div className="profile-success">{successMsg}</div>}

      {!editing ? (
        /* ── View mode ── */
        <div className="profile-sections">
          <section className="profile-section">
            <h2 className="profile-section-title">Account</h2>
            <div className="profile-fields">
              <Field label="Username" value={account.username} />
              <Field label="Email" value={account.email} />
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Personal Info</h2>
            <div className="profile-fields">
              <Field label="Full Name" value={form.full_name} />
              <Field label="Academic Year" value={form.academic_year} />
              <Field label="Major" value={form.major} />
              <Field label="Gender" value={form.gender} />
              <Field label="Contact Info" value={form.contact_info} />
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Housing</h2>
            <div className="profile-fields">
              <Field label="Housing Type" value={form.housing_type} />
              <Field label="Room Type" value={form.room_type} />
              <Field label="Move-in Term" value={form.move_in_term} />
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Lifestyle</h2>
            <div className="profile-fields">
              <Field label="Bedtime" value={form.sleep_time} />
              <Field label="Wake-up Time" value={form.wake_time} />
              <Field label="Temperature" value={form.thermostat_temp} />
              <Field label="Guest Policy" value={form.guest_policy} />
              <Field label="Noise Tolerance" value={form.noise_tolerance} />
            </div>
          </section>
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="profile-edit-form">
          <section className="profile-section">
            <h2 className="profile-section-title">Account</h2>
            <div className="profile-fields">
              <Field label="Username" value={account.username} />
              <Field label="Email" value={account.email} />
            </div>
            <p className="profile-account-note">Username and email cannot be changed here.</p>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Personal Info</h2>
            <div className="profile-edit-grid">
              <EditField label="Full Name">
                <input
                  className="profile-input"
                  type="text"
                  placeholder="Jane Doe"
                  value={editForm.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                />
              </EditField>

              <EditField label="Academic Year">
                <select className="profile-input" value={editForm.academic_year}
                  onChange={(e) => update('academic_year', e.target.value)}>
                  <option value="">Select year</option>
                  {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </EditField>

              <EditField label="Major">
                <input
                  className="profile-input"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={editForm.major}
                  onChange={(e) => update('major', e.target.value)}
                />
              </EditField>

              <EditField label="Gender">
                <select className="profile-input" value={editForm.gender}
                  onChange={(e) => update('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </EditField>

              <EditField label="Contact Info">
                <input
                  className="profile-input"
                  type="text"
                  placeholder="Phone number or social handle"
                  value={editForm.contact_info}
                  onChange={(e) => update('contact_info', e.target.value)}
                />
              </EditField>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Housing</h2>
            <div className="profile-edit-grid">
              <EditField label="Housing Type">
                <select className="profile-input" value={editForm.housing_type}
                  onChange={(e) => update('housing_type', e.target.value)}>
                  <option value="">Select housing type</option>
                  {HOUSING_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </EditField>

              <EditField label="Room Type">
                <select className="profile-input" value={editForm.room_type}
                  onChange={(e) => update('room_type', e.target.value)}>
                  <option value="">Select room type</option>
                  {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </EditField>

              <EditField label="Move-in Term">
                <select className="profile-input" value={editForm.move_in_term}
                  onChange={(e) => update('move_in_term', e.target.value)}>
                  <option value="">Select term</option>
                  {MOVE_IN_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </EditField>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">Lifestyle</h2>
            <div className="profile-edit-grid">
              <EditField label="Bedtime">
                <select className="profile-input" value={editForm.sleep_time}
                  onChange={(e) => update('sleep_time', e.target.value)}>
                  <option value="">Select bedtime</option>
                  {SLEEP_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </EditField>

              <EditField label="Wake-up Time">
                <select className="profile-input" value={editForm.wake_time}
                  onChange={(e) => update('wake_time', e.target.value)}>
                  <option value="">Select wake-up time</option>
                  {WAKE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </EditField>

              <EditField label="Temperature Preference">
                <select className="profile-input" value={editForm.thermostat_temp}
                  onChange={(e) => update('thermostat_temp', e.target.value)}>
                  <option value="">Select temperature</option>
                  {THERMOSTAT_TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </EditField>

              <EditField label="Guest Policy">
                <select className="profile-input" value={editForm.guest_policy}
                  onChange={(e) => update('guest_policy', e.target.value)}>
                  <option value="">Select guest policy</option>
                  {GUEST_POLICIES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </EditField>

              <EditField label="Noise Tolerance">
                <select className="profile-input" value={editForm.noise_tolerance}
                  onChange={(e) => update('noise_tolerance', e.target.value)}>
                  <option value="">Select noise tolerance</option>
                  {NOISE_TOLERANCES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </EditField>
            </div>
          </section>

          {error && <p className="profile-error">{error}</p>}

          <div className="profile-edit-actions">
            <button className="profile-cancel-btn" onClick={cancelEditing} disabled={saving}>
              Cancel
            </button>
            <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
