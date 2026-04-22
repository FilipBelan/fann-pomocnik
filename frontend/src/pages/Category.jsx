import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../components/CategoryIcon.jsx';

export default function Category() {
  const { catId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/manuals').then(r => r.json()),
    ])
      .then(([cats, mans]) => {
        setCategories(cats);
        setManuals(mans.filter(m => m.category === catId));
      })
      .finally(() => setLoading(false));
  }, [catId]);

  const category = categories.find(c => c.id === catId);
  const colors = CATEGORY_COLORS[catId] || { bg: '#E1F5EE', color: '#085041' };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Načítavam...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="cat-header" style={{ background: colors.accent || '#0F6E56' }}>
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Späť">‹</button>
        <div className="cat-header-text">
          <p className="cat-title">{category?.name || 'Kategória'}</p>
          <p className="cat-subtitle">{category?.desc}</p>
        </div>
      </header>

      <div className="section">
        <p className="section-title">Čo presne sa deje?</p>

        {manuals.length === 0 ? (
          <p className="empty-msg">Pre túto kategóriu zatiaľ nie sú manuály.</p>
        ) : (
          manuals.map(m => (
            <button
              key={m.id}
              className="problem-item"
              onClick={() => navigate(`/manual/${m.id}`)}
            >
              <span className={`problem-icon priority-${m.priority || 'medium'}`}>
                {m.emoji || '❓'}
              </span>
              <span className="problem-text">
                <span className="problem-name">{m.name}</span>
                <span className="problem-desc">{m.desc}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
