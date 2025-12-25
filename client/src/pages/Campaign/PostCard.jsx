import { useState } from 'react';
import { FiTrash2, FiMessageSquare } from 'react-icons/fi';
import './PostCard.css';
import { useSelector } from 'react-redux';
import { selectUsersMap } from '../../slices/usersSlice';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const usersMap = useSelector(selectUsersMap);
  const { t, i18n } = useTranslation();
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

  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      await onDeleteComment(campaignId, post._id, commentToDelete);
    } catch (err) {
      console.error('שגיאה במחיקת תגובה:', err);
    } finally {
      setConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setCommentToDelete(null);
  };

  const commentsCount = post.comments?.length || 0;

  return (
    <div className="post-card">
      <div className="post-header">
        <h4>{post.title}</h4>
        {isCandidateOwner && isEditMode && (
          <button
            onClick={onDeletePost}
            className="post-delete-btn"
            title={t('campaign.posts.deletePostTitle')}
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt={post.title} className="post-image" />
        </div>
      )}

      <div className="post-footer">
        <button
          className="post-comments-toggle"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageSquare size={18} />
          <span>
            {t('campaign.comments.toggleLabel', { count: commentsCount })}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          {currentUserId && (
            <div className="comment-form">
              <textarea
                placeholder={t('campaign.comments.placeholder')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                disabled={submittingComment}
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
                className="comment-submit-btn"
              >

                {submittingComment
                  ? t('campaign.comments.sending')
                  : t('campaign.comments.send')}
              </button>
            </div>
          )}

          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => {
                const userId = comment.user?._id || comment.user;
                const user = comment.user;
                const userFullName = user
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : t('campaign.comments.anonymousUser');
                const dateStr = new Date(comment.createdAt).toLocaleDateString(
                  i18n.language === 'he' ? 'he-IL' : 'en-GB'
                );

                return (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-header">
                      {user?.photoUrl && (
                        <img
                          src={user.photoUrl}
                          alt={userFullName}
                          className="comment-avatar"
                        />
                      )}

                      <div className="comment-meta">
                        <span className="comment-author">{userFullName}</span>
                        <span className="comment-date">{dateStr}</span>
                      </div>

                      {(currentUserId === userId || isCandidateOwner) && (
                        <button
                          onClick={() => confirmDeleteComment(comment._id)}
                          className="comment-delete-btn"
                          title={t('campaign.comments.deleteButtonTitle')}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>

                    <p className="comment-content">{comment.content}</p>
                  </div>
                );
              })
            ) : (
              <div className="empty-comments">{t('campaign.comments.empty')}</div>
            )}
          </div>

          <ConfirmModal
            open={confirmOpen}
            message={t('campaign.comments.confirmDelete')}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      )}
    </div>
  );
}
