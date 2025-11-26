// src/components/VoteResultNotifier.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    fetchMyFinishedVotedGroups,
    selectFinishedVotedGroups,
} from '../../slices/votesSlice';
import './VoteResultNotifier.css';

const makeSlug = (name = '') =>
    encodeURIComponent(
        String(name)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-'),
    );

// מפתח ייחודי למשתמש (כדי להפריד בין משתמשים שונים באותו דפדפן)
const makeUserKey = (userId, email) => {
    if (userId) return `id:${String(userId)}`;
    if (email) return `email:${String(email).trim().toLowerCase()}`;
    return null;
};

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
 * פופ-אפ גלובלי: "ההצבעה הסתיימה ויש זוכה"
 * כל משתמש רואה פעם אחת לכל קבוצה (על בסיס userId/email).
 */
export default function VoteResultNotifier() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const finishedGroups = useSelector(selectFinishedVotedGroups);
    const userId = useSelector((s) => s.auth.userId);
    const userEmail = useSelector((s) => s.auth.userEmail);
    const isAuthed = !!userId || !!userEmail;

    const userKey = makeUserKey(userId, userEmail);

    const [notifiedSet, setNotifiedSet] = useState(new Set());
    const [currentGroup, setCurrentGroup] = useState(null);

    // טעינת המידע מה־localStorage כשמשתמש מתחלף / נכנס
    useEffect(() => {
        if (!isAuthed || !userKey) {
            setNotifiedSet(new Set());
            setCurrentGroup(null);
            return;
        }
        setNotifiedSet(loadNotifiedGroups(userKey));
    }, [isAuthed, userKey]);

    // טעינה ראשונית מהשרת כשיש משתמש מחובר
    useEffect(() => {
        if (!isAuthed) return;
        dispatch(fetchMyFinishedVotedGroups());
    }, [dispatch, isAuthed]);

    // לבחור קבוצה אחת שלא קיבלה עדיין פופ-אפ עבור *המשתמש הזה*
    useEffect(() => {
        if (!isAuthed) return;
        if (!finishedGroups.length) return;

        const candidate = finishedGroups.find((g) => {
            const gid = String(g.groupId);
            return !notifiedSet.has(gid);
        });

        if (candidate) setCurrentGroup(candidate);
    }, [finishedGroups, notifiedSet, isAuthed]);

    // סגירה אוטומטית כשמגיעים לדף פרטי הקבוצה
    useEffect(() => {
        if (!currentGroup) return;
        const gid = String(currentGroup.groupId);
        const slug = makeSlug(currentGroup.groupName || gid);
        const expectedPath = `/groups/${slug}`;

        if (location.pathname === expectedPath) {
            const next = new Set(notifiedSet);
            next.add(gid);
            setNotifiedSet(next);
            saveNotifiedGroups(userKey, next);
            setCurrentGroup(null);
        }
    }, [location.pathname, currentGroup, notifiedSet, userKey]);

    if (!currentGroup) return null;

    const gid = String(currentGroup.groupId);
    const slug = makeSlug(currentGroup.groupName || gid);

    const winnersNames =
        (currentGroup.winners || [])
            .map((w) => w.name)
            .filter(Boolean)
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

                {winnersNames && (
                    <p className="vote-result-winners">
                        {t('votes.results.winnersLabel', 'זוכה/ים:')} {winnersNames}
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
