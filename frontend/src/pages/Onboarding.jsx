import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Personal Info', 'Housing Preferences', 'Lifestyle', 'Review'];

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];

const HOUSING_TYPES = ['Dorms', 'University Apartments', 'Off-Campus Apartments'];

const ROOM_TYPES = [
  'Classic',
  'Deluxe',
  'Plaza',
  'Suite',
  'Univ. Apt Single',
  'Univ. Apt Double',
  'Univ. Apt Triple',
];

const MOVE_IN_TERMS = [
  'Fall 2025',
  'Winter 2026',
  'Spring 2026',
  'Fall 2026',
  'Winter 2027',
  'Spring 2027',
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const SLEEP_TIMES = [
  '8 PM to 10 PM',
  '10 PM to 12 AM',
  '12 AM to 2 AM',
  'After 2 AM',
];

const WAKE_TIMES = [
  'Before 6 AM',
  '6–8 AM',
  '8–10 AM',
  'After 10 AM',
];

const THERMOSTAT_TEMPS = [
  'Cool (Below 70°F)',
  'Warm (70°F - 75°F)',
  'Hot (Above 75°F)',
  'No preference',
];

const GUEST_POLICIES = [
  'No guests in our room',
  'No guests after 10 PM',
  'Ask before having guests',
  'No overnight guests',
  'Guests anytime, including overnight',
];

const NOISE_TOLERANCES = [
  'TV and music off',
  'TV and music okay',
  'TV and music preferred',
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Profile
    full_name: '',
    academic_year: '',
    major: '',
    gender: '',
    contact_info: '',
    housing_type: '',
    room_type: '',
    move_in_term: '',
    // Preferences
    sleep_time: '',
    wake_time: '',
    thermostat_temp: '',
    guest_policy: '',
    noise_tolerance: '',
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name.trim()) return 'Please enter your full name.';
      if (!form.academic_year) return 'Please select your academic year.';
      if (!form.major.trim()) return 'Please enter your major.';
      if (!form.gender) return 'Please select your gender.';
      if (!form.contact_info.trim()) return 'Please enter your contact info.';
    }
    if (step === 1) {
      if (!form.housing_type) return 'Please select a housing type.';
      if (!form.room_type) return 'Please select a room type.';
      if (!form.move_in_term) return 'Please select a move-in term.';
    }
    if (step === 2) {
      if (!form.sleep_time) return 'Please select your usual bedtime.';
      if (!form.wake_time) return 'Please select your usual wake-up time.';
      if (!form.thermostat_temp) return 'Please select your temperature preference.';
      if (!form.guest_policy) return 'Please select your guest policy.';
      if (!form.noise_tolerance) return 'Please select your noise tolerance.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const reviewItems = [
    ['Full Name', form.full_name],
    ['Academic Year', form.academic_year],
    ['Major', form.major],
    ['Gender', form.gender],
    ['Contact Info', form.contact_info],
    ['Housing Type', form.housing_type],
    ['Room Type', form.room_type],
    ['Move-in Term', form.move_in_term],
    ['Bedtime', form.sleep_time],
    ['Wake-up Time', form.wake_time],
    ['Temperature Preference', form.thermostat_temp],
    ['Guest Policy', form.guest_policy],
    ['Noise Tolerance', form.noise_tolerance],
  ];

  return (
    <div className="auth-page">
      <div className="onboarding-card">

        {/* Header */}
        <div className="onboarding-header">
          <div className="brand">BruinMatch</div>
          <p className="auth-subtitle">Let's set up your profile</p>
        </div>

        {/* Step indicators */}
        <div className="step-indicators">
          {STEPS.map((label, i) => (
            <div key={label} className={`step-indicator ${i <= step ? 'active' : ''}`}>
              <div className="step-circle">{i + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1 — Personal Info */}
        {step === 0 && (
          <div className="onboarding-section">
            <h2 className="onboarding-title">Personal Information</h2>

            {/* Name */}
            <div className="auth-field">
              <label>Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Jane Doe"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
              />
            </div>

            {/* Academic Year */}
            <div className="form-row">
              <div className="auth-field">
                <label>Academic Year</label>
                <select
                  className="auth-input"
                  value={form.academic_year}
                  onChange={(e) => update('academic_year', e.target.value)}
                >
                  <option value="">Select year</option>
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="auth-field">
                <label>Gender</label>
                <select
                  className="auth-input"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Major */}
            <div className="auth-field">
              <label>Major</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Computer Science"
                value={form.major}
                onChange={(e) => update('major', e.target.value)}
              />
            </div>

            {/* Contact Info */}
            <div className="auth-field">
              <label>Contact Info</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Phone number or social handle"
                value={form.contact_info}
                onChange={(e) => update('contact_info', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2 — Housing Preferences */}
        {step === 1 && (
          <div className="onboarding-section">
            <h2 className="onboarding-title">Housing Preferences</h2>

            {/* Housing Type */}
            <div className="auth-field">
              <label>Housing Type</label>
              <select className="auth-input" value={form.housing_type}
                onChange={(e) => update('housing_type', e.target.value)}>
                <option value="">Select housing type</option>
                {HOUSING_TYPES.map((h) => (<option key={h} value={h}>{h}</option>))}
              </select>
            </div>

            {/* Room Type */}
            <div className="auth-field">
              <label>Room Type</label>
              <select className="auth-input" value={form.room_type}
                onChange={(e) => update('room_type', e.target.value)}>
                <option value="">Select room type</option>
                {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Move In Term */}
            <div className="auth-field">
              <label>Move-in Term</label>
              <select className="auth-input" value={form.move_in_term}
                onChange={(e) => update('move_in_term', e.target.value)}>
                <option value="">Select term</option>
                {MOVE_IN_TERMS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>

          </div>
        )}

        {/* Step 3 — Lifestyle */}
        {step === 2 && (
          <div className="onboarding-section">
            <h2 className="onboarding-title">Your Living Style</h2>

            {/* Bedtime */}
            <div className="auth-field">
              <label>When do you usually go to sleep?</label>
              <select className="auth-input" value={form.sleep_time}
                onChange={(e) => update('sleep_time', e.target.value)}>
                <option value="">Select bedtime</option>
                {SLEEP_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Wake time */}
            <div className="auth-field">
              <label>When do you usually wake up?</label>
              <select className="auth-input" value={form.wake_time}
                onChange={(e) => update('wake_time', e.target.value)}>
                <option value="">Select wake-up time</option>
                {WAKE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Temperature */}
            <div className="auth-field">
              <label>What's your ideal room temperature?</label>
              <select className="auth-input" value={form.thermostat_temp}
                onChange={(e) => update('thermostat_temp', e.target.value)}>
                <option value="">Select temperature preference</option>
                {THERMOSTAT_TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Guest Policy */}
            <div className="auth-field">
              <label>What are your preferences for having guests?</label>
              <select className="auth-input" value={form.guest_policy}
                onChange={(e) => update('guest_policy', e.target.value)}>
                <option value="">Select guest policy</option>
                {GUEST_POLICIES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Noise Preference */}
            <div className="auth-field">
              <label>What are your noise preferences?</label>
              <select className="auth-input" value={form.noise_tolerance}
                onChange={(e) => update('noise_tolerance', e.target.value)}>
                <option value="">Select noise tolerance</option>
                {NOISE_TOLERANCES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

          </div>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <div className="onboarding-section">
            <h2 className="onboarding-title">Review Your Info</h2>
            <div className="review-grid">
              {reviewItems.map(([label, value]) => (
                <div key={label} className="review-item">
                  <span className="review-label">{label}</span>
                  <span className="review-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="auth-error">{error}</p>}

        {/* Navigation */}
        <div className="onboarding-nav">
          {/* Remind me later (returns to Dashboard) */}
          <button className="btn btn-ghost" style={{ marginRight: 'auto' }} onClick={() => navigate('/dashboard')}>
            Remind me later
          </button>
          
          {/* Back (goes to previous page of survey) */}
          {step > 0 && (
             <button className="btn btn-secondary" onClick={prevStep}>
             Back
             </button>
          )}
          
          {/* Next (goes to next page of survey) */}
          {step < STEPS.length - 1 && (
            <button className="btn btn-primary" onClick={nextStep}>
            Next
            </button>
          )}
          
          {/* Submit (once all info is filled in) */}
          {step === STEPS.length - 1 && (
            <button className="btn btn-primary"
            onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default Onboarding;