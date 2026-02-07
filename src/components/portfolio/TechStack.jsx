import { useRef, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const DEFAULT_TECH = [
  { name: 'Adobe Photoshop', logo: 'adobe-photoshop-logo-1.png' },
  { name: 'AWS', logo: 'Amazon_Web_Services_Logo.svg.webp' },
  { name: 'Azure', logo: 'Microsoft_Azure_Logo.svg.png' },
  { name: 'Bash', logo: 'Bash_Logo_Colored.svg.png' },
  { name: 'Bootstrap', logo: 'Bootstrap_logo.svg.png' },
  { name: 'Cisco', logo: 'Cisco_logo.svg.png' },
  { name: 'Git', logo: 'Git_icon.svg.png' },
  { name: 'GitHub', logo: 'GitHub-Logo.png' },
  { name: 'Jupyter', logo: 'Jupyter_logo.svg.png' },
  { name: 'MySQL', logo: 'Mysql_logo.png' },
  { name: 'Oracle', logo: 'Oracle-Logo.png' },
  { name: 'PowerShell', logo: 'PowerShell_5.0_icon.png' },
  { name: 'Raspberry Pi', logo: 'Raspberry_Pi-Logo.wine.png' },
  { name: 'Terraform', logo: 'terraform-icon.png' },
  { name: 'Ubuntu', logo: 'UbuntuCoF.svg.png' },
];

export default function TechStack() {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollStart: 0 });
  const autoScrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [techItems, setTechItems] = useState(DEFAULT_TECH);

  // Fetch tech items from settings
  useEffect(() => {
    api.get('/blog/settings/public').then(r => {
      if (r.data?.tech_items) {
        try {
          const parsed = JSON.parse(r.data.tech_items);
          if (Array.isArray(parsed) && parsed.length > 0) setTechItems(parsed);
        } catch { /* keep default */ }
      }
    }).catch(() => {});
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let speed = 0.5;

    const animate = () => {
      if (!paused && !dragState.current.isDragging && el) {
        el.scrollLeft += speed;
        // Loop: when we scroll past half, reset
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      autoScrollRef.current = requestAnimationFrame(animate);
    };
    autoScrollRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(autoScrollRef.current);
  }, [paused]);

  const handlePointerDown = (e) => {
    dragState.current.isDragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.scrollStart = scrollRef.current?.scrollLeft || 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrollRef.current?.classList.add('dragging');
  };

  const handlePointerMove = (e) => {
    if (!dragState.current.isDragging || !scrollRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    scrollRef.current.scrollLeft = dragState.current.scrollStart - dx;
  };

  const handlePointerUp = () => {
    dragState.current.isDragging = false;
    scrollRef.current?.classList.remove('dragging');
  };

  return (
    <section id="tech" className="section">
      <Container>
        <p className="section-label reveal">{t.tech_title}</p>
        <div
          className="tech-marquee mt-4"
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="tech-marquee-track">
            {[...techItems, ...techItems].map((tech, i) => (
              <div key={`${tech.name}-${i}`} className="tech-item">
                <img src={`/img/tech/${tech.logo}`} alt={tech.name} draggable={false} />
                <p>{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="tech-disclaimer">
          <p className="mb-0">{t.tech_disclaimer}</p>
        </div>
      </Container>
    </section>
  );
}
