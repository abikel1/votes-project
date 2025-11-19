// src/pages/GroupSettingsPage/MembersTab.jsx
import MemberRow from './MemberRow';

export default function MembersTab({
  group,
  enrichedMembers,
  isOwner,
  onRemoveMember,
}) {
  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">משתתפי הקבוצה</summary>
        <div className="acc-body">
          {!enrichedMembers?.length ? (
            <div className="muted">אין משתתפים עדיין.</div>
          ) : (
            <ul className="list">
              {enrichedMembers.map((m) => {
                const mid = String(m._id || m.id);
                const removable =
                  isOwner && String(group.createdById) !== mid;
                const onRemove = removable
                  ? () => onRemoveMember(m, mid)
                  : undefined;

                return (
                  <MemberRow
                    key={mid}
                    m={m}
                    onRemove={onRemove}
                    isOwner={isOwner}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
