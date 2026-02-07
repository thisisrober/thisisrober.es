import { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

export default function Projects() {
  const { t, lang } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/portfolio/projects').then(r => setProjects(r.data));
  }, []);

  return (
    <section id="projects" className="section">
      <Container>
        <div className="text-center mb-5 reveal">
          <p className="section-label mx-auto">{t.projects_title}</p>
        </div>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <div key={project.id} className={`reveal stagger-${(i % 4) + 1}`}>
              <ProjectCard project={project} lang={lang} t={t} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({ project, lang, t }) {
  const cardRef = useRef(null);
  const [shadowColor, setShadowColor] = useState('129, 140, 248');

  const getDominantColor = useCallback((img) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 40) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
      if (count === 0) return '129, 140, 248';
      return `${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`;
    } catch { return '129, 140, 248'; }
  }, []);

  const handleImageLoad = (e) => setShadowColor(getDominantColor(e.target));

  const techs = project.technologies ? project.technologies.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div
      ref={cardRef}
      className="project-card"
      onMouseEnter={() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow = `0 8px 32px rgba(${shadowColor}, 0.3), 0 0 60px rgba(${shadowColor}, 0.1)`;
          cardRef.current.style.borderColor = `rgba(${shadowColor}, 0.5)`;
        }
      }}
      onMouseLeave={() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow = '';
          cardRef.current.style.borderColor = '';
        }
      }}
    >
      <img
        src={project.preview_image}
        alt={lang === 'es' ? project.name_es : project.name_en}
        className="project-image"
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
      />
      <div className="project-content">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h3 className="project-title">{lang === 'es' ? project.name_es : project.name_en}</h3>
          {project.badge && <span className="project-badge">{project.badge}</span>}
        </div>
        <p className="project-description">{lang === 'es' ? project.description_es : project.description_en}</p>
        {techs.length > 0 && (
          <div className="project-tech">
            {techs.map((tech) => (
              <span key={tech} className="tech-tag">{tech}</span>
            ))}
          </div>
        )}
        <div className="project-links">
          {project.live_link && (
            <a href={project.live_link} target="_blank" rel="noreferrer" className="project-link project-link-view">
              <FaExternalLinkAlt size={12} /> {t.project_cta_view}
            </a>
          )}
          {project.github_link && (
            <a href={project.github_link} target="_blank" rel="noreferrer" className="project-link project-link-github">
              <FaGithub size={14} /> GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
