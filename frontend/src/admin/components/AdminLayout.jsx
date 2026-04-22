import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../utils/api.js';

export default function AdminLayout({ title, actions, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h1>FANN Pomocník</h1>
          <p>Admin panel</p>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/manualy"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="admin-nav-icon">📋</span>
            Manuály
          </NavLink>
          <NavLink
            to="/admin/kategorie"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="admin-nav-icon">🗂</span>
            Kategórie
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>⎋</span> Odhlásiť sa
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h2>{title}</h2>
          {actions && <div className="filter-bar">{actions}</div>}
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
