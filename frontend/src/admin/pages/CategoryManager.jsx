import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { apiGet, apiPut } from '../utils/api.js';

const ICON_OPTIONS = [
  { value: 'receipt', label: '🧾 Pokladňa' },
  { value: 'monitor', label: '🖥 Počítač' },
  { value: 'wifi',    label: '📶 Internet' },
  { value: 'scan',    label: '📷 Skener' },
  { value: 'phone',   label: '📞 Telefón' },
  { value: 'tools',   label: '🔧 Nástroje' },
];

const NEW_CAT = () => ({
  id: '',
  name: '',
  desc: '',
  icon: 'receipt',
  color: '#0F6E56',
  order: 99,
});

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiGet('/categories')
      .then(cats => setCategories(cats.sort((a, b) => a.order - b.order)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function setField(index, field, value) {
    setCategories(cats => {
      const updated = [...cats];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function moveUp(index) {
    if (index === 0) return;
    setCategories(cats => {
      const updated = [...cats];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  function moveDown(index) {
    if (index === categories.length - 1) return;
    setCategories(cats => {
      const updated = [...cats];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  function addCategory() {
    const cat = NEW_CAT();
    cat.order = categories.length + 1;
    setCategories(cats => [...cats, cat]);
  }

  function deleteCategory(index) {
    if (!confirm(`Zmazať kategóriu "${categories[index].name}"?`)) return;
    setCategories(cats => cats.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i + 1 })));
  }

  async function handleSave() {
    for (const cat of categories) {
      if (!cat.id || !cat.name) {
        setError('Každá kategória musí mať ID a Názov');
        return;
      }
    }
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiPut('/categories', categories);
      setSuccess('Kategórie uložené!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout
      title="Kategórie"
      actions={
        <>
          <button className="btn btn-secondary" onClick={addCategory}>+ Pridať kategóriu</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Ukladám...' : '💾 Uložiť zmeny'}
          </button>
        </>
      }
    >
      {error   && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && (
        <div style={{ background: '#E1F5EE', color: '#085041', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
          ✓ {success}
        </div>
      )}

      {loading ? (
        <div className="admin-spinner"><div className="spinner" /></div>
      ) : (
        <div>
          {categories.map((cat, i) => (
            <div key={i} className="cat-manager-item">
              {/* Poradie */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => moveUp(i)}   disabled={i === 0}>↑</button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => moveDown(i)} disabled={i === categories.length - 1}>↓</button>
              </div>

              {/* Farebný náhľad */}
              <div
                className="cat-manager-icon"
                style={{ background: cat.color + '22', color: cat.color, fontSize: 22 }}
              >
                {cat.icon === 'receipt' && '🧾'}
                {cat.icon === 'monitor' && '🖥'}
                {cat.icon === 'wifi'    && '📶'}
                {cat.icon === 'scan'    && '📷'}
                {cat.icon === 'phone'   && '📞'}
                {cat.icon === 'tools'   && '🔧'}
                {!['receipt','monitor','wifi','scan','phone','tools'].includes(cat.icon) && '📁'}
              </div>

              {/* Polia */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto auto', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input"
                  placeholder="ID (napr. kas)"
                  value={cat.id}
                  onChange={e => setField(i, 'id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  style={{ fontSize: 12 }}
                />
                <input
                  className="form-input"
                  placeholder="Názov"
                  value={cat.name}
                  onChange={e => setField(i, 'name', e.target.value)}
                  style={{ fontSize: 12 }}
                />
                <input
                  className="form-input"
                  placeholder="Krátky popis"
                  value={cat.desc}
                  onChange={e => setField(i, 'desc', e.target.value)}
                  style={{ fontSize: 12 }}
                />
                <select
                  className="form-select"
                  value={cat.icon}
                  onChange={e => setField(i, 'icon', e.target.value)}
                  style={{ fontSize: 12 }}
                >
                  {ICON_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="color"
                  value={cat.color}
                  onChange={e => setField(i, 'color', e.target.value)}
                  style={{ width: 36, height: 34, padding: 2, border: '1px solid #DDD', borderRadius: 6, cursor: 'pointer' }}
                  title="Farba kategórie"
                />
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  onClick={() => deleteCategory(i)}
                  title="Zmazať"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="admin-empty">Žiadne kategórie. Kliknite na „+ Pridať kategóriu".</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
