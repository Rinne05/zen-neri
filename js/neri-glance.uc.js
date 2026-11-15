// ==UserScript==
// @name           neri-glance.uc.js
// @description    Aligns Zen's Glance arc with Neri's 90% x 90% preview size
// @author         Rinne05
// @version        v0.1
// @include        main
// @grant          none
// ==/UserScript==

(function () {
  "use strict";

  const PATCH_FLAG = "__neriGlanceArcPatched";

  function patch() {
    const ui = window.gZenUIManager;
    if (!ui || ui[PATCH_FLAG]) return true;

    const original = ui.elementAnimate;
    if (typeof original !== "function") return false;

    ui.elementAnimate = function (element, rawKeyframes, ...args) {
      try {
        if (
          element?.matches?.(".browserContainer") &&
          element.closest?.(".zen-glance-overlay") &&
          Array.isArray(rawKeyframes?.x) &&
          Array.isArray(rawKeyframes?.y) &&
          rawKeyframes.x.length > 1
        ) {
          const referenceRect =
            window.gBrowser?.tabpanels?.getBoundingClientRect();

          if (referenceRect) {
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            const targetX = (referenceRect.width - width) / 2;
            const targetY = (referenceRect.height - height) / 2;
            const isClosing = !!element.closest("[fade-out='true']");
            const last = rawKeyframes.x.length - 1;

            /*
             * Zen builds the sequence for an 80% x 100% wrapper. Neri's
             * wrapper is 90% x 90%, so the last translate is off by
             * `dx` / `dy`. Shift every frame by Zen's own eased progress
             * instead of by the keyframe index. scaleX is linear in that
             * progress, so it can be recovered exactly from the sequence.
             * This preserves the native opening easeOutBack (including its
             * small overshoot) and the native closing curve while landing
             * on the centered preview.
             */
            const scaleX = rawKeyframes.scaleX;
            const scaleStart = Array.isArray(scaleX) ? scaleX[0] : NaN;
            const scaleEnd = Array.isArray(scaleX) ? scaleX[last] : NaN;
            const scaleDelta = scaleEnd - scaleStart;
            const hasEasedProgress =
              Array.isArray(scaleX) &&
              scaleX.length === rawKeyframes.x.length &&
              Number.isFinite(scaleDelta) &&
              Math.abs(scaleDelta) > 1e-6;

            if (isClosing) {
              // Closing starts at the centered preview and ends at the link.
              const dx = targetX - rawKeyframes.x[0];
              const dy = targetY - rawKeyframes.y[0];
              for (let i = 0; i <= last; i++) {
                const eased = hasEasedProgress
                  ? (scaleX[i] - scaleStart) / scaleDelta
                  : i / last;
                const t = 1 - eased;
                rawKeyframes.x[i] += dx * t;
                rawKeyframes.y[i] += dy * t;
              }
            } else {
              // Opening ends at the centered preview, not at Zen's 80% x 100%.
              const dx = targetX - rawKeyframes.x[last];
              const dy = targetY - rawKeyframes.y[last];
              for (let i = 0; i <= last; i++) {
                const eased = hasEasedProgress
                  ? (scaleX[i] - scaleStart) / scaleDelta
                  : i / last;
                rawKeyframes.x[i] += dx * eased;
                rawKeyframes.y[i] += dy * eased;
              }
            }
          }
        }
      } catch (error) {
        console.error("[Neri] Glance arc patch failed:", error);
      }

      return original.call(this, element, rawKeyframes, ...args);
    };

    ui[PATCH_FLAG] = true;
    return true;
  }

  if (!patch()) {
    const timer = setInterval(() => {
      if (patch()) clearInterval(timer);
    }, 200);

    setTimeout(() => clearInterval(timer), 30000);
  }
})();
