import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import StepEditor from '../components/StepEditor.jsx';
import Tip from '../../components/Tip.jsx';
import { apiGet, apiPost, apiPut } from '../utils/api.js';

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'Vysoká' },
  { value: 'medium', label: 'Stredná' },
  { value: 'low',    label: 'Nízka' },
];

const EMPTY_STEP = (index) => ({
  id: `s${index + 1}`,
  type: 'yesno',
  question: '',
  instruction: '',
  image: null,
  image_caption: null,
  video: null,
  video_caption: null,
  tip: null,
  yes_to: '',
  no_to: '',
});

export default function ManualEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [focusedStep, setFocusedStep] = useState(0);

  const [manual, setManual] = useState({
    id: '',
    name: '',
    desc: '',
    emoji: '📄',
    category: '',
    priority: 'medium',
    active: true,
    steps: [EMPTY_STEP(0)],
    solution_ok: 'Výborne, problém je vyriešený!',
    solution_fail: 'Nevadí, zavolajte technickú podporu.',
    contact: 'kl. 123',
  });

  useEffect(() => {
    const loads = [apiGet('/categories')];
    if (!isNew) loads.push(apiGet(`/manuals/${id}`));
    Promise.all(loads)
      .then(([cats, man]) => {
        setCategories(cats);
        if (man) setManual(man);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function setField(field, value) {
    setManual(m => ({ ...m, [field]: value }));
  }

  function setStep(index, step) {
    setManual(m => {
      const steps = [...m.steps];
      steps[index] = step;
      return { ...m, steps };
    });
  }

  function addStep() {
    setManual(m => ({
      ...m,
      steps: [...m.steps, EMPTY_STEP(m.steps.length)],
    }));
    setFocusedStep(manual.steps.length);
  }

  function deleteStep(index) {
    setManual(m => ({ ...m, steps: m.steps.filter((_, i) => i !== index) }));
    setFocusedStep(Math.max(0, index - 1));
  }

  function moveStep(index, dir) {
    setManual(m => {
      const steps = [...m.steps];
      const target = index + dir;
      if (target < 0 || target >= steps.length) return m;
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...m, steps };
    });
    setFocusedStep(index + dir);
  }

  async function handleSave() {
    if (!manual.id || !manual.name || !manual.category) {
      setError('Vyplňte ID, Názov a Kategóriu');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        await apiPost('/manuals', manual);
      } else {
        await apiPut(`/manuals/${id}`, manual);
      }
      navigate('/admin/manualy');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const previewStep = manual.steps[focusedStep] || manual.steps[0];
  const allStepIds = manual.steps.map(s => s.id);
  const allSteps = manual.steps;

  if (loading) {
    return (
      <AdminLayout title="Editor manuálu">
        <div className="admin-spinner"><div className="spinner" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? 'Nový manuál' : `Upraviť: ${manual.name}`}
      actions={
        <>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/manualy')}>
            ← Späť
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Ukladám...' : '💾 Uložiť manuál'}
          </button>
        </>
      }
    >
      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="editor-layout">
        {/* ─── FORMULÁR ─────────────────────────────────────── */}
        <div className="editor-form-pane">
          {/* Základné info */}
          <div className="admin-card">
            <div style={{ fontWeight: 500, marginBottom: 14, fontSize: 13, color: '#4A4A4A' }}>
              Základné informácie
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ID manuálu {isNew && <span style={{ color: '#E24B4A' }}>*</span>}</label>
                <input
                  className="form-input"
                  placeholder="napr. blocek-zaseknuty"
                  value={manual.id}
                  onChange={e => setField('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  disabled={!isNew}
                />
              </div>
              <div className="form-group">
                <label>Emoji ikona</label>
                <input
                  className="form-input"
                  value={manual.emoji || ''}
                  onChange={e => setField('emoji', e.target.value)}
                  placeholder="🖨"
                  style={{ fontSize: 20 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Názov <span style={{ color: '#E24B4A' }}>*</span></label>
              <input
                className="form-input"
                placeholder="Netlačí bloček"
                value={manual.name}
                onChange={e => setField('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Krátky popis</label>
              <input
                className="form-input"
                placeholder="Keď pokladňa nevytlačí papierik"
                value={manual.desc || ''}
                onChange={e => setField('desc', e.target.value)}
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Kategória <span style={{ color: '#E24B4A' }}>*</span></label>
                <select
                  className="form-select"
                  value={manual.category}
                  onChange={e => setField('category', e.target.value)}
                >
                  <option value="">— vybrať —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priorita</label>
                <select
                  className="form-select"
                  value={manual.priority}
                  onChange={e => setField('priority', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stav</label>
                <label className="toggle-wrap" style={{ marginTop: 8 }}>
                  <span className="toggle">
                    <input
                      type="checkbox"
                      checked={!!manual.active}
                      onChange={e => setField('active', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </span>
                  <span className="toggle-label">{manual.active ? 'Aktívny' : 'Skrytý'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Záverečné správy */}
          <div className="admin-card">
            <div style={{ fontWeight: 500, marginBottom: 14, fontSize: 13, color: '#4A4A4A' }}>
              Záverečné správy
            </div>
            <div className="form-group">
              <label>✓ Správa keď sa vyriešilo</label>
              <textarea
                className="form-textarea"
                value={manual.solution_ok || ''}
                onChange={e => setField('solution_ok', e.target.value)}
                style={{ minHeight: 60 }}
              />
            </div>
            <div className="form-group">
              <label>✕ Správa keď sa nevyriešilo</label>
              <textarea
                className="form-textarea"
                value={manual.solution_fail || ''}
                onChange={e => setField('solution_fail', e.target.value)}
                style={{ minHeight: 60 }}
              />
            </div>
            <div className="form-group">
              <label>Kontakt (telefón / klapka)</label>
              <input
                className="form-input"
                placeholder="kl. 123"
                value={manual.contact || ''}
                onChange={e => setField('contact', e.target.value)}
              />
            </div>
          </div>

          {/* Kroky */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Kroky ({manual.steps.length})</div>
              <button className="btn btn-secondary btn-sm" onClick={addStep}>+ Pridať krok</button>
            </div>

            {manual.steps.map((step, i) => (
              <StepEditor
                key={i}
                step={step}
                index={i}
                total={manual.steps.length}
                allStepIds={allStepIds}
                allSteps={allSteps}
                isFocused={focusedStep === i}
                onFocus={() => setFocusedStep(i)}
                onChange={s => setStep(i, s)}
                onMoveUp={() => moveStep(i, -1)}
                onMoveDown={() => moveStep(i, 1)}
                onDelete={() => deleteStep(i)}
              />
            ))}

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: 4 }}
              onClick={addStep}
            >
              + Pridať ďalší krok
            </button>
          </div>
        </div>

        {/* ─── LIVE PREVIEW ──────────────────────────────────── */}
        <div className="editor-preview-pane">
          <p className="preview-label">Live preview — krok {focusedStep + 1}</p>
          <div className="preview-phone">
            {/* Wizard header */}
            <div style={{ background: '#0F6E56', color: '#fff', padding: '12px 16px' }}>
              <p style={{ fontSize: 16, fontWeight: 500 }}>{manual.name || 'Názov manuálu'}</p>
            </div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', background: '#F5F5F0' }}>
              {manual.steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i <= focusedStep ? '#1D9E75' : 'rgba(0,0,0,0.08)',
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#9B9B9B', padding: '4px 16px 0', background: '#F5F5F0', textAlign: 'right' }}>
              Krok {focusedStep + 1} z {manual.steps.length}
            </div>

            {/* Step card */}
            <div style={{ padding: '12px 16px 0', background: '#F5F5F0' }}>
              <div className="step-card" style={{ margin: 0 }}>
                {previewStep?.question && (
                  <h3 className="step-question">{previewStep.question}</h3>
                )}
                {previewStep?.instruction && (
                  <div className="step-instruction">
                    {previewStep.instruction.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
                {previewStep?.image && (
                  <div className="image-container" style={{ cursor: 'default' }}>
                    <img className="step-image" src={`/uploads/images/${previewStep.image}`} alt="" />
                    {previewStep.image_caption && (
                      <div className="image-caption-bar">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.2"/>
                          <rect x="7" y="7" width="2" height="5" rx="1" fill="#fff"/>
                          <circle cx="8" cy="5" r="1" fill="#fff"/>
                        </svg>
                        {previewStep.image_caption}
                      </div>
                    )}
                  </div>
                )}
                {previewStep?.tip && (
                  <Tip type={previewStep.tip.type} text={previewStep.tip.text} />
                )}
              </div>
            </div>

            {/* Buttons preview */}
            <div style={{ padding: '12px 16px 16px', background: '#F5F5F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {previewStep?.type === 'yesno' ? (
                <>
                  <div style={{ background: '#1D9E75', color: '#fff', borderRadius: 12, padding: '14px 16px', textAlign: 'center', fontSize: 15, fontWeight: 500 }}>✓ Áno</div>
                  <div style={{ background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F09595', borderRadius: 12, padding: '14px 16px', textAlign: 'center', fontSize: 15, fontWeight: 500 }}>✗ Nie</div>
                </>
              ) : (
                <div style={{ background: '#1D9E75', color: '#fff', borderRadius: 12, padding: '14px 16px', textAlign: 'center', fontSize: 15, fontWeight: 500 }}>Hotovo, čo ďalej? →</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
