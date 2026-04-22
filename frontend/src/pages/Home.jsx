import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '../components/CategoryIcon.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/categories', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/manuals', { cache: 'no-store' }).then(r => r.json()),
    ])
      .then(([cats, mans]) => {
        setCategories(cats);
        setManuals(mans);
      })
      .catch(err => console.error('Chyba načítania:', err))
      .finally(() => setLoading(false));
  }, []);

  const searchResults = search.trim().length >= 2
    ? manuals.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.desc.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
      <header className="app-header">
        <h1>FANN Pomocník</h1>
      </header>

      <div className="welcome">
        <h2>Čo sa deje?</h2>
        <p>Vyberte, s čím potrebujete pomôcť.</p>
      </div>

      <div className="search-wrap">
        <div className="search-box">
          <span className="search-icon">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className="search-input"
            type="search"
            placeholder="Hľadať problém..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {search.trim().length >= 2 ? (
        <div className="section">
          <p className="section-title">Výsledky hľadania</p>
          {searchResults.length === 0 ? (
            <p className="empty-msg">Nič sme nenašli. Skúste iné slovo.</p>
          ) : (
            searchResults.map(m => (
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
      ) : (
        <div className="section">
          {categories.map(cat => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/kategoria/${cat.id}`)}
            >
              <CategoryIcon icon={cat.icon} catId={cat.id} />
              <span className="category-text">
                <span className="category-name">{cat.name}</span>
                <span className="category-desc">{cat.desc}</span>
              </span>
              <span className="category-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
