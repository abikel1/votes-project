import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../api/http';
import { useTranslation } from 'react-i18next';

const lc = (s) => (s || '').trim().toLowerCase();

export default function JoinGroupPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId, userEmail } = useSelector((s) => s.auth || {});
  const [groupName, setGroupName] = useState('');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const postedOnceRef = useRef(false);

  useEffect(() => {
    postedOnceRef.current = false;
  }, [slug]);

  const loadGroupInfo = useCallback(async () => {
    if (!slug) {
      setGroup(null);
      setGroupName('');
      setError(t('join.errors.groupNotFound'));
      return null;
    }

    try {
      const { data } = await http.get(
        `/groups/slug/${encodeURIComponent(slug)}`
      );
      setGroup(data || null);
      setGroupName(data?.name || '');
      setError('');
      return data;
    } catch (e) {
      const msg =
        e?.response?.data?.message || t('join.errors.groupNotFound');
      setGroup(null);
      setGroupName('');
      setError(msg);
      return null;
    }
  }, [slug, t]);

  const sendJoinRequest = useCallback(
    async (groupIdFromServer) => {
      if (!groupIdFromServer) return;

      if (postedOnceRef.current) return;
      postedOnceRef.current = true;

      setLoading(true);
      setError('');
      setHint('');

      try {
        const { data } = await http.post(`/groups/${groupIdFromServer}/join`);
        setShowSuccess(true);
        if (data?.message && typeof data.message === 'string') {
          setHint(data.message);
        }
      } catch (e) {
        const msg = String(
          e?.response?.data?.message ||
          t('join.errors.sendRequestFailed')
        );

        if (/pending|already.*pending|exists/i.test(msg)) {
          setHint(t('join.hints.alreadyPending'));
          setShowSuccess(true);
        } else if (/already.*member|כבר.*חבר/i.test(msg)) {
          setHint(t('join.hints.alreadyMember'));
          setShowSuccess(true);
        } else if (/not locked|Group is not locked|קבוצה.*פתוחה/i.test(msg)) {
          setHint(t('join.hints.groupOpen'));
          setShowSuccess(true);
        } else {
          setError(msg);
          postedOnceRef.current = false;
        }
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);

      const g = await loadGroupInfo();
      if (!g) {
        setLoading(false);
        return;
      }

      const realGroupId = g._id;
      const loggedIn = !!(userId || userEmail);
      if (!loggedIn) {
        setShowLoginPrompt(true);
        setLoading(false);
        return;
      }

      const myEmailLc = lc(userEmail);
      const createdByEmailLc = lc(
        g.createdBy || g.created_by || g.ownerEmail || g.owner
      );

      const isOwnerByEmail =
        myEmailLc && createdByEmailLc && myEmailLc === createdByEmailLc;

      const isOwnerById =
        userId && g.createdById && String(userId) === String(g.createdById);

      const isOwner = !!(isOwnerByEmail || isOwnerById || g.isOwner);

      if (isOwner) {
        navigate(`/groups/${encodeURIComponent(slug)}`, {
          replace: true,
          state: { groupId: realGroupId },
        });
        setLoading(false);
        return;
      }

      try {
        const { data: mem } = await http.get(
          `/groups/${realGroupId}/my-membership`
        );
        if (mem?.member) {
          navigate(`/groups/${encodeURIComponent(slug)}`, {
            replace: true,
            state: { groupId: realGroupId },
          });
          setLoading(false);
          return;
        }
      } catch (err) {
      }

      await sendJoinRequest(realGroupId);
    })();
  }, [userId, userEmail, loadGroupInfo, sendJoinRequest, slug, navigate]);

  const goLogin = () => {
    const redirectPath = `/join/${slug}`;
    const redirect = encodeURIComponent(redirectPath);
    navigate(`/login?redirect=${redirect}`);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    navigate('/groups');
  };

  const cancelAndBack = () => {
    setShowLoginPrompt(false);
    navigate('/groups');
  };

  return (
    <div style={{ padding: 24 }}>
      {loading ? t('join.loading') : null}
      {error ? (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      ) : null}

      {showLoginPrompt && (
        <div className="modal-backdrop" onClick={cancelAndBack}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>
              {t('join.loginModal.title', {
                groupName: groupName || undefined,
              })}
            </h3>
            <div className="muted" style={{ marginBottom: 12 }}>
              {t('join.loginModal.text')}
            </div>
            <div
              className="actions-row"
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="gs-btn-outline"
                type="button"
                onClick={cancelAndBack}
              >
                {t('common.cancel')}
              </button>
              <button className="gs-btn" type="button" onClick={goLogin}>
                {t('auth.login')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-backdrop" onClick={closeSuccess}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>
              {t('join.successModal.title')}
            </h3>
            <div className="muted" style={{ marginBottom: 12 }}>
              {hint || t('join.successModal.defaultHint')}
            </div>
            <div
              className="actions-row"
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="gs-btn"
                type="button"
                onClick={closeSuccess}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
