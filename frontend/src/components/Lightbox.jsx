import { useEffect } from 'react';

export default function Lightbox({ src, type, caption, onClose }) {
  // Zavrieť na Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const isYoutube = type === 'video' && (src.includes('youtube.com') || src.includes('youtu.be'));
  const isVideo = type === 'video';

  function youtubeEmbedUrl(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Zavrieť">✕</button>

      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {!isVideo && (
          <img className="lightbox-image" src={src} alt={caption || ''} />
        )}

        {isVideo && isYoutube && (
          <div className="lightbox-video-wrap">
            <iframe
              className="lightbox-iframe"
              src={youtubeEmbedUrl(src)}
              allow="autoplay; fullscreen"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}

        {isVideo && !isYoutube && (
          <video
            className="lightbox-video"
            src={`/uploads/videos/${src}`}
            controls
            autoPlay
            playsInline
          />
        )}

        {caption && <p className="lightbox-caption">{caption}</p>}
      </div>
    </div>
  );
}
