import { useTour } from '@reactour/tour';

export default function TourButton() {
  const { setIsOpen } = useTour();

  return (
    <button onClick={() => setIsOpen(true)}>
      הפעל הדרכה
    </button>
  );
}
