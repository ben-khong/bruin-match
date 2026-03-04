import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Browse.css';

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];
const HOUSING_TYPES = ['Dorms', 'University Apartments', 'Off-Campus Apartments'];
const ROOM_TYPES = ['Classic', 'Deluxe', 'Plaza', 'Suite', 'Univ. Apt Single', 'Univ. Apt Double', 'Univ. Apt Triple'];
const MOVE_IN_TERMS = ['Fall 2025', 'Winter 2026', 'Spring 2026', 'Fall 2026', 'Winter 2027', 'Spring 2027'];

const CARDS_PER_PAGE = 6;

function RoommateCard({ user }) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tagColor = {
    'Dorms': '#dbeafe',
    'University Apartments': '#ede9fe',
    'Off-Campus Apartments': '#dcfce7',
  };

  return (
    <div className="roommate-card">
      <div className="card-header">
        <div className="card-avatar">{initials}</div>
        <div className="card-identity">
          <h3 className="card-name">{user.full_name}</h3>
          <span className="card-profile">{user.gender} &middot; {user.academic_year} &middot; {user.major}</span>
        </div>
      </div>

      <div className="card-tags">
        <span className="card-tag" style={{ background: tagColor[user.housing_type] || '#f1f5f9' }}>
          {user.housing_type}
        </span>
        <span className="card-tag" style={{ background: '#fef9c3' }}>{user.room_type}</span>
        <span className="card-tag" style={{ background: '#fce7f3' }}>{user.move_in_term}</span>
      </div>

      <div className="card-prefs">
        <div className="card-pref-row"><span className="pref-icon">🌙</span><span>{user.sleep_time}</span></div>
        <div className="card-pref-row"><span className="pref-icon">☀️</span><span>{user.wake_time}</span></div>
        <div className="card-pref-row"><span className="pref-icon">🌡️</span><span>{user.thermostat_temp}</span></div>
        <div className="card-pref-row"><span className="pref-icon">🔊</span><span>{user.noise_tolerance}</span></div>
        <div className="card-pref-row"><span className="pref-icon">🚪</span><span>{user.guest_policy}</span></div>
      </div>

      <div className="card-footer">
        <span className="card-contact-label">Contact</span>
        <span className="card-contact">{user.contact_info}</span>
      </div>
    </div>
  );
}

function Browse() {
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    academic_year: '',
    housing_type: '',
    room_type: '',
    move_in_term: '',
  });

  const fetchRoommates = useCallback(async (currentPage, currentFilters) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    const params = new URLSearchParams({ page: currentPage, limit: CARDS_PER_PAGE });
    Object.entries(currentFilters).forEach(([k, v]) => { if (v) params.append(k, v); });

    try {
      const res = await fetch('http://localhost:3001/api/users?' + params.toString(), {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      setRoommates(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch roommates:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchRoommates(page, filters);
  }, [page, filters, fetchRoommates, navigate]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ academic_year: '', housing_type: '', room_type: '', move_in_term: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="browse-page">
      <header className="browse-page-header">
        <div className="browse-page-header-left">
          <button className="btn btn-ghost back-btn" onClick={() => navigate('/dashboard')}>
            &larr; Dashboard
          </button>
          <div>
            <h1 className="browse-page-title">Find Your Roommate</h1>
            <p className="browse-page-subtitle">
              {loading ? 'Searching...' : total + ' Bruin' + (total !== 1 ? 's' : '') + ' looking for a roommate'}
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filter-bar">
        <select className="filter-select" value={filters.academic_year}
          onChange={(e) => handleFilterChange('academic_year', e.target.value)}>
          <option value="">All Years</option>
          {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="filter-select" value={filters.housing_type}
          onChange={(e) => handleFilterChange('housing_type', e.target.value)}>
          <option value="">All Housing</option>
          {HOUSING_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <select className="filter-select" value={filters.room_type}
          onChange={(e) => handleFilterChange('room_type', e.target.value)}>
          <option value="">All Room Types</option>
          {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={filters.move_in_term}
          onChange={(e) => handleFilterChange('move_in_term', e.target.value)}>
          <option value="">All Terms</option>
          {MOVE_IN_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {hasActiveFilters && (
          <button className="btn btn-ghost filter-clear" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="browse-loading">
          <div className="loading-spinner" />
          <p>Finding Bruins...</p>
        </div>
      ) : roommates.length === 0 ? (
        <div className="browse-empty">
          <span className="empty-icon">🐻</span>
          <h3>No roommates found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <>
          <div className="roommate-grid">
            {roommates.map((u) => <RoommateCard key={u.user_id} user={u} />)}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}>
                &#8592;
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p}
                    className={'pagination-page' + (p === page ? ' active' : '')}
                    onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}>
                &#8594;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Browse;