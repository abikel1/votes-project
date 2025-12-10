// src/hooks/useGroupDetailTour.js
import { useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';

export const useGroupDetailTour = ({ group, candidates, isOwner, isAuthed, isMobile }) => {
  const { setIsOpen, setSteps } = useTour();
  const [tourInitialized, setTourInitialized] = useState(false);

useEffect(() => {
  if (!group || candidates.length === 0 || tourInitialized) return;

  const firstCandidateId = String(candidates[0]._id);
  const now = new Date();
  const candidateEndDate = group.candidateEndDate ? new Date(group.candidateEndDate) : null;
  const endDate = group.endDate ? new Date(group.endDate) : null;
  const isVotingPhase = candidateEndDate && endDate && now > candidateEndDate && now <= endDate;

  const tourSteps = [
    { selector: '#group-detail-header', content: 'כאן מוצג שם הקבוצה והתיאור שלה' },
    { selector: '#group-detail-meta', content: 'כאן תראה את תאריך היצירה, תאריך הסיום וסך הקולות' },
  ];

  if (isVotingPhase) {
    tourSteps.push({ selector: '#vote-button', content: 'לחץ כאן כדי להצביע למועמדים!' });
  }

  tourSteps.push(
    { selector: '#candidates-section', content: 'כאן מוצגים כל המועמדים בקבוצה' },
    { selector: `#candidate-card-${firstCandidateId}`, content: 'כל כרטיס מציג מועמד עם תמונה, שם ותיאור' },
    { selector: `#candidate-card-${firstCandidateId} .campaign-btn`,  content: 'לחץ כאן כדי לראות או ליצור קמפיין עבור המועמד' }
  );

  tourSteps.push({ selector: '#chat-fab', content: 'לחץ כאן לפתיחת הצ\'אט של הקבוצה' });

  if (isOwner) {
    tourSteps.push({ selector: '#settings-button', content: 'כבעל הקבוצה, תוכל לנהל את הקבוצה מכאן' });
  }

  setSteps(tourSteps);
  setTourInitialized(true);

  // 🔹 פותח רק אם המשתמש עדיין לא ראה את המדריך
  const tourSeen = localStorage.getItem(`groupTourSeen_${group._id}`);
  if (!tourSeen) {
    setTimeout(() => setIsOpen(true), 500);
    localStorage.setItem(`groupTourSeen_${group._id}`, 'true');
  }
}, [group, candidates, isOwner, isAuthed, isMobile, setSteps, setIsOpen, tourInitialized]);

  return { tourInitialized, openTour: () => setIsOpen(true) };
};