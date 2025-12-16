// src/pages/GroupSettingsPage/GeneralTab.jsx
import { useTranslation } from 'react-i18next';
import { LuCopy } from "react-icons/lu";

export default function GeneralTab({
  group,
  form,
  editMode,
  onEditClick,
  onGroupChange,
  onSaveGroup,
  onCancelEdit,
  shareUrl,
  prettyShareUrl,
  copied,
  copyShareUrl,
  updateError,
  updateSuccess,
  updateLoading,
}) {
  const { t } = useTranslation();

  // תאריך של היום בפורמט YYYY-MM-DD כדי להשתמש בו ב-min
  // const todayStr = new Date().toISOString().slice(0, 10);

  // היום בפורמט YYYY-MM-DD לפי אזור זמן מקומי
  const todayStr = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();

  const minCandidateEnd = (form.candidateEndDate && form.candidateEndDate < todayStr)
    ? form.candidateEndDate
    : todayStr;

  const minGroupEnd = (form.endDate && form.endDate < todayStr)
    ? form.endDate
    : todayStr;

  return (
    <section className="card">
      <div className="card-head">
        <h3>{t('groupSettings.general.title')}</h3>
        {!editMode && (
          <button className="clean-btn clean-btn-edit" onClick={onEditClick}>
            {t('common.edit')}
          </button>
        )}
      </div>

      {!editMode ? (
        <div className="read-grid">
          <div>
            <small>{t('groups.create.labels.name')}</small>
            <b>{group.name || '-'}</b>
          </div>

          <div>
            <small>{t('groups.create.labels.description')}</small>
            <div>{group.description || '-'}</div>
          </div>

          <div>
            <small>{t('groups.create.labels.maxWinners')}</small>
            <b>{group.maxWinners ?? 1}</b>
          </div>

          <div>
            <small>{t('groups.create.labels.candidateEndDate')}</small>
            <b>
              {group.candidateEndDate
                ? new Date(group.candidateEndDate).toLocaleDateString('he-IL')
                : '-'}
            </b>
          </div>

          <div>
            <small>{t('groups.create.labels.endDate')}</small>
            <b>
              {group.endDate
                ? new Date(group.endDate).toLocaleDateString('he-IL')
                : '-'}
            </b>
          </div>

          <div>
            <small>{t('groupSettings.general.status')}</small>
            <b>
              {group.isLocked
                ? t('groups.create.status.locked')
                : t('groups.create.status.open')}
            </b>
          </div>

          {group.symbol && (
            <div>
              <small>{t('groupSettings.general.symbolLabel')}</small>
              <b>{group.symbol}</b>
            </div>
          )}

          {group.photoUrl && (
            <div>
              <small>{t('groupSettings.general.photoLabel')}</small>
              <a
                href={group.photoUrl}
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                {t('groupSettings.general.photoOpen')}
              </a>
            </div>
          )}

          <div>
            <small>{t('groupSettings.general.createdBy')}</small>
            <b>{group.createdBy || '-'}</b>
          </div>

          <div>
            <small>{t('groupSettings.general.shareLinkLabel')}</small>

            {shareUrl ? (
              <div className="share-row" style={{ position: "relative" }}>

                <input
                  className="input share-input"
                  value={prettyShareUrl}
                  readOnly
                  style={{ direction: 'ltr', paddingRight: "34px" }}
                  onFocus={(e) => e.target.select()}
                  aria-label={t('groupSettings.general.shareInputAria')}
                />

                {/* אייקון העתקה במקום הכפתור */}
                <LuCopy
                  size={20}
                  className="copy-icon"
                  onClick={copyShareUrl}
                  title={t('groupSettings.general.shareCopy')}
                />

                <div className="muted share-hint">
                  {group.isLocked
                    ? t('groupSettings.general.shareHintLocked')
                    : t('groupSettings.general.shareHintOpen')}
                </div>
              </div>
            ) : (
              <div className="muted">—</div>
            )}
          </div>


          {updateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {t(updateError)}
            </div>
          )}

          {updateSuccess && (
            <div className="ok" style={{ marginTop: 6 }}>
              {t('groupSettings.general.updateSuccess')}
            </div>
          )}
        </div>
      ) : (
        <form className="field" onSubmit={onSaveGroup}>
          <label>
            {t('groups.create.labels.name')} *
          </label>
          <input
            className="input"
            name="name"
            required
            value={form.name}
            onChange={onGroupChange}
          />

          <label>{t('groups.create.labels.description')}</label>
          <textarea
            className="input"
            rows={3}
            name="description"
            value={form.description}
            onChange={onGroupChange}
          />

          <div className="grid-2">
            <div>
              <label>{t('groups.create.labels.maxWinners')}</label>
              <input
                className="input"
                name="maxWinners"
                type="number"
                min={1}
                value={form.maxWinners}
                onChange={onGroupChange}
              />
            </div>

            <div>
              <label>{t('groups.create.labels.candidateEndDate')}</label>
              <input
                min={minCandidateEnd}
                className="input"
                name="candidateEndDate"
                type="date"
                value={form.candidateEndDate}
                onChange={onGroupChange}
              // min={todayStr}
              />
            </div>

            <div>
              <label>{t('groups.create.labels.endDate')}</label>
              <input
                className="input"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={onGroupChange}
                min={minGroupEnd}
              />
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            <input
              type="checkbox"
              name="isLocked"
              checked={!!form.isLocked}
              onChange={onGroupChange}
            />
            {t('groupSettings.general.lockedHint')}
          </label>

          <label>{t('groupSettings.general.symbolLabelOptional')}</label>
          <input
            className="input"
            name="symbol"
            value={form.symbol}
            onChange={onGroupChange}
            placeholder={t('groupSettings.general.symbolPlaceholder')}
          />

          {updateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {t(updateError)}
            </div>
          )}

          <div className="actions-row">
            <button
              className="clean-btn clean-btn-save"
              type="submit"
              disabled={updateLoading}
            >
              {t('common.save')}
            </button>
            <button
              className="clean-btn clean-btn-cancel"
              type="button"
              onClick={onCancelEdit}
              disabled={updateLoading}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
