import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon.jsx';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      <div
        className="sidebar-brand"
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('/')}
      >
        <span className="sidebar-brand-name">FANN Pomocník</span>
      </div>
      <nav className="sidebar-nav">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`sidebar-cat-btn${location.pathname === `/kategoria/${cat.id}` ? ' active' : ''}`}
            onClick={() => navigate(`/kategoria/${cat.id}`)}
          >
            <CategoryIcon icon={cat.icon} catId={cat.id} />
            <span className="sidebar-cat-name">{cat.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
