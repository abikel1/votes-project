// src/Tour/TourConfig.jsx
import { TourProvider } from '@reactour/tour';

export default function TourConfig({ children }) {
  const steps = [
    {
      selector: '.groups-list',
      content: 'כאן רואים את רשימת הקבוצות'
    },
    {
      selector: '.create-group-btn',
      content: 'כאן יוצרים קבוצה חדשה'
    }
  ];

  return (
    <TourProvider steps={steps}>
      {children}
    </TourProvider>
  );
}
