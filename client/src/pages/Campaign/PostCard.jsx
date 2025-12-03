// src/components/Campaign/PostCard.jsx
import { useState } from 'react';
import { FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { getYoutubeEmbedUrl } from '../../utils/youtubeHelper';
import './PostCard.css';

export default function PostCard({
  post,
  campaignId,
  currentUserId,
  isCandidateOwner,
  isEditMode,
  onDeletePost,
  onAddComment,
  onDeleteComment,
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const youtubeEmbedUrl = post.youtubeUrl
    ? getYoutubeEmbedUrl(post.youtubeUrl)
    : null;

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await onAddComment(campaignId, post._id, newComment);
      setNewComment('');
    } catch (err) {
      console.error('שגיאה בהוספת תגובה:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('למחוק תגובה זו?')) return;
    try {
      await onDeleteComment(campaignId, post._id, commentId);
    } catch (err) {
      console.error('שגיאה במחיקת תגובה:', err);
    }
  };

  return (
    <div className="post-card">
      {/* כותרת */}
      <div className="post-header">
        <h4>{post.title}</h4>
        {isCandidateOwner && isEditMode && (
          <button
            onClick={() => onDeletePost(post._id)}
            className="post-delete-btn"
            title="מחק פוסט"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      {/* תוכן */}
      <p className="post-content">{post.content}</p>

      {/* תמונה */}
      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt={post.title} className="post-image" />
        </div>
      )}

      {/* YouTube */}
      {youtubeEmbedUrl && (
        <div className="post-youtube-container">
          <iframe
            src={youtubeEmbedUrl}
            title={post.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="post-youtube-iframe"
          />
        </div>
      )}

      {/* פוטר עם כפתור תגובות */}
      <div className="post-footer">
        <button
          className="post-comments-toggle"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageSquare size={18} />
          <span>
            {post.comments?.length || 0} תגובות
          </span>
        </button>
      </div>

      {/* תגובות */}
      {showComments && (
        <div className="post-comments-section">
          {/* טופס הוספת תגובה */}
          {currentUserId && (
            <div className="comment-form">
              <textarea
                placeholder="כתוב תגובה..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                disabled={submittingComment}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
                className="comment-submit-btn"
              >
                {submittingComment ? 'שולח...' : 'שלח'}
              </button>
            </div>
          )}

          {/* רשימת תגובות */}
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    {comment.user?.photoUrl && (
                      <img
                        src={comment.user.photoUrl}
                        alt={comment.user.name}
                        className="comment-avatar"
                      />
                    )}
                    <div className="comment-meta">
                      <span className="comment-author">
                        {comment.user?.name || 'משתמש'}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>

                    {/* מחיקת תגובה - רק אם זה המשתמש שכתב או בעל הקמפיין */}
                    {(currentUserId === comment.user?._id || isCandidateOwner) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="comment-delete-btn"
                        title="מחק תגובה"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="empty-comments">אין תגובות עדיין</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}