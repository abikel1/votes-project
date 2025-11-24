import { useState, useEffect } from "react";
import "./CountdownTimer.css";

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const updateTimer = () => {
      if (!endDate) return;

      const now = new Date();

      // כאן השינוי: יוצרים תאריך "סוף היום" 23:59:59 של תאריך הסיום
      const endBase = new Date(endDate); // מה שמגיע מה־DB
      const endOfDay = new Date(
        endBase.getFullYear(),
        endBase.getMonth(),
        endBase.getDate(),
        23,
        59,
        59,
        999
      );

      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

      setTimeLeft({ days, hours, minutes, seconds });
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="countdown-row">
      <div className="countdown-item">
        <span className="count-number">{timeLeft.seconds}</span>
        <span className="count-label">שניות</span>
      </div>

      <span className="count-sep">:</span>

      <div className="countdown-item">
        <span className="count-number">{timeLeft.minutes}</span>
        <span className="count-label">דקות</span>
      </div>

      <span className="count-sep">:</span>

      <div className="countdown-item">
        <span className="count-number">{timeLeft.hours}</span>
        <span className="count-label">שעות</span>
      </div>

      <span className="count-sep">:</span>

      <div className="countdown-item">
        <span className="count-number">{timeLeft.days}</span>
        <span className="count-label">ימים</span>
      </div>
    </div>
  );
}
