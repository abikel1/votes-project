import React, { useState } from 'react';
import {
  Users,
  Vote,
  Bell,
  Zap,
  Smartphone,
  Shield,
  Headphones,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './UserGuidePage.css';
import { useTranslation } from 'react-i18next';

export default function EnhancedUserGuide() {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);
  const toggleSection = (index) =>
    setExpandedSection(expandedSection === index ? null : index);

  const FlowDiagram = () => (
    <div className="flow-diagram">
      <div className="flow-container">
        <div className="flow-step">
          <div className="flow-box">
            <Users className="icon" />
          </div>
          <p className="flow-label">{t('guide.flow.register')}</p>
        </div>

        <div className="flow-arrow" aria-hidden="true" />


        <div className="flow-step">
          <div className="flow-box">
            <Users className="icon" />
          </div>
          <p className="flow-label">{t('guide.flow.createGroup')}</p>
        </div>

        <div className="flow-arrow" aria-hidden="true" />


        <div className="flow-step">
          <div className="flow-box">
            <Vote className="icon" />
          </div>
          <p className="flow-label">{t('guide.flow.votes')}</p>
        </div>

        <div className="flow-arrow" aria-hidden="true" />


        <div className="flow-step">
          <div className="flow-box">
            <Bell className="icon" />
          </div>
          <p className="flow-label">{t('guide.flow.notifications')}</p>
        </div>
      </div>
    </div>
  );

  const steps = [
    {
      icon: <Users className="icon-large" />,
      title: t('guide.steps.registerTitle2'),
      description: t('guide.steps.registerDesc2'),
      details: [
        t('guide.steps.registerDetails.0'),
        t('guide.steps.registerDetails.1'),
        t('guide.steps.registerDetails.2'),
        t('guide.steps.registerDetails.3'),
      ],
    },
    {
      icon: <Users className="icon-large" />,
      title: t('guide.steps.groupsTitle2'),
      description: t('guide.steps.groupsDesc2'),
      details: [
        t('guide.steps.groupsDetails.0'),
        t('guide.steps.groupsDetails.1'),
        t('guide.steps.groupsDetails.2'),
        t('guide.steps.groupsDetails.3'),
      ],
    },
    {
      icon: <Vote className="icon-large" />,
      title: t('guide.steps.votesTitle2'),
      description: t('guide.steps.votesDesc2'),
      details: [
        t('guide.steps.votesDetails.0'),
        t('guide.steps.votesDetails.1'),
        t('guide.steps.votesDetails.2'),
        t('guide.steps.votesDetails.3'),
      ],
    },
    {
      icon: <Bell className="icon-large" />,
      title: t('guide.steps.notificationsTitle2'),
      description: t('guide.steps.notificationsDesc2'),
      details: [
        t('guide.steps.notificationsDetails.0'),
        t('guide.steps.notificationsDetails.1'),
        t('guide.steps.notificationsDetails.2'),
        t('guide.steps.notificationsDetails.3'),
      ],
    },
  ];

  // כרגע הסקשן של tips אצלך בהערה, אבל השארתי את המערך מוכן למקרה שתחזיר אותו
  const tips = [
    {
      icon: <Zap className="icon-small" />,
      title: t('guide.tips.shortcutsTitle2'),
      description: t('guide.tips.shortcutsDesc2'),
    },
    {
      icon: <Smartphone className="icon-small" />,
      title: t('guide.tips.mobileTitle2'),
      description: t('guide.tips.mobileDesc2'),
    },
    {
      icon: <Shield className="icon-small" />,
      title: t('guide.tips.privacyTitle2'),
      description: t('guide.tips.privacyDesc2'),
    },
    {
      icon: <Headphones className="icon-small" />,
      title: t('guide.tips.supportTitle2'),
      description: t('guide.tips.supportDesc2'),
    },
  ];

  return (
    <div className="container" >
      <header className="hero">
        <h1 className="hero-title">{t('guide.pageTitle')}</h1>
        <p className="hero-subtitle">{t('guide.pageSubtitle')}</p>
      </header>

      <section className="flow-section">
        <h2 className="section-title">{t('guide.flow.title')}</h2>
        <FlowDiagram />
      </section>

      <section className="steps-section">
        {steps.map((step, index) => (
          <div
            key={index}
            className="step-card"
            onClick={() => toggleSection(index)}
            role="button"
            tabIndex={0}
          >
            <div className="step-header">
              <div className="step-icon">{step.icon}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {expandedSection === index ? (
                <ChevronUp className="icon-small" />
              ) : (
                <ChevronDown className="icon-small" />
              )}
            </div>

            {expandedSection === index && (
              <ul className="step-details">
                {step.details.map((d, i) => (
                  <li key={i}>
                    <span>{i + 1}</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* אם תחזיר את הטיפים, זה כבר מוכן:
      <section className="tips-section">
        <h2 className="section-title">{t('guide.tips.sectionTitle')}</h2>
        <div className="tips-grid">
          {tips.map((tip, i) => (
            <div key={i} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </section>
      */}
    </div>
  );
}
