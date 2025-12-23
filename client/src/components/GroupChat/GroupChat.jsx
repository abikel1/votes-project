import React from 'react';

import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiSmile, FiSend } from 'react-icons/fi';
import { io } from 'socket.io-client';
import http from '../../api/http';
import EmojiPicker from 'emoji-picker-react';
import './GroupChat.css';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';


const AVATAR_COLORS = [
    '#4f46e5',
    '#2563eb',
    '#0d9488',
    '#16a34a',
    '#ca8a04',
    '#db2777',
    '#ea580c',
    '#7c3aed',
    '#0ea5e9',
    '#059669',
];

function getColorForUser(key) {
    if (!key) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

export default function GroupChat({ groupId, canChat, currentUserId, isOwner }) {
    const { t } = useTranslation();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');           // נשמור KEY, לא טקסט
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const messagesEndRef = useRef(null);

    const [isAtBottom, setIsAtBottom] = useState(true);

    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(''); // גם כאן KEY
    const [moreOpen, setMoreOpen] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);

    const [socket, setSocket] = useState(null);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [messageToDelete, setMessageToDelete] = React.useState(null);

    // גלילה למטה כשמגיעות הודעות ואנחנו בתחתית
    useEffect(() => {
        if (isAtBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAtBottom]);

    // טעינת הודעות ראשוניות ב-HTTP (פעם אחת לכל groupId)
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
                    setError('chat.errors.loadFailed');
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        fetchMessages();

        return () => {
            isCancelled = true;
        };
    }, [groupId]);

    // חיבור Socket.IO והאזנה לאירועים
    useEffect(() => {
        if (!groupId) return;

        const apiBase = http.defaults?.baseURL || window.location.origin;
        const socketBase = apiBase.replace(/\/api\/?$/, '');

        const token = localStorage.getItem('token');

        if (!token) {
            console.warn('Socket: missing token, not connecting');
            return;
        }

        const s = io(socketBase, {
            withCredentials: true,
            auth: { token },
        });

        s.on('connect_error', (err) => {
            console.error('Socket connect_error:', err.message);
        });

        setSocket(s);

        s.on('connect', () => {
            s.emit('join-group-chat', { groupId });
        });

        s.on('chat:new-message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        s.on('chat:message-updated', (msg) => {
            setMessages((prev) =>
                prev.map((m) =>
                    String(m._id || m.id) === String(msg._id) ? msg : m
                )
            );
        });

        s.on('chat:message-deleted', (msg) => {
            setMessages((prev) =>
                prev.map((m) =>
                    String(m._id || m.id) === String(msg._id)
                        ? { ...m, ...msg }
                        : m
                )
            );
        });

        // סיכום AI – עדכון כל ההודעות בזמן אמת לכל מי שבחדר
        s.on('chat:summary-done', ({ summary, messages }) => {
            setMessages(Array.isArray(messages) ? messages : []);
            setSummaryLoading(false);
            setSummaryError('');
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 50);
        });

        return () => {
            s.off('chat:new-message');
            s.off('chat:message-updated');
            s.off('chat:message-deleted');
            s.off('chat:summary-done');
            s.disconnect();
            setSocket(null);
        };
    }, [groupId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !groupId || !canChat) return;
        if (!socket) return;

        setSending(true);
        setError('');

        // עריכת הודעה
        if (editingId) {
            socket.emit(
                'chat:update',
                {
                    groupId,
                    messageId: editingId,
                    text: text.trim(),
                },
                (res) => {
                    if (!res || !res.ok) {
                        setError('chat.errors.updateFailed');
                    }
                    setSending(false);
                }
            );

            setEditingId(null);
            setText('');
            return;
        }

        // הודעה חדשה
        socket.emit(
            'chat:send',
            {
                groupId,
                text: text.trim(),
            },
            (res) => {
                if (!res || !res.ok) {
                    setError('chat.errors.sendFailed');
                }
                setSending(false);
            }
        );

        setText('');
        setIsAtBottom(true);
    };

    const handleDelete = (messageId) => {
        if (!messageId || !groupId) return;
        setMessageToDelete(messageId);
        setConfirmOpen(true);
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

    const handleConfirmDelete = () => {
        if (!messageToDelete || !groupId || !socket) return;

        setSending(true);
        setError('');

        socket.emit(
            'chat:delete',
            { groupId, messageId: messageToDelete },
            (res) => {
                if (!res || !res.ok) {
                    setError(res?.message || 'שגיאה במחיקת ההודעה');
                }
                setSending(false);
                setMenuOpenFor(null);
            }
        );

        if (editingId === messageToDelete) {
            setEditingId(null);
            setText('');
        }

        setConfirmOpen(false);
        setMessageToDelete(null);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setMessageToDelete(null);
    };


    const formatTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const locale = i18n.language?.startsWith('he') ? 'he-IL' : 'en-US';
        return d.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSummarize = () => {
        if (!groupId || !socket) return;

        setSummaryLoading(true);
        setSummaryError('');

        socket.emit(
            'chat:summarize',
            { groupId },
            (res) => {
                if (!res || !res.ok) {
                    setSummaryError('chat.errors.summaryFailed');
                    setSummaryLoading(false);
                }
            }
        );
    };

    const handleSummaryClickFromMenu = () => {
        setMoreOpen(false);
        setShowEmojiPicker(false);
        handleSummarize();
    };

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + (emojiData.emoji || ''));
        setShowEmojiPicker(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="group-chat">
            <div className="group-chat-header-row">
                <div className="group-chat-top-title">{t('chat.title')}</div>
            </div>

            {!canChat && (
                <div className="group-chat-note">
                    {t('chat.readOnlyNote')}
                </div>
            )}

            <div className="group-chat-body">
                {loading && messages.length === 0 && (
                    <div className="group-chat-status">
                        {t('chat.loading')}
                    </div>
                )}

                {error && (
                    <div className="group-chat-error">
                        {t(error)}
                    </div>
                )}
                {summaryError && (
                    <div className="group-chat-error">
                        {t(summaryError)}
                    </div>
                )}

                {!loading && messages.length === 0 && !error && (
                    <div className="group-chat-status">
                        {t('chat.noMessages')}
                    </div>
                )}

                <div
                    className="group-chat-messages"
                    onScroll={(e) => {
                        const el = e.target;
                        const isBottom =
                            el.scrollHeight - el.scrollTop - el.clientHeight < 50;
                        setIsAtBottom(isBottom);
                    }}
                >
                    {messages.map((msg) => {
                        const id = msg._id || msg.id;

                        const isAi =
                            msg.isAi ||
                            msg.senderType === 'ai' ||
                            msg.role === 'assistant' ||
                            msg.senderName === 'AI' ||
                            msg.senderName === 'בינה מלאכותית';

                        const isMineBase =
                            !isAi &&
                            currentUserId &&
                            (msg.userId === currentUserId ||
                                String(msg.userId) === String(currentUserId));

                        const canManageMessage = isOwner || isMineBase;
                        const isDeleted = !!msg.deleted;

                        const displayName = isAi
                            ? 'AI'
                            : msg.senderName || msg.senderEmail || t('chat.participantFallback');

                        const avatarUrl =
                            msg.senderAvatar ||
                            msg.avatarUrl ||
                            (msg.sender &&
                                (msg.sender.avatar || msg.sender.avatarUrl)) ||
                            null;

                        const textToShow = isDeleted
                            ? msg.text || t('chat.messageDeleted')
                            : msg.text || '';

                        const initial = displayName ? displayName.trim().charAt(0) : '?';

                        const colorKey =
                            msg.userId ||
                            msg.senderId ||
                            msg.senderEmail ||
                            msg.senderName ||
                            displayName;

                        const bgColor = getColorForUser(String(colorKey || ''));

                        return (
                            <div
                                key={id}
                                className={`group-chat-message-row ${isMineBase ? 'mine' : 'theirs'
                                    } ${isAi ? 'ai' : ''}`}
                            >
                                <div
                                    className={`group-chat-message ${isMineBase ? 'mine' : 'theirs'
                                        } ${isDeleted ? 'deleted' : ''} ${isAi ? 'ai' : ''}`}
                                >
                                    <div className="group-chat-message-header">
                                        <span className="group-chat-sender">{displayName}</span>

                                        <div className="group-chat-header-right">
                                            <span className="group-chat-time">
                                                {formatTime(msg.createdAt)}
                                            </span>

                                            {canManageMessage && !isDeleted && (
                                                <div className="group-chat-menu-wrapper">
                                                    <button
                                                        type="button"
                                                        className="group-chat-menu-toggle"
                                                        onClick={() =>
                                                            setMenuOpenFor((prev) =>
                                                                prev === id ? null : id
                                                            )
                                                        }
                                                        title={t('chat.menu.optionsTitle')}
                                                    >
                                                        <FiMoreVertical size={14} />
                                                    </button>

                                                    {menuOpenFor === id && (
                                                        <div className="group-chat-menu">
                                                            {!isAi && isMineBase && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStartEdit(msg)}
                                                                >
                                                                    {t('chat.menu.edit')}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(id)}
                                                            >
                                                                {t('chat.menu.delete')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="group-chat-text">{textToShow}</div>
                                </div>

                                {!isMineBase && (
                                    <div className="group-chat-avatar">
                                        {isAi ? (
                                            <div className="group-chat-avatar-ai">AI</div>
                                        ) : avatarUrl ? (
                                            <img src={avatarUrl} alt={displayName} />
                                        ) : (
                                            <div
                                                className="group-chat-avatar-fallback"
                                                style={{ backgroundColor: bgColor }}
                                            >
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
                    <span>{t('chat.editingBar.text')}</span>
                    <button type="button" onClick={handleCancelEdit}>
                        {t('chat.editingBar.cancel')}
                    </button>
                </div>
            )}

            <form className="group-chat-input-row" onSubmit={handleSubmit}>
                <div className="chat-more-wrapper">
                    <button
                        type="button"
                        className="chat-more-btn"
                        onClick={() => {
                            setMoreOpen((prev) => !prev);
                            setShowEmojiPicker(false);
                        }}
                        title={t('chat.moreButton.title')}
                        disabled={!canChat || sending}
                    >
                        +
                    </button>

                    {moreOpen && (
                        <div className="chat-more-menu">
                            <button
                                type="button"
                                onClick={handleSummaryClickFromMenu}
                                disabled={summaryLoading || messages.length === 0}
                            >
                                {summaryLoading
                                    ? t('chat.moreMenu.summarizing')
                                    : t('chat.moreMenu.summary')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="chat-input-shell">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={
                            canChat
                                ? t('chat.input.placeholder')
                                : t('chat.input.readonlyPlaceholder')
                        }
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => {
                            setMoreOpen(false);
                            setShowEmojiPicker(false);
                        }}
                        disabled={!canChat || sending}
                    />

                    <div className="chat-emoji-wrapper">
                        <button
                            type="button"
                            className="chat-emoji-btn"
                            onClick={() => {
                                setShowEmojiPicker((prev) => !prev);
                                setMoreOpen(false);
                            }}
                            title={t('chat.emojiButton.title')}
                            disabled={!canChat || sending}
                        >
                            <FiSmile size={18} />
                        </button>

                        {showEmojiPicker && (
                            <div className="emoji-picker-popover">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    searchPlaceholder={t('chat.emoji.searchPlaceholder')}
                                    previewConfig={{ showPreview: false }}
                                    lazyLoadEmojis
                                />
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="chat-send-btn group-chat-send-btn"
                    disabled={!canChat || sending || !text.trim()}
                    title={t('chat.sendButton.title')}
                >
                    <FiSend size={16} />
                </button>
            </form>

            <ConfirmModal
                open={confirmOpen}
                message={t('chat.confirmDelete')}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

        </div>
    );
}
