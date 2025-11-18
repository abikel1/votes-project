import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ToastDemo() {
  
  const showSuccess = () => {
    toast.success('הפעולה בוצעה בהצלחה!');
  };

  const showError = () => {
    toast.error('אופס! משהו השתבש');
  };

  const showInfo = () => {
    toast('זוהי הודעת מידע רגילה');
  };

  const showWarning = () => {
    toast('⚠️ אזהרה: שים לב לפרטים', {
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
      },
    });
  };

  const showLoading = () => {
    const loadingToast = toast.loading('טוען נתונים...');
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('הנתונים נטענו!');
    }, 2000);
  };

  const showPromise = () => {
    const myPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve() : reject();
      }, 2000);
    });

    toast.promise(myPromise, {
      loading: 'שומר נתונים...',
      success: 'הנתונים נשמרו בהצלחה!',
      error: 'שגיאה בשמירת הנתונים',
    });
  };

  const showCustom = () => {
    toast.custom((t) => (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          direction: 'rtl',
        }}
      >
        <span style={{ fontSize: '24px' }}>🎉</span>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>הודעה מותאמת אישית!</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>זה עיצוב מיוחד שלך</div>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: 'auto',
          }}
        >
          ✕
        </button>
      </div>
    ));
  };

  const showLongText = () => {
    toast('זוהי הודעה ארוכה יותר שמדגימה איך נראה טקסט ארוך בתוך ההודעה הקופצת. אפשר לראות שזה עובד מצוין גם עם תוכן רב.', {
      duration: 5000,
    });
  };

  const showEmoji = () => {
    toast('🚀 המערכת עולה לאוויר!', {
      icon: '🎯',
    });
  };

  const showMultiple = () => {
    toast.success('הודעה ראשונה');
    setTimeout(() => toast.error('הודעה שנייה'), 300);
    setTimeout(() => toast('הודעה שלישית'), 600);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            fontSize: '15px',
            fontFamily: 'inherit',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            direction: 'rtl',
            textAlign: 'right',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#1f2937',
          marginBottom: '10px',
          fontSize: '32px',
        }}>
          🎨 דוגמאות React Hot Toast
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '40px',
        }}>
          לחץ על הכפתורים לראות סוגי הודעות שונות
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <button onClick={showSuccess} style={buttonStyle('#10b981')}>
            ✓ הודעת הצלחה
          </button>

          <button onClick={showError} style={buttonStyle('#ef4444')}>
            ✕ הודעת שגיאה
          </button>

          <button onClick={showInfo} style={buttonStyle('#3b82f6')}>
            ℹ הודעת מידע
          </button>

          <button onClick={showWarning} style={buttonStyle('#f59e0b')}>
            ⚠ הודעת אזהרה
          </button>

          <button onClick={showLoading} style={buttonStyle('#8b5cf6')}>
            ⏳ הודעת טעינה
          </button>

          <button onClick={showPromise} style={buttonStyle('#ec4899')}>
            🔄 Promise Toast
          </button>

          <button onClick={showCustom} style={buttonStyle('#6366f1')}>
            ✨ הודעה מותאמת
          </button>

          <button onClick={showLongText} style={buttonStyle('#14b8a6')}>
            📝 טקסט ארוך
          </button>

          <button onClick={showEmoji} style={buttonStyle('#f97316')}>
            🎯 עם אמוג'י
          </button>

          <button onClick={showMultiple} style={buttonStyle('#a855f7')}>
            📚 מספר הודעות
          </button>
        </div>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f3f4f6',
          borderRadius: '8px',
          direction: 'rtl',
        }}>
          <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>💡 טיפים:</h3>
          <ul style={{ color: '#4b5563', lineHeight: '1.8' }}>
            <li>ההודעות נעלמות אוטומטית אחרי 3 שניות</li>
            <li>אפשר לסגור הודעה ידנית בלחיצה עליה</li>
            <li>מספר הודעות יכולות להופיע בו זמנית</li>
            <li>כל הודעה מקבלת אנימציה חלקה</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = (color) => ({
  background: color,
  color: 'white',
  border: 'none',
  padding: '14px 24px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  ':hover': {
    transform: 'translateY(-2px)',
  }
});