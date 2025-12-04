// src/pages/GroupSettingsPage/MemberRow.jsx
import { useTranslation } from 'react-i18next';

export default function MemberRow({ m, onRemove, isOwner }) {
  const { t, i18n } = useTranslation();

  const phone = m.phone || m.phoneNumber || m.mobile || m.mobilePhone;
  const role = m.role || m.roleName || m.type;

  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString(
        i18n.language === 'he' ? 'he-IL' : 'en-GB'
      );
    } catch {
      return iso;
    }
  };

  const created = formatDate(m.createdAt);
  const joined = formatDate(m.joinedAt);

  const displayName =
    m.name || m.email || m._id || t('members.noName');

  return (
    <li className="row">
      <div className="row-main">
        <div className="title">{displayName}</div>
        <div className="sub">
          {m.email ? `${m.email}` : ''}
          {phone ? ` · ${phone}` : ''}
          {role ? ` · ${role}` : ''}
          {created ? ` · ${t('members.created')}: ${created}` : ''}
          {joined ? ` · ${t('members.joined')}: ${joined}` : ''}
        </div>
      </div>
      {isOwner && onRemove && (
        <div className="row-actions">
          <button className="small danger" onClick={onRemove}>
            {t('members.remove')}
          </button>
        </div>
      )}
    </li>
  );
}
