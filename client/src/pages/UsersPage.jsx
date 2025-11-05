import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../features/users/usersSlice';

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(s => s.users);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h3>כל המשתמשים</h3>
      <ul>
        {list.map(u => <li key={u._id}>{u.name} — {u.email}</li>)}
      </ul>
    </div>
  );
}
