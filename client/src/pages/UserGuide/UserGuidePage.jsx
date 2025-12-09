import React from 'react';
import { useTranslation } from 'react-i18next';
import { TourProvider, useTour } from '@reactour/tour';
import GlobalTour from '../../Tour/GlobalTour';

export default function UserGuidePage() {
  const { t } = useTranslation();

  const steps = [
    { selector: '#guide-title', content: t('guide.steps.registerDesc') },
    { selector: '#guide-steps', content: t('guide.steps.groupsDesc') },
  ];

  console.log('UserGuidePage steps:', steps);

  return (
    <TourProvider>
      <PageContent steps={steps} />
    </TourProvider>
  );
}

function PageContent({ steps }) {
  const { setIsOpen, isOpen } = useTour();

  console.log('PageContent render', { isOpen });

  return (
    <div>
      <GlobalTour steps={steps} />

      <div id="guide-title">הדרכת משתמש</div>
      <div id="guide-steps">כאן כל הצעדים של ההדרכה</div>

      <button
        onClick={() => {
          console.log('לחצת על הפעל הדרכה');
          setIsOpen(true);
        }}
      >
        הפעל הדרכה
      </button>
    </div>
  );
}
