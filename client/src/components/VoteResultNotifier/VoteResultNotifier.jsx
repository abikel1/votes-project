import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
    fetchMyFinishedVotedGroups,
    selectFinishedVotedGroups,
} from '../../slices/votesSlice';

import './VoteResultNotifier.css';

// מפתח ייחודי למשתמש (כדי להפריד בין משתמשים שונים באותו דפדפן)
const makeUserKey = (userId, email) => {
    if (userId) return `id:${String(userId)}`;
    if (email) return `email:${String(email).trim().toLowerCase()}`;
    return null;
};

// קריאת רשימת קבוצות שהמשתמש כבר ראה עבורן פופ־אפ
function loadNotifiedGroups(userKey) {
    if (!userKey) return new Set();
    try {
        const raw = localStorage.getItem(`winnerNotifiedGroups_${userKey}`);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) return new Set(arr.map(String));
        return new Set();
    } catch {
        return new Set();
    }
}

// כתיבת הרשימה ל־localStorage
function saveNotifiedGroups(userKey, set) {
    if (!userKey) return;
    try {
        localStorage.setItem(
            `winnerNotifiedGroups_${userKey}`,
            JSON.stringify(Array.from(set || [])),
        );
    } catch {
        // לא מפילים את האפליקציה :)
    }
}

/**
 * פופ־אפ גלובלי: "ההצבעה הסתיימה ויש זוכה"
 * ➤ לכל משתמש: פעם אחת לכל קבוצה שהוא הצביע בה.
 */
export default function VoteResultNotifier() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const finishedGroups = useSelector(selectFinishedVotedGroups);
    const userId = useSelector((s) => s.auth.userId);
    const userEmail = useSelector((s) => s.auth.userEmail);
    const isAuthed = !!userId || !!userEmail;

    const userKey = makeUserKey(userId, userEmail);

    const [notifiedSet, setNotifiedSet] = useState(new Set());
    const [currentGroup, setCurrentGroup] = useState(null);

    // טעינת סט הקבוצות שנצפו מה־localStorage כשמשתמש משתנה
    useEffect(() => {
        if (!isAuthed || !userKey) {
            setNotifiedSet(new Set());
            setCurrentGroup(null);
            return;
        }
        setNotifiedSet(loadNotifiedGroups(userKey));
    }, [isAuthed, userKey]);

    // טעינת קבוצות שהסתיימו והמשתמש הצביע בהן
    useEffect(() => {
        if (!isAuthed) return;
        dispatch(fetchMyFinishedVotedGroups());
    }, [dispatch, isAuthed]);

    // בחירת קבוצה אחת שלא קיבלה עדיין פופ־אפ עבור *המשתמש הזה*
    useEffect(() => {
        if (!isAuthed) return;
        if (!finishedGroups.length) return;

        const candidate = finishedGroups.find((g) => {
            const gid = String(g.groupId);

            // ✅ אם יש שדה votedByMe – נסנן לפיו.
            // ✅ אם אין שדה כזה – נניח true (כלומר ה־API כבר החזיר רק קבוצות שהמשתמש הצביע בהן).
            const votedFlag = Object.prototype.hasOwnProperty.call(g, 'votedByMe')
                ? g.votedByMe === true
                : true;

            return votedFlag && !notifiedSet.has(gid);
        });

        if (candidate) {
            setCurrentGroup(candidate);
        } else {
            setCurrentGroup(null);
        }
    }, [finishedGroups, notifiedSet, isAuthed]);

    // אם אין קבוצה להציג – לא מציגים כלום
    if (!currentGroup) return null;

    const gid = String(currentGroup.groupId);

    // 👇 מציגים את *כל* הזוכים (למקרה של תיקו, כמה זוכים וכו')
    const winnerNames =
        (currentGroup.winners || [])
            .filter((w) => w && w.name)
            .map((w) => w.name)
            .join(', ');

    const markNotifiedAndClose = () => {
        const next = new Set(notifiedSet);
        next.add(gid);
        setNotifiedSet(next);
        saveNotifiedGroups(userKey, next);
        setCurrentGroup(null);
    };

    const goToGroup = () => {
        const next = new Set(notifiedSet);
        next.add(gid);
        setNotifiedSet(next);
        saveNotifiedGroups(userKey, next);

        setCurrentGroup(null);

        const slug = currentGroup.groupSlug || gid;
        navigate(`/groups/${slug}`, {
            state: { groupId: gid },
        });
    };

    return (
        <div className="vote-result-overlay">
            <div className="vote-result-modal">
                <h2 className="vote-result-title">
                    {t('votes.results.modalTitle', 'ההצבעה הסתיימה!')}
                </h2>

                <p className="vote-result-text">
                    {t('votes.results.modalText', {
                        defaultValue: 'ההצבעה בקבוצה "{{name}}" הסתיימה ויש זוכה 🎉',
                        name: currentGroup.groupName || '',
                    })}
                </p>

                {winnerNames && (
                    <p className="vote-result-winners">
                        {t('votes.results.winnersLabel', 'זוכה/ים:')} {winnerNames}
                    </p>
                )}

                <div className="vote-result-actions">
                    <button
                        className="vote-result-btn primary"
                        onClick={goToGroup}
                    >
                        {t('votes.results.seeWinnerButton', 'מעבר לדף הקבוצה')}
                    </button>
                    <button
                        className="vote-result-btn secondary"
                        onClick={markNotifiedAndClose}
                    >
                        {t('votes.results.closeButton', 'סגור')}
                    </button>
                </div>
            </div>
        </div>
    );
}
