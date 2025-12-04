// src/pages/GroupSettingsPage/MembersTab.jsx
import MemberRow from './MemberRow';
import { useTranslation } from 'react-i18next';

export default function MembersTab({
  group,
  enrichedMembers,
  isOwner,
  onRemoveMember,
}) {
  const { t } = useTranslation();

  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">
          {t('members.title')}
        </summary>
        <div className="acc-body">
          {!enrichedMembers?.length ? (
            <div className="muted">
              {t('members.empty')}
            </div>
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
