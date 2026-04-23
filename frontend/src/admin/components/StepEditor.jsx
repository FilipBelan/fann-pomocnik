import { useState } from 'react';
import { apiUpload } from '../utils/api.js';

const TIP_TYPES = [
  { value: '', label: 'Žiadny tip' },
  { value: 'info',   label: '💡 Info' },
  { value: 'warn',   label: '⚠ Upozornenie' },
  { value: 'danger', label: '⚠ Nebezpečenstvo' },
];

export default function StepEditor({ step, index, total, allStepIds, allSteps, onChange, onMoveUp, onMoveDown, onDelete, onFocus, isFocused }) {
  const [open, setOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function set(field, value) {
    onChange({ ...step, [field]: value });
  }

  function setTip(field, value) {
    const tip = step.tip ? { ...step.tip } : { type: 'info', text: '' };
    tip[field] = value;
    onChange({ ...step, tip: tip.type ? tip : null });
  }

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiUpload(file);
      if (result.type === 'video') {
        set('video', result.filename);
      } else {
        set('image', result.filename);
      }
    } catch (err) {
      alert('Upload zlyhal: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  const nextTargets = [
    ...allStepIds.filter(id => id !== step.id).map(id => {
      const pos = allSteps ? allSteps.findIndex(s => s.id === id) : -1;
      const s = allSteps ? allSteps[pos] : null;
      const preview = s ? (s.question || s.instruction || '').slice(0, 40) : '';
      const label = pos >= 0
        ? `Krok ${pos + 1}${preview ? ' — ' + preview : ''}`
        : id;
      return { value: id, label };
    }),
    { value: 'ok', label: '✓ Vyriešené (ok)' },
    { value: 'fail', label: '✕ Zavolajte IT (fail)' },
  ];

  return (
    <div
      className={`step-item${isFocused ? ' step-item-focused' : ''}`}
      onClick={onFocus}
      style={isFocused ? { borderColor: '#1D9E75' } : {}}
    >
      <div className="step-item-header" onClick={() => setOpen(o => !o)}>
        <span className="step-item-num">Krok {index + 1}</span>
        <span className="step-item-title">
          {step.question || step.instruction?.slice(0, 60) || '(prázdny krok)'}
        </span>
        <span className="step-item-type">{step.type === 'yesno' ? 'Áno/Nie' : 'Hotovo'}</span>

        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onMoveUp}  disabled={index === 0}     title="Hore">↑</button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onMoveDown} disabled={index === total - 1} title="Dole">↓</button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if(confirm('Zmazať krok?')) onDelete(); }} title="Zmazať">×</button>
        </div>
      </div>

      {open && (
        <div className="step-item-body">
          {/* Typ */}
          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label>Typ kroku</label>
              <select className="form-select" value={step.type} onChange={e => set('type', e.target.value)}>
                <option value="yesno">Áno / Nie (otázka)</option>
                <option value="next">Hotovo, čo ďalej? (inštrukcia)</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>ID kroku</label>
              <input className="form-input" value={step.id} onChange={e => set('id', e.target.value)} />
            </div>
          </div>

          {/* Otázka */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Otázka {step.type === 'yesno' ? '' : '(voliteľné)'}</label>
            <input
              className="form-input"
              placeholder={step.type === 'yesno' ? 'Svieti na tlačiarni zelené svetielko?' : ''}
              value={step.question || ''}
              onChange={e => set('question', e.target.value)}
            />
          </div>

          {/* Inštrukcia */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Inštrukcia</label>
            <textarea
              className="form-textarea"
              placeholder="Pozrite sa na malú bielu krabičku..."
              value={step.instruction || ''}
              onChange={e => set('instruction', e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          {/* Upload fotky */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fotka</label>
            {step.image ? (
              <div className="upload-preview">
                <img src={`/uploads/images/${step.image}`} alt="" />
                <span className="upload-preview-name">{step.image}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => set('image', null)}>× Odstrániť</button>
              </div>
            ) : (
              <div
                className={`upload-area${dragOver ? ' drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              >
                <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                {uploading ? '⏳ Nahrávam...' : '📷 Pretiahnite fotku sem alebo kliknite'}
              </div>
            )}
            {step.image && (
              <input
                className="form-input mt-4"
                placeholder="Popis fotky (caption)"
                value={step.image_caption || ''}
                onChange={e => set('image_caption', e.target.value)}
              />
            )}
          </div>

          {/* Video */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Video (URL alebo upload)</label>
            {step.video ? (
              <div className="upload-preview">
                <span style={{ fontSize: 24 }}>🎬</span>
                <span className="upload-preview-name">{step.video}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => set('video', null)}>× Odstrániť</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="form-input"
                  placeholder="https://youtube.com/... alebo upload nižšie"
                  value={step.video || ''}
                  onChange={e => set('video', e.target.value)}
                />
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                  <span className="btn btn-secondary btn-sm">{uploading ? '⏳' : '📁'}</span>
                </label>
              </div>
            )}
            {step.video && (
              <input
                className="form-input mt-4"
                placeholder="Popis videa"
                value={step.video_caption || ''}
                onChange={e => set('video_caption', e.target.value)}
              />
            )}
          </div>

          {/* Tip */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Tip / Upozornenie</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select
                className="form-select"
                value={step.tip?.type || ''}
                onChange={e => {
                  if (!e.target.value) { onChange({ ...step, tip: null }); }
                  else setTip('type', e.target.value);
                }}
              >
                {TIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {step.tip?.type && (
              <textarea
                className="form-textarea"
                placeholder="Text tipu..."
                value={step.tip?.text || ''}
                onChange={e => setTip('text', e.target.value)}
                style={{ minHeight: 60 }}
              />
            )}
          </div>

          {/* Navigácia */}
          {step.type === 'yesno' && (
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label>✓ Áno → ísť na</label>
                <select className="form-select" value={step.yes_to || ''} onChange={e => set('yes_to', e.target.value)}>
                  <option value="">— vybrať —</option>
                  {nextTargets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>✕ Nie → ísť na</label>
                <select className="form-select" value={step.no_to || ''} onChange={e => set('no_to', e.target.value)}>
                  <option value="">— vybrať —</option>
                  {nextTargets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          )}
          {step.type === 'next' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label>Hotovo → ísť na</label>
              <select className="form-select" value={step.next_to || ''} onChange={e => set('next_to', e.target.value)}>
                <option value="">— vybrať —</option>
                {nextTargets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
