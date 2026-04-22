import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StepYesNo from '../components/StepYesNo.jsx';
import StepNext from '../components/StepNext.jsx';
import Tip from '../components/Tip.jsx';
import Lightbox from '../components/Lightbox.jsx';

export default function Wizard() {
  const { manualId } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState(null);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch(`/api/manuals/${manualId}`, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('Manuál sa nenašiel');
        return r.json();
      })
      .then(data => {
        setManual(data);
        if (data.steps?.length > 0) setCurrentStepId(data.steps[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [manualId]);

  function goTo(nextId) {
    if (nextId === 'ok' || nextId === 'fail') {
      navigate(`/manual/${manualId}/vysledok`, {
        state: {
          type: nextId,
          message: nextId === 'ok' ? manual.solution_ok : manual.solution_fail,
          contact: manual.contact,
          manualName: manual.name,
        },
      });
      return;
    }
    setHistory(h => [...h, currentStepId]);
    setCurrentStepId(nextId);
    window.scrollTo(0, 0);
  }

  function goBack() {
    if (history.length === 0) { navigate(-1); return; }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentStepId(prev);
    window.scrollTo(0, 0);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Načítavam...</p>
      </div>
    );
  }

  if (error || !manual) {
    return (
      <div className="page">
        <div className="error-box">
          <p>Manuál sa nepodarilo načítať.</p>
          <button className="btn-big btn-grey" onClick={() => navigate('/')}>← Späť na úvod</button>
        </div>
      </div>
    );
  }

  const step = manual.steps.find(s => s.id === currentStepId);
  const stepIndex = manual.steps.findIndex(s => s.id === currentStepId);
  const totalSteps = manual.steps.length;

  return (
    <div className="page wizard-page">
      <header className="wizard-header">
        <button className="back-btn" onClick={goBack} aria-label="Späť">‹</button>
        <p className="wizard-title">{manual.name}</p>
      </header>

      {/* Segmentovaný progress bar */}
      <div className="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemax={totalSteps}>
        {manual.steps.map((s, i) => (
          <div
            key={s.id}
            className={`progress-segment${i <= stepIndex ? ' done' : ''}`}
          />
        ))}
      </div>

      <span className="step-label">Krok {stepIndex + 1} z {totalSteps}</span>

      <div className="step-card">
        {step.question && (
          <h3 className="step-question">{step.question}</h3>
        )}

        {step.instruction && (
          <div className="step-instruction">
            {step.instruction.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {step.image && (
          <div
            className="image-container"
            onClick={() => setLightbox({ src: `/uploads/images/${step.image}`, type: 'image', caption: step.image_caption })}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setLightbox({ src: `/uploads/images/${step.image}`, type: 'image', caption: step.image_caption })}
            aria-label="Zobraziť fotku na celú obrazovku"
          >
            <img className="step-image" src={`/uploads/images/${step.image}`} alt={step.image_caption || ''} />
            {step.image_caption && (
              <div className="image-caption-bar">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.2"/>
                  <rect x="7" y="7" width="2" height="5" rx="1" fill="#fff"/>
                  <circle cx="8" cy="5" r="1" fill="#fff"/>
                </svg>
                {step.image_caption}
              </div>
            )}
          </div>
        )}

        {step.video && (
          <button
            className="step-video-btn"
            onClick={() => setLightbox({ src: step.video, type: 'video', caption: step.video_caption })}
          >
            <span className="step-video-icon" aria-hidden="true">▶</span>
            <span className="step-video-label">{step.video_caption || 'Pozrieť video návod'}</span>
          </button>
        )}

        {step.tip && <Tip type={step.tip.type} text={step.tip.text} />}
      </div>

      <div className="step-actions">
        {step.type === 'yesno' && (
          <StepYesNo
            onYes={() => goTo(step.yes_to)}
            onNo={() => goTo(step.no_to)}
          />
        )}
        {step.type === 'next' && (
          <StepNext onNext={() => goTo(step.next_to || findNextStepId(manual.steps, step.id))} />
        )}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          type={lightbox.type}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function findNextStepId(steps, currentId) {
  const idx = steps.findIndex(s => s.id === currentId);
  if (idx >= 0 && idx < steps.length - 1) return steps[idx + 1].id;
  return 'fail';
}
