import { useEffect } from 'react';
import { useTour } from '@reactour/tour';

export default function GlobalTour({ steps }) {
  const { setSteps } = useTour();

  useEffect(() => {
    if (steps && steps.length > 0) {
      setSteps(steps);
    }
  }, [steps, setSteps]);

  return null;
}
