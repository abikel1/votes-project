import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';
import './GroupDetailPage.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const groups = useSelector(selectGroupsWithOwnership);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    const group = groups.find(g => g._id === groupId);

    if (!group) return <div className="loading-wrap">טוען...</div>;

    // גרף – דמה: נניח שהקבוצה מכילה מערך candidates
    const candidates = group.candidates || [];

    // סך כל ההצבעות
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);

    return (
        <div className="page-wrap">
            <h2 className="page-title">{group.name}</h2>
            <p className="group-description">{group.description}</p>

            <div className="group-meta">
                <div><strong>נוצר:</strong> {group.creationDate}</div>
                <div><strong>סיום:</strong> {group.endDate}</div>
                <div><strong>הצבעות שבוצעו:</strong> {totalVotes}</div>
            </div>

            <button className="vote-btn" onClick={() => navigate(`/groups/${groupId}/candidates`)}>
                ללכת להצבעה
            </button>

            <h3 className="section-title">מועמדים</h3>
            <div className="candidates-grid">
                {candidates.map(c => (
                    <div key={c._id} className="candidate-card">
                        {c.photoUrl && <img src={c.photoUrl} alt={c.name} className="candidate-photo" />}
                        <h4>{c.name}</h4>
                        {c.symbol && <span className="candidate-symbol">{c.symbol}</span>}
                        <p>{c.description}</p>
                        <div className="votes-count">קולות: {c.votesCount}</div>
                    </div>
                ))}
            </div>

            <h3 className="section-title">גרף הצבעות</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={candidates}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votesCount" fill="#4caf50" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
