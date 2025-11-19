// src/pages/GroupSettingsPage/DangerTab.jsx
export default function DangerTab({ onOpenDelete }) {
  return (
    <section className="card">
      <details open className="acc danger">
        <summary className="acc-sum">מחיקת קבוצה</summary>
        <div className="acc-body">
          <p className="danger-text">
            מחיקה היא פעולה בלתי הפיכה. כל נתוני הקבוצה יימחקו לכולם.
          </p>
          <button
            className="btn-danger"
            onClick={onOpenDelete}
          >
            מחיקת הקבוצה…
          </button>
        </div>
      </details>
    </section>
  );
}
