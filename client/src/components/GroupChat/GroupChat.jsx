// src/components/GroupChat/GroupChat.jsx
import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import http from '../../api/http';
import './GroupChat.css';

export default function GroupChat({
  groupId,
  canChat,        // האם מותר לכתוב (חבר קבוצה / בעלים)
  currentUserId,  // מזהה המשתמש – בשביל לסמן הודעות "שלי"
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState(null); // לאיזה הודעה התפריט פתוח
  const [editingId, setEditingId] = useState(null);      // id של הודעה שבעריכה
  const messagesEndRef = useRef(null);

  // גלילה למטה בכל שינוי הודעות
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // טעינת הודעות ראשונית + polling כל 5 שניות
  useEffect(() => {
    if (!groupId) return;

    let isCancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await http.get(`/groups/${groupId}/chat`);
        if (!isCancelled) {
          setMessages(Array.isArray(data) ? data : data.messages || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('failed to fetch chat messages', err);
          setError('שגיאה בטעינת ההודעות');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !groupId || !canChat) return;

    try {
      setSending(true);
      setError('');

      // מצב עריכה – PATCH
      if (editingId) {
        const { data } = await http.patch(`/groups/${groupId}/chat/${editingId}`, {
          text: text.trim(),
        });

        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.messages) {
          setMessages(data.messages);
        } else {
          // fallback – עדכון מקומי
          setMessages((prev) =>
            prev.map((m) =>
              (m._id || m.id) === editingId ? { ...m, text: text.trim(), deleted: false } : m
            )
          );
        }

        setEditingId(null);
        setText('');
        return;
      }

      // הודעה חדשה
      const { data } = await http.post(`/groups/${groupId}/chat`, {
        text: text.trim(),
      });

      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.messages) {
        setMessages(data.messages);
      }

      setText('');
    } catch (err) {
      console.error('failed to send chat message', err);
      setError('שגיאה בשליחת ההודעה');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!messageId || !groupId) return;
    if (!window.confirm('למחוק את ההודעה?')) return;

    try {
      setSending(true);
      setError('');
      const { data } = await http.delete(`/groups/${groupId}/chat/${messageId}`);

      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data.messages) {
        setMessages(data.messages);
      } else {
        // fallback – לא מוחקים מהמסך, רק מסמנים כמחוק
        setMessages((prev) =>
          prev.map((m) =>
            (m._id || m.id) === messageId
              ? { ...m, deleted: true, text: 'הודעה נמחקה' }
              : m
          )
        );
      }

      if (editingId === messageId) {
        setEditingId(null);
        setText('');
      }
    } catch (err) {
      console.error('failed to delete chat message', err);
      setError('שגיאה במחיקת ההודעה');
    } finally {
      setSending(false);
      setMenuOpenFor(null);
    }
  };

  const handleStartEdit = (msg) => {
    const id = msg._id || msg.id;
    setEditingId(id);
    setText(msg.text || '');
    setMenuOpenFor(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="group-chat">
      <div className="group-chat-header">
        {!canChat && (
          <span className="group-chat-note">
            ניתן לקרוא הודעות בלבד. רק חברי קבוצה יכולים לכתוב.
          </span>
        )}
      </div>

      <div className="group-chat-body">
        {loading && messages.length === 0 && (
          <div className="group-chat-status">טוען הודעות…</div>
        )}

        {error && <div className="group-chat-error">{error}</div>}

        {!loading && messages.length === 0 && !error && (
          <div className="group-chat-status">אין הודעות עדיין. אפשר להתחיל את השיחה 🙂</div>
        )}

        <div className="group-chat-messages">
          {messages.map((msg) => {
            const id = msg._id || msg.id;

            const isMine =
              currentUserId &&
              (msg.userId === currentUserId || String(msg.userId) === String(currentUserId));

            const isDeleted = !!msg.deleted;

            const displayName = msg.senderName || msg.senderEmail || 'משתתף';

            // אווטאר מגיע רק מהשרת
            const avatarUrl =
              msg.senderAvatar ||
              msg.avatarUrl ||
              (msg.sender && (msg.sender.avatar || msg.sender.avatarUrl)) ||
              null;

            const textToShow = isDeleted ? 'הודעה נמחקה' : (msg.text || '');
            const initial = displayName ? displayName.trim().charAt(0) : '?';

            return (
              <div
                key={id}
                className={`group-chat-message-row ${isMine ? 'mine' : 'theirs'}`}
              >
                {/* הבלון של ההודעה */}
                <div
                  className={`group-chat-message ${isMine ? 'mine' : 'theirs'} ${
                    isDeleted ? 'deleted' : ''
                  }`}
                >
                  <div className="group-chat-message-header">
                    <span className="group-chat-sender">
                      {displayName}
                    </span>

                    <div className="group-chat-header-right">
                      <span className="group-chat-time">{formatTime(msg.createdAt)}</span>

                      {/* תפריט שלוש נקודות – רק על הודעות שלי שלא נמחקו */}
                      {isMine && !isDeleted && (
                        <div className="group-chat-menu-wrapper">
                          <button
                            type="button"
                            className="group-chat-menu-toggle"
                            onClick={() =>
                              setMenuOpenFor((prev) => (prev === id ? null : id))
                            }
                            title="אפשרויות"
                          >
                            <FiMoreVertical size={14} />
                          </button>

                          {menuOpenFor === id && (
                            <div className="group-chat-menu">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                              >
                                עריכה
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(id)}
                              >
                                מחיקה
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="group-chat-text">{textToShow}</div>
                </div>

                {/* אווטאר בצד ההודעה – רק של אחרים */}
                {!isMine && (
                  <div className="group-chat-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} />
                    ) : (
                      <div className="group-chat-avatar-fallback">
                        {initial}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {editingId && (
        <div className="group-chat-edit-bar">
          <span>עורך/ת הודעה</span>
          <button type="button" onClick={handleCancelEdit}>
            ביטול
          </button>
        </div>
      )}

      <form className="group-chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={canChat ? 'הקלד/י הודעה…' : 'אין לך הרשאה לכתוב בצ׳אט'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canChat || sending}
        />
        <button type="submit" disabled={!canChat || sending || !text.trim()}>
          {editingId ? 'עדכן' : 'שלח'}
        </button>
      </form>
    </div>
  );
}
