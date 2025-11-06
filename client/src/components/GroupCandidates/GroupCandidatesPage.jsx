// client/src/pages/GroupCandidatesPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import http from '../../api/http'; // ✅ נתיב נכון מהעמוד הזה

export default function GroupCandidatesPage() {
    const { groupId } = useParams();
    const [cands, setCands] = useState([]);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const [gRes, cRes] = await Promise.all([
                    http.get(`/groups/${groupId}`),
                    http.get(`/candidates/group/${groupId}`),
                ]);
                setGroup(gRes.data);
                setCands(Array.isArray(cRes.data) ? cRes.data : []);
            } catch (e) {
                console.error('Error loading group/candidates:', e); // ✅
                setErr(e?.response?.data?.message || 'Failed to load candidates');
            } finally {
                setLoading(false);
            }
        })();
    }, [groupId]);

    if (loading) return <div style={{ padding: 16 }}>טוען מועמדים…</div>;
    if (err) return <div style={{ padding: 16, color: 'crimson' }}>{err}</div>;

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Link to="/groups" style={{ textDecoration: 'none' }}>← חזרה לקבוצות</Link>
                <h2 style={{ margin: 0 }}>{group?.name || 'מועמדים'}</h2>
            </div>

            {cands.length === 0 ? (
                <div>אין מועמדים בקבוצה הזו.</div>
            ) : (
                <div style={grid}>
                    {cands.map(c => (
                        <div key={c._id} style={card}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {c.photoUrl ? (
                                    <img src={c.photoUrl} alt={c.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                                ) : (
                                    <div style={avatar}>{(c.symbol || c.name || '?').slice(0, 2).toUpperCase()}</div>
                                )}
                                <div>
                                    <h3 style={{ margin: '6px 0 4px' }}>{c.name}</h3>
                                    {c.symbol && <div style={{ opacity: .8 }}>סמל: <b>{c.symbol}</b></div>}
                                </div>
                            </div>

                            {c.description && <p style={{ margin: '10px 0 0', color: '#444' }}>{c.description}</p>}

                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={chip}>קולות: {c.votesCount ?? 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 };
const card = { border: '1px solid #e6e6e6', borderRadius: 14, padding: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', background: '#fff' };
const avatar = { width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #eee', background: '#f7f7f7', fontWeight: 700 };
const chip = { background: '#f6f6f6', border: '1px solid #e2e2e2', borderRadius: 999, padding: '4px 10px', fontSize: 12 };
