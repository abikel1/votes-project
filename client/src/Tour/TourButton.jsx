import { useTour } from '@reactour/tour';
import { HelpCircle } from 'lucide-react';
import './TourButton.css';

export default function TourButton() {
  const { setIsOpen } = useTour();

  return (
    <button className="tour-btn-small" onClick={() => setIsOpen(true)}>
      <HelpCircle className="tour-icon" />
    </button>
  );
}
