import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';
import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup
} from '../../slices/candidateSlice';
import './GroupDetailPage.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#06b6d4', '#6366f1', '#84cc16'
];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const groups = useSelector(selectGroupsWithOwnership);
  const candidates = useSelector(selectCandidatesForGroup(groupId));
  const loadingCandidates = useSelector(selectCandidatesLoadingForGroup(groupId));
  const errorCandidates = useSelector(selectCandidatesErrorForGroup(groupId));

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

  const group = groups.find(g => g._id === groupId);
  
  if (!group) {
    return <div className="loading-wrap">טוען נתונים...</div>;
  }

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  // נתונים לגרף Pie
  const pieData = candidates
    .filter(c => c.votesCount > 0)
    .map(c => ({
      name: c.name,
      value: c.votesCount || 0
    }));

  // נתונים לגרף Bar
  const barData = sortedCandidates.map(c => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
    votesCount: c.votesCount || 0
  }));

  return (
    <div className="page-wrap dashboard">
      <h2 className="page-title">{group.name}</h2>
      <p className="group-description">{group.description}</p>

      <div className="meta-and-box">
        {/* מידע על הקבוצה */}
        <div className="group-meta">
          <div>
            <span className="meta-label">📅 תאריך יצירה:</span>
            <span className="meta-value">{group.creationDate}</span>
          </div>
          <div>
            <span className="meta-label">⏰ תאריך סיום:</span>
            <span className="meta-value">{group.endDate}</span>
          </div>
          <div>
            <span className="meta-label">🗳️ סך הצבעות:</span>
            <span className="meta-value">{totalVotes}</span>
          </div>
        </div>
      </div>

      <button 
        className="vote-btn" 
        onClick={() => navigate(`/groups/${groupId}/candidates`)}
      >
        🗳️ לכו להצביע עכשיו
      </button>

      {loadingCandidates && (
        <p className="loading-wrap">טוען מועמדים...</p>
      )}
      
      {errorCandidates && (
        <p className="err">❌ שגיאה: {errorCandidates}</p>
      )}

      {/* כרטיסי מועמדים */}
      {!loadingCandidates && candidates.length > 0 && (
        <>
          <h3 className="section-title">המועמדים</h3>
          <div className="candidates-grid">
            {sortedCandidates.map((c, idx) => (
              <div 
                key={c._id} 
                className={`candidate-card ${idx === 0 && totalVotes > 0 ? 'leader' : ''}`}
              >
                {idx === 0 && totalVotes > 0 && (
                  <div className="current-leader">🏆</div>
                )}
                
                {c.photoUrl ? (
                  <img 
                    src={c.photoUrl} 
                    alt={c.name} 
                    className="candidate-photo" 
                  />
                ) : (
                  <div className="candidate-photo" style={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    color: '#4338ca'
                  }}>
                    👤
                  </div>
                )}
                
                <h4>{c.name}</h4>
                
                {c.symbol && (
                  <span className="candidate-symbol">{c.symbol}</span>
                )}
                
                {c.description && <p>{c.description}</p>}
                
                <div className="votes-count">
                  {c.votesCount || 0} קולות
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* גרפים */}
      {!loadingCandidates && candidates.length > 0 && totalVotes > 0 && (
        <div className="charts">
          {/* גרף עוגה */}
          <div className="pie-chart-container">
            <h3>📊 אחוזי הצבעה</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} קולות`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* גרף עמודות */}
          <div className="bar-chart-container">
            <h3>📈 מספר קולות לכל מועמד</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value} קולות`}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="votesCount" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loadingCandidates && candidates.length === 0 && (
        <div className="loading-wrap">
          <p>אין מועמדים זמינים כרגע</p>
        </div>
      )}
    </div>
  );
}