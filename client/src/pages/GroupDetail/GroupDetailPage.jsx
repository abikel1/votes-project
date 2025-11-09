  import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const groups = useSelector(selectGroupsWithOwnership);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    const group = groups.find(g => g._id === groupId);

    if (!group) return <div>טוען...</div>;

    return (
        <div className="page-wrap">
            <h2>{group.name}</h2>
            <p>{group.description}</p>

            <div>
                <small>נוצר:</small> {group.creationDate}<br/>
                <small>סיום:</small> {group.endDate}
            </div>

            {/* כפתור לחדר ההצבעה */}
            <button onClick={() => navigate(`/groups/${groupId}/candidates`)}>
                ללכת להצבעה
            </button>
        </div>
    );
}
