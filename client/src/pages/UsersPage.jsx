import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../slices/usersSlice';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(s => s.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div>{t('users.loading')}</div>;
  if (error) return <div style={{ color: 'red' }}>{t('users.error', { error })}</div>;

  return (
    <div>
      <h3>{t('users.title')}</h3>
      <ul>
        {list.map(u => (
          <li key={u._id}>
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
