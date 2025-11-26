// src/pages/UserGuide/UserGuidePage.jsx
import React from 'react';
import './UserGuidePage.css';
import { useTranslation } from 'react-i18next';

export default function UserGuidePage() {
  const { t } = useTranslation();

  const steps = [
    { title: t('guide.steps.registerTitle'), description: t('guide.steps.registerDesc') },
    { title: t('guide.steps.groupsTitle'), description: t('guide.steps.groupsDesc') },
    { title: t('guide.steps.votesTitle'), description: t('guide.steps.votesDesc') },
    { title: t('guide.steps.notificationsTitle'), description: t('guide.steps.notificationsDesc') },
  ];

  const tips = [
    { title: t('guide.tips.shortcutsTitle'), description: t('guide.tips.shortcutsDesc') },
    { title: t('guide.tips.mobileTitle'), description: t('guide.tips.mobileDesc') },
    { title: t('guide.tips.privacyTitle'), description: t('guide.tips.privacyDesc') },
    { title: t('guide.tips.supportTitle'), description: t('guide.tips.supportDesc') },
  ];

  return (
    <div className="user-guide-page">
      <h1>{t('guide.title')}</h1>
      <p className="guide-subtitle">{t('guide.subtitle')}</p>

      <div className="cards-container">
        {steps.map((step, index) => (
          <div key={index} className="card">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="highlight-card">
        <h2>{t('guide.highlightTitle')}</h2>
        <p>{t('guide.highlightDesc')}</p>
      </div>

      <div className="mini-cards-container">
        {tips.map((tip, index) => (
          <div key={index} className="mini-card">
            <h4>{tip.title}</h4>
            <p>{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
