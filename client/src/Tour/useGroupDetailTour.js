import { useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';
import { useTranslation } from 'react-i18next';

export const useGroupDetailTour = ({ group, candidates, isOwner, isAuthed, isMobile }) => {
  const { setIsOpen, setSteps } = useTour();
  const { t, i18n } = useTranslation();
  const [autoOpened, setAutoOpened] = useState(false);
  const [tourInitialized, setTourInitialized] = useState(false); // ✅ ×"×•×¡×£

  // ✅ תמיד מעדכנים steps כשיש שינוי שפה/נתונים
  useEffect(() => {
    if (!group || !candidates || candidates.length === 0) {
      setTourInitialized(false);
      return;
    }

    const firstCandidateId = String(candidates[0]._id);

    const now = new Date();
    const candidateEndDate = group.candidateEndDate ? new Date(group.candidateEndDate) : null;
    const endDate = group.endDate ? new Date(group.endDate) : null;
    const isVotingPhase = candidateEndDate && endDate && now > candidateEndDate && now <= endDate;

    const tourSteps = [
      { 
        selector: '#group-detail-header', 
        content: t('groups.detail.tour.header') || 'זה כותרת הקבוצה - כאן תראה את שם הקבוצה ותיאור'
      },
      { 
        selector: '#group-detail-meta', 
        content: t('groups.detail.tour.meta') || 'כאן תמצא מידע חשוב על הקבוצה - תאריך יצירה, תאריך סיום וסך הצבעות'
      },
    ];

    if (isVotingPhase) {
      tourSteps.push({ 
        selector: '#vote-button', 
        content: t('groups.detail.tour.voteButton') || 'לחץ כאן כדי להצביע למועמדים'
      });
    }

    tourSteps.push({
      selector: `#candidate-card-${firstCandidateId}`,
      content: t('groups.detail.tour.candidateCard') || 'אלו המועמדים בקבוצה - לחץ על מועמד לראות את הקמפיין שלו',
    });

    if (isOwner) {
      tourSteps.push({ 
        selector: '#settings-button', 
        content: t('groups.detail.tour.settingsButton') || 'כמנהל הקבוצה, תוכל לערוך הגדרות כאן'
      });
    }

    if (isAuthed) {
      tourSteps.push({
        selector: '#chat-fab',
        content: t('groups.detail.tour.chatButton') || 'לחץ כאן לפתוח את הצאט של הקבוצה'
      });
    }

    setSteps(tourSteps);
    setTourInitialized(true); // ✅ מאתחל רק אחרי שיש steps
  }, [group, candidates, isOwner, isAuthed, setSteps, t, i18n.language]);

  // ✅ פתיחה אוטומטית רק פעם אחת
  useEffect(() => {
    if (!tourInitialized) return; // ✅ ממתין שה-tour יהיה מוכן
    
    const tourSeen = localStorage.getItem('groupTourSeen');
    if (!tourSeen && !autoOpened) {
      setAutoOpened(true);
      setTimeout(() => setIsOpen(true), 800);
      localStorage.setItem('groupTourSeen', 'true');
    }
  }, [tourInitialized, setIsOpen, autoOpened]);

  return { 
    tourInitialized, // ✅ מחזיר את הסטטוס
    openTour: () => setIsOpen(true) 
  };
};