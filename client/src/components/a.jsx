import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ToastDemo() {
  const { t, i18n } = useTranslation();

  const showSuccess = () => {
    toast.success(t('toastDemo.success'));
  };

  const showError = () => {
    toast.error(t('toastDemo.error'));
  };

  const showInfo = () => {
    toast(t('toastDemo.info'));
  };

  const showWarning = () => {
    toast(t('toastDemo.warning'), {
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
      },
    });
  };

  const showLoading = () => {
    const loadingToast = toast.loading(t('toastDemo.loading'));

    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(t('toastDemo.loaded'));
    }, 2000);
  };

  const showPromise = () => {
    const myPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve() : reject();
      }, 2000);
    });

    toast.promise(myPromise, {
      loading: t('toastDemo.promiseLoading'),
      success: t('toastDemo.promiseSuccess'),
      error: t('toastDemo.promiseError'),
    });
  };

  const showCustom = () => {
    toast.custom((tObj) => (
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
          direction: i18n.language === 'he' ? 'rtl' : 'ltr',
        }}
      >
        <span style={{ fontSize: '24px' }}>🎉</span>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {t('toastDemo.customTitle')}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {t('toastDemo.customText')}
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(tObj.id)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginInlineStart: 'auto',
          }}
        >
          ✕
        </button>
      </div>
    ));
  };

  const showLongText = () => {
    toast(t('toastDemo.longText'), {
      duration: 5000,
    });
  };

  const showEmoji = () => {
    toast(t('toastDemo.emoji'), {
      icon: '🎯',
    });
  };

  const showMultiple = () => {
    toast.success(t('toastDemo.multiFirst'));
    setTimeout(() => toast.error(t('toastDemo.multiSecond')), 300);
    setTimeout(() => toast(t('toastDemo.multiThird')), 600);
  };

  const isHebrew = i18n.language === 'he';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
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
            direction: isHebrew ? 'rtl' : 'ltr',
            textAlign: isHebrew ? 'right' : 'left',
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

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: '10px',
            fontSize: '32px',
          }}
        >
          {t('toastDemo.title')}
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '40px',
          }}
        >
          {t('toastDemo.subtitle')}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <button onClick={showSuccess} style={buttonStyle('#10b981')}>
            {t('toastDemo.buttons.success')}
          </button>

          <button onClick={showError} style={buttonStyle('#ef4444')}>
            {t('toastDemo.buttons.error')}
          </button>

          <button onClick={showInfo} style={buttonStyle('#3b82f6')}>
            {t('toastDemo.buttons.info')}
          </button>

          <button onClick={showWarning} style={buttonStyle('#f59e0b')}>
            {t('toastDemo.buttons.warning')}
          </button>

          <button onClick={showLoading} style={buttonStyle('#8b5cf6')}>
            {t('toastDemo.buttons.loading')}
          </button>

          <button onClick={showPromise} style={buttonStyle('#ec4899')}>
            {t('toastDemo.buttons.promise')}
          </button>

          <button onClick={showCustom} style={buttonStyle('#6366f1')}>
            {t('toastDemo.buttons.custom')}
          </button>

          <button onClick={showLongText} style={buttonStyle('#14b8a6')}>
            {t('toastDemo.buttons.longText')}
          </button>

          <button onClick={showEmoji} style={buttonStyle('#f97316')}>
            {t('toastDemo.buttons.emoji')}
          </button>

          <button onClick={showMultiple} style={buttonStyle('#a855f7')}>
            {t('toastDemo.buttons.multiple')}
          </button>
        </div>

        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            background: '#f3f4f6',
            borderRadius: '8px',
            direction: isHebrew ? 'rtl' : 'ltr',
          }}
        >
          <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>
            {t('toastDemo.tipsTitle')}
          </h3>
          <ul style={{ color: '#4b5563', lineHeight: '1.8' }}>
            <li>{t('toastDemo.tips.autoHide')}</li>
            <li>{t('toastDemo.tips.close')}</li>
            <li>{t('toastDemo.tips.multiple')}</li>
            <li>{t('toastDemo.tips.animation')}</li>
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
});
