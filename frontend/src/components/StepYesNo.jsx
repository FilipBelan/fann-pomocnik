export default function StepYesNo({ onYes, onNo }) {
  return (
    <>
      <button className="btn-big btn-green" onClick={onYes}>
        ✓ Áno
      </button>
      <button className="btn-big btn-red" onClick={onNo}>
        ✗ Nie
      </button>
    </>
  );
}
