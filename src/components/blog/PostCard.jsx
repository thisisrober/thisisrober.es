import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export default function PostCard({ post }) {
  const { t, lang } = useTranslation();

  const title = lang === 'es' ? post.title_es : post.title_en;
  const excerpt = lang === 'es' ? post.excerpt_es : post.excerpt_en;
  const category = lang === 'es' ? post.category_name_es : post.category_name_en;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Link to={`/blog/post/${post.slug}`} className="post-card d-flex gap-3">
      {post.featured_image ? (
        <img src={`/uploads/${post.featured_image}`} alt={title} className="post-card-image" />
      ) : (
        <div className="post-card-image post-card-placeholder">
          <span>{t.blog_no_image}</span>
        </div>
      )}
      <div className="post-card-body flex-grow-1">
        <span className="post-category-badge">{category}</span>
        <h3 className="post-card-title">{title}</h3>
        <p className="post-card-excerpt">{excerpt?.substring(0, 150)}...</p>
        <div className="post-card-meta">
          <span>{formatDate(post.published_at)}</span> · <span>{post.views} {t.blog_views}</span>
        </div>
      </div>
    </Link>
  );
}
