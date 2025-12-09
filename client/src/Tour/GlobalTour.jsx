import { useEffect } from 'react';
import { useTour } from '@reactour/tour';

export default function GlobalTour({ steps }) {
  const { setSteps, setIsOpen } = useTour();

  useEffect(() => {
    console.log('Registering steps...');
    setSteps(steps);

    // פותח את ההדרכה אוטומטית אחרי חצי שניה
    const timeout = setTimeout(() => {
      console.log('Opening tour...');
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [steps, setSteps, setIsOpen]);

  return null;
}
