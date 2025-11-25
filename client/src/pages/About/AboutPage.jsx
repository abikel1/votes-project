// src/pages/About/AboutPage.jsx
import React from 'react';
import './AboutPage.css';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  const cards = [
    {
      titleKey: 'about.cards.main.whatWeDo.title',
      descKey: 'about.cards.main.whatWeDo.desc',
    },
    {
      titleKey: 'about.cards.main.success.title',
      descKey: 'about.cards.main.success.desc',
    },
    {
      titleKey: 'about.cards.main.saving.title',
      descKey: 'about.cards.main.saving.desc',
    },
  ];

  const miniCards = [
    {
      titleKey: 'about.cards.mini.simpleManagement.title',
      descKey: 'about.cards.mini.simpleManagement.desc',
    },
    {
      titleKey: 'about.cards.mini.security.title',
      descKey: 'about.cards.mini.security.desc',
    },
    {
      titleKey: 'about.cards.mini.support.title',
      descKey: 'about.cards.mini.support.desc',
    },
    {
      titleKey: 'about.cards.mini.customization.title',
      descKey: 'about.cards.mini.customization.desc',
    },
  ];

  return (
    <div className="about-page">
      <h1>{t('about.title')}</h1>
      <p className="about-subtitle">{t('about.subtitle')}</p>

      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <h3>{t(card.titleKey)}</h3>
            <p>{t(card.descKey)}</p>
          </div>
        ))}
      </div>

      <div className="highlight-card">
        <h2>{t('about.highlight.title')}</h2>
        <p>{t('about.highlight.desc')}</p>
      </div>

      <div className="mini-cards-container">
        {miniCards.map((card, index) => (
          <div key={index} className="mini-card">
            <h4>{t(card.titleKey)}</h4>
            <p>{t(card.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
