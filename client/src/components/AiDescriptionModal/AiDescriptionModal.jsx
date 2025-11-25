import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import http from '../../api/http';
import './AiDescriptionModal.css';

export default function AiDescriptionModal({
    isOpen,
    groupName,
    onApply,
    onClose,
}) {
    const [aiHint, setAiHint] = useState('');
    const [aiDraft, setAiDraft] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAiHint('');
            setAiDraft('');
            setAiLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (aiLoading) return;
        onClose();
    };

    const generateAiDescription = async () => {
        if (!groupName.trim()) {
            toast.error('קודם צריך למלא שם קבוצה');
            return;
        }

        try {
            setAiLoading(true);
            const { data } = await http.post('/groups/ai-description', {
                name: groupName,
                hint: aiHint,
            });

            if (!data || !data.description) {
                toast.error('לא התקבל תיאור מה-AI');
                return;
            }

            setAiDraft(data.description);
            toast.success('נוצר תיאור מוצע');
        } catch (err) {
            console.error('AI description error', err);
            toast.error(
                err?.response?.data?.message || 'שגיאה ביצירת תיאור אוטומטי'
            );
        } finally {
            setAiLoading(false);
        }
    };

    const applyAiDescription = () => {
        if (!aiDraft.trim()) return;
        onApply(aiDraft);
        toast.success('התיאור עודכן מה-AI');
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div
                className="modal ai-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ai-modal-header">
                    <div className="ai-modal-icon">
                        <span className="ai-icon-emoji">✨</span>
                    </div>
                    <div>
                        <h3>עזרה בכתיבת תיאור (AI)</h3>
                        <p className="ai-modal-subtitle">
                            המערכת תשתמש בשם הקבוצה וההנחיה שלך ויציע תיאור קצר וברור
                            (2–4 שורות).
                        </p>
                    </div>
                </div>

                <label className="cg-label" style={{ marginTop: 4 }}>
                    מה חשוב לך שיהיה בתיאור?
                    <input
                        className="cg-input"
                        type="text"
                        placeholder="לא חובה – אפשר להשאיר ריק"
                        value={aiHint}
                        onChange={(e) => setAiHint(e.target.value)}
                    />
                </label>

                <button
                    type="button"
                    className="cg-btn ai-generate-btn"
                    onClick={generateAiDescription}
                    disabled={aiLoading || !groupName.trim()}
                >
                    {aiLoading ? 'יוצר תיאור…' : 'יצירת הצעה'}
                </button>

                {aiDraft && (
                    <div className="ai-preview-block">
                        <div className="cg-ai-preview-label">תיאור מוצע:</div>
                        <textarea
                            className="cg-input cg-ai-preview"
                            rows={4}
                            readOnly
                            value={aiDraft}
                        />
                    </div>
                )}

                <div className="actions-row ai-actions-row">
                    <button
                        className="gs-btn"
                        type="button"
                        onClick={applyAiDescription}
                        disabled={!aiDraft.trim()}
                    >
                        השתמש בתיאור
                    </button>
                    <button
                        className="cg-btn-outline"
                        type="button"
                        onClick={handleBackdropClick}
                    >
                        סגירה
                    </button>
                </div>
            </div>
        </div>
    );
}
