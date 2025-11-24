// src/pages/GroupSettingsPage/GeneralTab.jsx
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
  // מוסיפים: תאריך של היום בפורמט YYYY-MM-DD כדי להשתמש בו ב-min
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <section className="card">
      <div className="card-head">
        <h3>פרטי הקבוצה</h3>
        {!editMode && (
          <button className="gs-btn-outline" onClick={onEditClick}>
            עריכה
          </button>
        )}
      </div>

      {!editMode ? (
        <div className="read-grid">
          <div>
            <small>שם</small>
            <b>{group.name || '-'}</b>
          </div>
          <div>
            <small>תיאור</small>
            <div>{group.description || '-'}</div>
          </div>
          <div>
            <small>מקס׳ זוכים</small>
            <b>{group.maxWinners ?? 1}</b>
          </div>

             <div>
            <small>תאריך סיום הגשת מעומדות</small>
            <b>
              {group.candidateEndDate
                ? new Date(group.candidateEndDate).toLocaleDateString('he-IL')
                : '-'}
            </b>
          </div>

          <div>
            <small>תאריך סיום</small>
            <b>
              {group.endDate
                ? new Date(group.endDate).toLocaleDateString('he-IL')
                : '-'}
            </b>
          </div>
          <div>
            <small>סטטוס</small>
            <b>{group.isLocked ? ' נעולה' : 'פתוחה'}</b>
          </div>
          {group.symbol && (
            <div>
              <small>סמל</small>
              <b>{group.symbol}</b>
            </div>
          )}
          {group.photoUrl && (
            <div>
              <small>תמונה</small>
              <a
                href={group.photoUrl}
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                פתיחה
              </a>
            </div>
          )}
          <div>
            <small>נוצר ע״י</small>
            <b>{group.createdBy || '-'}</b>
          </div>

          <div>
            <small>קישור שיתוף</small>
            {shareUrl ? (
              <div className="share-row">
                <input
                  className="input share-input"
                  value={prettyShareUrl}
                  readOnly
                  style={{ direction: 'ltr' }}
                  onFocus={(e) => e.target.select()}
                  aria-label="קישור לשיתוף"
                />
                <div className="share-actions">
                  <button
                    className="gs-btn"
                    type="button"
                    onClick={copyShareUrl}
                  >
                    {copied ? 'הועתק ✓' : 'העתק'}
                  </button>
                </div>

                <div className="muted share-hint">
                  {group.isLocked
                    ? 'קבוצה נעולה: הקישור יבקש התחברות ואז ישלח בקשת הצטרפות.'
                    : 'קבוצה פתוחה: הקישור מוביל ישירות לעמוד הקבוצה.'}
                </div>
              </div>
            ) : (
              <div className="muted">—</div>
            )}
          </div>

          {updateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="ok" style={{ marginTop: 6 }}>
              נשמר בהצלחה
            </div>
          )}
        </div>
      ) : (
        <form className="field" onSubmit={onSaveGroup}>
          <label>שם *</label>
          <input
            className="input"
            name="name"
            required
            value={form.name}
            onChange={onGroupChange}
          />
          <label>תיאור</label>
          <textarea
            className="input"
            rows={3}
            name="description"
            value={form.description}
            onChange={onGroupChange}
          />
          <div className="grid-2">
            <div>
              <label>מקס׳ זוכים</label>
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
              <label>תאריך סיום הגשת מועמדות</label>
              <input
                className="input"
                name="candidateEndDate"
                type="date"
                value={form.candidateEndDate}
                onChange={onGroupChange}
                // min={todayStr}   // 🔹 כאן ההגבלה שלא ניתן לבחור תאריך עבר
              />
            </div>
            <div>
              <label>תאריך סיום</label>
              <input
                className="input"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={onGroupChange}
                min={todayStr}   // 🔹 כאן ההגבלה שלא ניתן לבחור תאריך עבר
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
            קבוצה נעולה (חברים נכנסים דרך בקשות)
          </label>
          <label>סמל (אופציונלי)</label>
          <input
            className="input"
            name="symbol"
            value={form.symbol}
            onChange={onGroupChange}
            placeholder="למשל: א׳"
          />
          {updateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {updateError}
            </div>
          )}
          <div className="actions-row">
            <button className="gs-btn" type="submit" disabled={updateLoading}>
              שמור
            </button>
            <button
              className="gs-btn-outline"
              type="button"
              onClick={onCancelEdit}
              disabled={updateLoading}
            >
              ביטול
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
