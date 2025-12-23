import { useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';
import { useTranslation } from 'react-i18next';

export const useGroupDetailTour = ({ group, candidates, isOwner }) => {
  const { setIsOpen, setSteps } = useTour();
  const { t, i18n } = useTranslation();
  const [autoOpened, setAutoOpened] = useState(false);

  // ✅ תמיד מעדכנים steps כשיש שינוי שפה/נתונים
  useEffect(() => {
    if (!group || candidates.length === 0) return;

    const firstCandidateId = String(candidates[0]._id);

    const now = new Date();
    const candidateEndDate = group.candidateEndDate ? new Date(group.candidateEndDate) : null;
    const endDate = group.endDate ? new Date(group.endDate) : null;
    const isVotingPhase = candidateEndDate && endDate && now > candidateEndDate && now <= endDate;

    const tourSteps = [
      { selector: '#group-detail-header', content: t('groups.detail.tour.header') },
      { selector: '#group-detail-meta', content: t('groups.detail.tour.meta') },
    ];

    if (isVotingPhase) {
      tourSteps.push({ selector: '#vote-button', content: t('groups.detail.tour.voteButton') });
    }

    tourSteps.push({
      selector: `#candidate-card-${firstCandidateId}`,
      content: t('groups.detail.tour.candidateCard'),
    });

    if (isOwner) {
      tourSteps.push({ selector: '#settings-button', content: t('groups.detail.tour.settingsButton') });
    }

    setSteps(tourSteps);
  }, [group, candidates, isOwner, setSteps, t, i18n.language]); // ✅ חשוב i18n.language

  // ✅ פתיחה אוטומטית רק פעם אחת
  useEffect(() => {
    const tourSeen = localStorage.getItem('groupTourSeen');
    if (!tourSeen && !autoOpened) {
      setAutoOpened(true);
      setTimeout(() => setIsOpen(true), 500);
      localStorage.setItem('groupTourSeen', 'true');
    }
  }, [setIsOpen, autoOpened]);

  return { openTour: () => setIsOpen(true) };
};
