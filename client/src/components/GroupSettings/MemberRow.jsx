// src/pages/GroupSettingsPage/MemberRow.jsx
export default function MemberRow({ m, onRemove, isOwner }) {
  const phone = m.phone || m.phoneNumber || m.mobile || m.mobilePhone;
  const role = m.role || m.roleName || m.type;
  const created = m.createdAt ? new Date(m.createdAt).toLocaleDateString('he-IL') : null;
  const joined = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('he-IL') : null;

  return (
    <li className="row">
      <div className="row-main">
        <div className="title">{m.name || m.email || m._id || '(ללא שם)'}</div>
        <div className="sub">
          {m.email ? `${m.email}` : ''}
          {phone ? ` · ${phone}` : ''}
          {role ? ` · ${role}` : ''}
          {created ? ` · נוצר: ${created}` : ''}
          {joined ? ` · הצטרף: ${joined}` : ''}
        </div>
      </div>
      {isOwner && onRemove && (
        <div className="row-actions">
          <button className="small danger" onClick={onRemove}>
 הסרה
          </button>
        </div>
      )}
    </li>
  );
}
