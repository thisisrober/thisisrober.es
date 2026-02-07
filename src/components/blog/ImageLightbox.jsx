import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

export default function ImageLightbox() {
  const [src, setSrc] = useState(null);
  const [scale, setScale] = useState(1);

  const open = useCallback((imgSrc) => {
    setSrc(imgSrc);
    setScale(1);
    document.body.style.overflow = 'hidden';
  }, []);

  const close = useCallback(() => {
    setSrc(null);
    setScale(1);
    document.body.style.overflow = '';
  }, []);

  // Listen for clicks on images inside .post-body
  useEffect(() => {
    const handleClick = (e) => {
      const img = e.target.closest('.post-body img, .post-single-image');
      if (img && img.src) {
        e.preventDefault();
        open(img.src);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!src) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [src, close]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale(prev => {
      const next = prev + (e.deltaY < 0 ? 0.2 : -0.2);
      return Math.max(0.5, Math.min(4, next));
    });
  }, []);

  if (!src) return null;

  return (
    <div className="lightbox-overlay" onClick={close} onWheel={handleWheel}>
      <div className="lightbox-controls">
        <button className="lightbox-btn" onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(4, s + 0.3)); }}>
          <FaSearchPlus size={16} />
        </button>
        <button className="lightbox-btn" onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(0.5, s - 0.3)); }}>
          <FaSearchMinus size={16} />
        </button>
        <button className="lightbox-btn" onClick={close}>
          <FaTimes size={18} />
        </button>
      </div>
      <img
        src={src}
        alt=""
        className="lightbox-img"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>
  );
}
