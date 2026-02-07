import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

function AnimatedExpand({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(open ? 'auto' : 0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      const h = ref.current.scrollHeight;
      setHeight(h + 'px');
      const t = setTimeout(() => setHeight('auto'), 300);
      return () => clearTimeout(t);
    } else {
      setHeight(ref.current.scrollHeight + 'px');
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight('0px')));
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{
        height,
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

export default function BlogSidebar() {
  const { t, lang } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [postsByCategory, setPostsByCategory] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  useEffect(() => {
    api.get('/blog/categories').then(res => {
      setCategories(res.data);
      res.data.forEach(cat => {
        api.get(`/blog/posts?category_id=${cat.id}&limit=10`).then(r => {
          setPostsByCategory(prev => ({ ...prev, [cat.id]: r.data.posts }));
        });
      });
    });
  }, []);

  const toggleCat = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <aside className="blog-sidebar">
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle d-block d-lg-none" onClick={() => setMobileOpen(!mobileOpen)}>
        <span>{t.blog_categories}</span>
        {mobileOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>

      {/* Desktop: always visible */}
      <div className="sidebar-content d-none d-lg-block">
        <div className="sidebar-section">
          <h4 className="sidebar-title">{t.blog_categories}</h4>
          <ul className="category-list list-unstyled">
            {categories.map(cat => {
              const posts = postsByCategory[cat.id] || [];
              const isExpanded = expandedCats[cat.id];
              const visiblePosts = isExpanded ? posts : posts.slice(0, 3);

              return (
                <li key={cat.id} className="mb-3">
                  <Link to={`/blog/category/${cat.slug}`} className="category-link fw-medium">
                    {lang === 'es' ? cat.name_es : cat.name_en}
                  </Link>
                  {posts.length > 0 && (
                    <ul className="list-unstyled ms-3 mt-1">
                      {visiblePosts.map(post => (
                        <li key={post.id} className="mb-1">
                          <Link to={`/blog/post/${post.slug}`} className="sidebar-post-link">
                            {(lang === 'es' ? post.title_es : post.title_en)?.substring(0, 60)}
                            {(lang === 'es' ? post.title_es : post.title_en)?.length > 60 ? '...' : ''}
                          </Link>
                        </li>
                      ))}
                      {posts.length > 3 && (
                        <li>
                          <button className="sidebar-see-more" onClick={() => toggleCat(cat.id)}>
                            {isExpanded ? t.blog_see_less : t.blog_see_more} ({posts.length - 3})
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Mobile: animated expand */}
      <div className="d-block d-lg-none">
        <AnimatedExpand open={mobileOpen}>
          <div className="sidebar-section" style={{ paddingTop: '0.5rem' }}>
            <div className="sidebar-categories-pills d-flex flex-wrap gap-2 mb-3">
              {categories.map(cat => (
                <Link key={cat.id} to={`/blog/category/${cat.slug}`} className="blog-hero-tag">
                  {lang === 'es' ? cat.name_es : cat.name_en}
                </Link>
              ))}
            </div>
          </div>
        </AnimatedExpand>
      </div>
    </aside>
  );
}
