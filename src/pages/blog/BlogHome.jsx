import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaTerminal } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import BlogHeader from '../../components/blog/BlogHeader';
import BlogFooter from '../../components/blog/BlogFooter';
import PostCard from '../../components/blog/PostCard';
import BlogSidebar from '../../components/blog/BlogSidebar';

const HERO_PATHS = ['/blog', '/ideas', '/ai', '/cloud', '/devops', '/code'];

export default function BlogHome() {
  const { t, lang } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  const [pathIdx, setPathIdx] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPathIdx(prev => (prev + 1) % HERO_PATHS.length);
    }, 2400);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    api.get('/blog/posts?limit=20').then(res => {
      const all = res.data.posts || [];
      if (all.length > 0) setFeatured(all[0]);
      setPosts(all.slice(1));
      setLoading(false);
    });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="blog-page">
      <BlogHeader />

      <div className="blog-hero">
        <div className="blog-hero-glow blog-hero-glow-1" />
        <div className="blog-hero-glow blog-hero-glow-2" />
        <div className="container">
          <div className="blog-hero-inner">
            <div className="blog-hero-terminal">
              <FaTerminal size={14} className="blog-hero-term-icon" />
              <span className="blog-hero-prompt">~</span>
              <span className="blog-hero-path" key={pathIdx}>{HERO_PATHS[pathIdx]}</span>
              <span className="blog-hero-cursor">_</span>
            </div>
            <p className="blog-hero-subtitle">{t.blog_subtitle}</p>
          </div>
        </div>
      </div>

      {/* Featured post */}
      {featured && (
        <div className="container">
          <div className="blog-featured">
            <Link to={`/blog/post/${featured.slug}`} className="blog-featured-card">
              <div className="blog-featured-img">
                {featured.featured_image ? (
                  <img src={`/uploads/${featured.featured_image}`} alt="" />
                ) : (
                  <div className="blog-featured-placeholder">
                    <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Featured</span>
                  </div>
                )}
              </div>
              <div className="blog-featured-body">
                <span className="post-category-badge">{lang === 'es' ? featured.category_name_es : featured.category_name_en}</span>
                <h2>{lang === 'es' ? featured.title_es : featured.title_en}</h2>
                <p>{(lang === 'es' ? featured.excerpt_es : featured.excerpt_en)?.substring(0, 200)}...</p>
                <div className="post-card-meta">
                  <span>{formatDate(featured.published_at)}</span> · <span>{featured.views} {t.blog_views}</span>
                </div>
                <span className="blog-featured-cta">
                  {t.blog_read_more} <FaArrowRight size={12} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="container">
        <div className="blog-layout">
          <main className="blog-content">
            <h2 className="blog-section-heading">{t.blog_more_posts}</h2>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" />
              </div>
            ) : posts.length > 0 ? (
              <div className="posts-list">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            ) : !featured ? (
              <p className="text-center py-5" style={{ color: 'var(--text-muted)' }}>{t.blog_no_posts}</p>
            ) : null}
          </main>
          <BlogSidebar />
        </div>
      </div>
      <BlogFooter />
    </div>
  );
}
