import React, { useState } from 'react';
import './AboutPage.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaVoteYea, FaUsers, FaShieldAlt, FaChartLine, FaLeaf, FaLock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState(null);

  const toggleFeature = (index) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  const features = [
    {
      icon: <FaVoteYea />,
      titleKey: 'about.features.democratic.title',
      descKey: 'about.features.democratic.desc'
    },
    {
      icon: <FaLock />,
      titleKey: 'about.features.privacy.title',
      descKey: 'about.features.privacy.desc'
    },
    {
      icon: <FaUsers />,
      titleKey: 'about.features.groups.title',
      descKey: 'about.features.groups.desc'
    },
    {
      icon: <FaChartLine />,
      titleKey: 'about.features.campaigns.title',
      descKey: 'about.features.campaigns.desc'
    },
    {
      icon: <FaShieldAlt />,
      titleKey: 'about.features.secure.title',
      descKey: 'about.features.secure.desc'
    },
    {
      icon: <FaLeaf />,
      titleKey: 'about.features.green.title',
      descKey: 'about.features.green.desc'
    },
  ];

  const useCases = [
    { titleKey: 'about.useCases.student.title', descKey: 'about.useCases.student.desc' },
    { titleKey: 'about.useCases.workplace.title', descKey: 'about.useCases.workplace.desc' },
    { titleKey: 'about.useCases.community.title', descKey: 'about.useCases.community.desc' },
    { titleKey: 'about.useCases.organization.title', descKey: 'about.useCases.organization.desc' },
  ];

  return (
    <div className="about-page" dir={i18n.dir()}>
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="about-badge">
            <FaVoteYea />
            <span>{t('about.hero.badge')}</span>
          </div>

          <h1 className="about-title">{t('about.hero.title')}</h1>
          <p className="about-subtitle">{t('about.hero.subtitle')}</p>

          <div className="about-cta">
            <button className="about-btn secondary" onClick={() => navigate('/groups/create')}>
              {t('about.hero.ctaSecondary')}
            </button>
          </div>
        </div>
      </header>

      <section className="mission-section">
        <div className="mission-content">
          <h2 className="section-title">{t('about.mission.title')}</h2>
          <p className="mission-text">{t('about.mission.text')}</p>
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title centered">{t('about.features.sectionTitle')}</h2>
        <div className="features-section">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="feature-card"
              onClick={() => toggleFeature(idx)}
            >
              <div className="feature-header">
                <div className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <div className="feature-content">
                  <h3>{t(feature.titleKey)}</h3>
                  <p>{t(feature.descKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="use-cases-section">
        <h2 className="section-title centered">{t('about.useCases.sectionTitle')}</h2>
        <div className="use-cases-grid">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="use-case-card">
              <h3>{t(useCase.titleKey)}</h3>
              <p>{t(useCase.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}