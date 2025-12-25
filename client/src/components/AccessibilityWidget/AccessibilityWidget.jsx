import { useState, useEffect } from "react";
import "./AccessibilityWidget.css";
import { FaUniversalAccess } from "react-icons/fa";
import { MdTextIncrease, MdContrast, MdOutlineLink } from "react-icons/md";

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.5;
const STEP = 0.1;
const STORAGE_KEY = "a11yFontScale";

function applyFontScale(scale) {
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  document.documentElement.style.setProperty(
    "--a11y-font-scale",
    clamped.toString()
  );
  try {
    localStorage.setItem(STORAGE_KEY, clamped.toString());
  } catch (e) {
    console.warn("Cannot access localStorage for a11y font scale", e);
  }
  return clamped;
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [contrastOn, setContrastOn] = useState(false);
  const [linksOn, setLinksOn] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    let initial = 1;
    try {
      const saved = parseFloat(localStorage.getItem(STORAGE_KEY));
      if (!Number.isNaN(saved)) initial = saved;
    } catch { }
    const clamped = applyFontScale(initial);
    setFontScale(clamped);
  }, []);

  const increaseText = () => {
    setFontScale((prev) => applyFontScale(prev + STEP));
  };

  const decreaseText = () => {
    setFontScale((prev) => applyFontScale(prev - STEP));
  };

  const resetText = () => {
    setFontScale(applyFontScale(1));
  };

  const toggleContrast = () => {
    document.body.classList.toggle("high-contrast");
    setContrastOn((v) => !v);
  };

  const toggleHighlightLinks = () => {
    document.body.classList.toggle("highlight-links");
    setLinksOn((v) => !v);
  };

  return (
    <>
      <button className="accessibility-btn" onClick={toggle} title="נגישות">
        <FaUniversalAccess />
      </button>

      {open && (
        <div className="accessibility-panel">
          <div className="a11y-panel-header">
            <span className="a11y-panel-title">נגישות</span>
            <button
              className="a11y-close-btn"
              type="button"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">התאמות טקסט</div>
            <div className="a11y-tile-row">
              <button
                type="button"
                className="a11y-tile"
                onClick={increaseText}
              >
                <div className="a11y-tile-icon">
                  <MdTextIncrease />
                </div>
                <div className="a11y-tile-text">
                  <div className="a11y-tile-title">הגדלת טקסט</div>
                  <div className="a11y-tile-sub">
                    רמת גודל: {fontScale.toFixed(1)}x
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="a11y-tile"
                onClick={decreaseText}
              >
                <div className="a11y-tile-icon">
                  <MdTextIncrease style={{ transform: "scaleX(-1)" }} />
                </div>
                <div className="a11y-tile-text">
                  <div className="a11y-tile-title">הקטנת טקסט</div>
                  <div className="a11y-tile-sub">הקטנה עד לגודל בסיסי</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              className="a11y-reset-btn"
              onClick={resetText}
            >
              איפוס גודל טקסט
            </button>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">התאמות ניגודיות וקישורים</div>
            <div className="a11y-tile-row">
              <button
                type="button"
                className={
                  "a11y-tile a11y-toggle-tile" +
                  (contrastOn ? " a11y-tile-active" : "")
                }
                onClick={toggleContrast}
              >
                <div className="a11y-tile-icon">
                  <MdContrast />
                </div>
                <div className="a11y-tile-text">
                  <div className="a11y-tile-title">ניגודיות גבוהה</div>
                  <div className="a11y-tile-sub">
                    {contrastOn ? "פעיל" : "כבוי"}
                  </div>
                </div>
                {contrastOn && <span className="a11y-check">✓</span>}
              </button>

              <button
                type="button"
                className={
                  "a11y-tile a11y-toggle-tile" +
                  (linksOn ? " a11y-tile-active" : "")
                }
                onClick={toggleHighlightLinks}
              >
                <div className="a11y-tile-icon">
                  <MdOutlineLink />
                </div>
                <div className="a11y-tile-text">
                  <div className="a11y-tile-title">הדגשת קישורים</div>
                  <div className="a11y-tile-sub">
                    {linksOn ? "פעיל" : "כבוי"}
                  </div>
                </div>
                {linksOn && <span className="a11y-check">✓</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
