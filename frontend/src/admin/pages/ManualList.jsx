import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { apiGet, apiPut, apiDelete } from '../utils/api.js';

const PRIORITY_LABEL = { high: 'Vysoká', medium: 'Stredná', low: 'Nízka' };
const PRIORITY_TAG   = { high: 'tag-high', medium: 'tag-medium', low: 'tag-low' };

export default function ManualList() {
  const navigate = useNavigate();
  const [manuals, setManuals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiGet('/manuals'), apiGet('/categories')])
      .then(([mans, cats]) => { setManuals(mans); setCategories(cats); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(manual) {
    try {
      const updated = await apiPut(`/manuals/${manual.id}`, { ...manual, active: !manual.active });
      setManuals(ms => ms.map(m => m.id === updated.id ? updated : m));
    } catch (err) {
      alert('Chyba: ' + err.message);
    }
  }

  async function deleteManual(manual) {
    if (!confirm(`Naozaj zmazať manuál "${manual.name}"? Táto akcia sa nedá vrátiť.`)) return;
    try {
      await apiDelete(`/manuals/${manual.id}`);
      setManuals(ms => ms.filter(m => m.id !== manual.id));
    } catch (err) {
      alert('Chyba: ' + err.message);
    }
  }

  const filtered = filter
    ? manuals.filter(m => m.category === filter)
    : manuals;

  const catName = id => categories.find(c => c.id === id)?.name || id;

  return (
    <AdminLayout
      title="Manuály"
      actions={
        <>
          <select
            className="filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">Všetky kategórie</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/admin/manualy/novy')}>
            + Nový manuál
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}

      {loading ? (
        <div className="admin-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">Žiadne manuály. Vytvorte prvý kliknutím na „+ Nový manuál".</div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Názov</th>
                <th>Kategória</th>
                <th>Priorita</th>
                <th>Krokov</th>
                <th>Stav</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={{ fontSize: 20, textAlign: 'center' }}>{m.emoji || '📄'}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{m.desc}</div>
                  </td>
                  <td>{catName(m.category)}</td>
                  <td>
                    <span className={`tag ${PRIORITY_TAG[m.priority] || ''}`}>
                      {PRIORITY_LABEL[m.priority] || m.priority}
                    </span>
                  </td>
                  <td style={{ color: '#6B6B6B' }}>{m.steps?.length ?? 0}</td>
                  <td>
                    <label className="toggle-wrap" title={m.active ? 'Aktívny' : 'Neaktívny'}>
                      <span className="toggle">
                        <input
                          type="checkbox"
                          checked={!!m.active}
                          onChange={() => toggleActive(m)}
                        />
                        <span className="toggle-slider" />
                      </span>
                      <span className={`tag ${m.active ? 'tag-active' : 'tag-inactive'}`}>
                        {m.active ? 'Aktívny' : 'Skrytý'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/admin/manualy/${m.id}`)}
                      >
                        ✏ Upraviť
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => deleteManual(m)}
                        title="Zmazať"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
