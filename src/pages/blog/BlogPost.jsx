import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import BlogHeader from '../../components/blog/BlogHeader';
import BlogFooter from '../../components/blog/BlogFooter';
import ImageLightbox from '../../components/blog/ImageLightbox';

export default function BlogPost() {
  const { slug } = useParams();
  const { t, lang } = useTranslation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'thisisrober - Blog'; }, []);

  const fmtViews = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(n);
  };

  useEffect(() => {
    api.get(`/blog/posts/${slug}`).then(res => {
      setPost(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div className="blog-page">
      <BlogHeader />
      <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
    </div>
  );

  if (!post) return (
    <div className="blog-page">
      <BlogHeader />
      <div className="container text-center py-5">
        <h2>Post not found</h2>
        <Link to="/blog" className="btn-accent mt-3 d-inline-flex">{t.blog_back}</Link>
      </div>
    </div>
  );

  const title = lang === 'es' ? post.title_es : post.title_en;
  const content = lang === 'es' ? post.content_es : post.content_en;
  const category = lang === 'es' ? post.category_name_es : post.category_name_en;
  const htmlContent = marked(content || '');

  return (
    <div className="blog-page">
      <BlogHeader />
      <article className="post-single container">
        <nav className="breadcrumb-nav mb-4">
          <Link to="/blog">Blog</Link>
          <span className="mx-2">›</span>
          <Link to={`/blog/category/${post.category_slug}`}>{category}</Link>
          <span className="mx-2">›</span>
          <span style={{ color: 'var(--text-muted)' }}>{title}</span>
        </nav>

        <header className="post-single-header">
          <Link to={`/blog/category/${post.category_slug}`} className="post-category-badge mb-2 d-inline-block">{category}</Link>
          <h1 className="post-single-title">{title}</h1>
          <div className="post-single-meta">
            <span>{formatDate(post.published_at)}</span>
            <span>·</span>
            <span>{fmtViews(post.views)} {t.blog_views}</span>
            <span>·</span>
            <span className="d-inline-flex align-items-center gap-1">
              <img src="/img/blog-header.png" alt={post.author} width="20" height="20" className="rounded-circle" style={{ objectFit: 'cover', flexShrink: 0 }} />
              {post.author}
            </span>
          </div>
        </header>

        {post.featured_image && (
          <img src={`/uploads/${post.featured_image}`} alt={title} className="post-single-image" />
        )}

        <div className="post-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
      <ImageLightbox />
      <BlogFooter />
    </div>
  );
}
