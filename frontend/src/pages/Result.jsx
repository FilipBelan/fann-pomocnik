import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { manualId } = useParams();

  const type = state?.type || 'fail';
  const message = state?.message || (type === 'ok'
    ? 'Výborne, problém je vyriešený!'
    : 'Nevadí, zavolajte technickú pomoc.');
  const contact = state?.contact;

  const isOk = type === 'ok';

  return (
    <div className="page result-page">
      <div className="result-box">
        <div className={`result-icon ${isOk ? 'success' : 'fail'}`} aria-hidden="true">
          {isOk ? '✓' : '📞'}
        </div>

        <h3>{isOk ? 'Super, vyriešené!' : 'Nevadí, zavolajte IT'}</h3>

        <p className="result-message">{message}</p>

        {!isOk && contact && (
          <div className="call-box">
            <p>Zavolajte na technickú podporu:</p>
            <a className="call-number" href={`tel:${contact.replace(/\s/g, '')}`}>
              {contact}
            </a>
          </div>
        )}
      </div>

      <div className="result-actions">
        {!isOk && (
          <button
            className="btn-big btn-grey"
            onClick={() => navigate(`/manual/${manualId}`, { replace: true })}
          >
            ↺ Skúsiť znova od začiatku
          </button>
        )}
        <button
          className="btn-big btn-green"
          onClick={() => navigate('/')}
        >
          ← Späť na začiatok
        </button>
      </div>
    </div>
  );
}
