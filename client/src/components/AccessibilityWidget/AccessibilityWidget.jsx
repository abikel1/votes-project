import { useState } from "react";
import "./AccessibilityWidget.css";
import { FaUniversalAccess } from "react-icons/fa";

import {
  increaseText,
  decreaseText,
  resetText,
} from "./accessibility.js";

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  // ניגודיות גבוהה
  const toggleContrast = () => {
    document.body.classList.toggle("high-contrast");
  };

  // הדגשת קישורים
  const highlightLinks = () => {
    document.body.classList.toggle("highlight-links");
  };

  return (
    <>
      <button className="accessibility-btn" onClick={toggle} title="נגישות">
        <FaUniversalAccess size={40} />
      </button>

      {/* תפריט הנגישות */}
      {open && (
        <div className="accessibility-panel">
          <h4>אפשרויות נגישות</h4>

          <button onClick={increaseText}>הגדלת טקסט</button>
          <button onClick={decreaseText}>הקטנת טקסט</button>
          <button onClick={resetText}>איפוס טקסט</button>

          <button onClick={toggleContrast}>ניגודיות גבוהה</button>
          <button onClick={highlightLinks}>הדגשת קישורים</button>
        </div>
      )}
    </>
  );
}