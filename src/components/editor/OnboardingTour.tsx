"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence, animate } from "framer-motion";
import { useStore } from "@/lib/store";
import { MODEL_PATH } from "@/lib/constants";

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const mouseControls = useAnimation();
  const {
    updateMaterial,
    setSelectedMaterialId,
    setIsOnboarding,
    setTransform,
    setAnimation,
    setShowOnboardingDropzone,
    setOnboardingDragOver,
    setOnboardingLoadingOverlay,
  } = useStore();
  const [hasRun, setHasRun] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Hide the panel before the first paint on first visits — avoids a flash of the panel
  useLayoutEffect(() => {
    if (!localStorage.getItem("has-seen-onboarding")) {
      setShowOnboardingDropzone(true);
    }
  }, []);

  const waitForElement = (id: string, timeout = 5000): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const el = document.getElementById(id);
        if (el) resolve(el);
        else if (Date.now() - start > timeout) resolve(null);
        else setTimeout(check, 100);
      };
      check();
    });
  };

  const waitForModelViewReady = (timeout = 30_000): Promise<void> => {
    return new Promise((resolve) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (useStore.getState().modelViewReady || Date.now() - start > timeout) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("has-seen-onboarding");
    if (saved) {
      setHasRun(true);
      return;
    }

    if (!hasRun) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        runTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasRun]);

  const runTour = async () => {
    const temporal = useStore.temporal.getState();
    temporal.pause();
    temporal.clear();
    try {
      setHasRun(true);
      setIsOnboarding(true);
      localStorage.setItem("has-seen-onboarding", "true");

      // 0. Dropzone overlay is already visible (set before first paint via useLayoutEffect)
      await new Promise((r) => setTimeout(r, 800));

      const dropzoneBox = await waitForElement("onboarding-dropzone-box");
      if (dropzoneBox) {
        // Pause after box fully settles before cursor enters
        await new Promise((r) => setTimeout(r, 1600));

        const rect = dropzoneBox.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        // Cursor rises up from below (as if carrying a file from the taskbar)
        mouseControls.set({
          x: targetX,
          y: window.innerHeight + 40,
          opacity: 1,
          scale: 1,
        });

        // Rise up into the dropzone
        await mouseControls.start({
          x: targetX,
          y: targetY,
          transition: { duration: 1.0, ease: "easeInOut" },
        });

        // Hover — highlight the dropzone
        setOnboardingDragOver(true);
        await new Promise((r) => setTimeout(r, 700));

        // Drop
        setIsClicking(true);
        await mouseControls.start({
          scale: 0.8,
          transition: { duration: 0.2 },
        });
        await new Promise((r) => setTimeout(r, 300));

        setOnboardingDragOver(false);

        // Keep the 3D hidden while UI animates in — loading overlay takes over from dropzone
        setOnboardingLoadingOverlay(true);

        // Load the default model now that the "drop" happened
        const { loadFromUrl } = await import("@/lib/modelLoader");
        await loadFromUrl(MODEL_PATH);

        setShowOnboardingDropzone(false); // dropzone box fades out; loading overlay stays
        setIsClicking(false);
        await mouseControls.start({ scale: 1, transition: { duration: 0.3 } });

        // Wait for inspector to fully slide in (150ms ready delay + 350ms animation + buffer)
        await new Promise((r) => setTimeout(r, 900));

        // Reveal the 3D — loading overlay fades out, bottom bar slides up simultaneously
        setOnboardingLoadingOverlay(false);

        // Wait until the WebGL view has synced this model (loader may set materials earlier)
        await waitForModelViewReady();
        await new Promise((r) => setTimeout(r, 700));
      }

      // 1. Move to Material Section Toggle
      const materialToggle = await waitForElement("section-material");
      if (materialToggle) {
        // Wait for the inspector panel slide-in animation to finish before reading position
        await new Promise((r) => setTimeout(r, 700));

        const rect = materialToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await mouseControls.start({
          x,
          y,
          transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        });

        // Pause before clicking so the user can see where the cursor landed
        await new Promise((r) => setTimeout(r, 300));

        setIsClicking(true);
        await mouseControls.start({
          scale: 0.8,
          transition: { duration: 0.2 },
        });

        // Read fresh state — closure values are stale since model loaded after tour started
        const { materials, selectedMaterialId } = useStore.getState();
        if (!selectedMaterialId && materials.length > 0) {
          setSelectedMaterialId(materials[0].id);
        }

        materialToggle.click();
        await new Promise((r) => setTimeout(r, 200));
        setIsClicking(false);
        await mouseControls.start({ scale: 1, transition: { duration: 0.3 } });

        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      // 2. Change Metalness
      const { materials, selectedMaterialId } = useStore.getState();
      if (materials.length > 0) {
        const matId = selectedMaterialId || materials[0].id;

        const metalnessSlider = await waitForElement("slider-metalness");
        if (metalnessSlider) {
          const mat = materials.find((m) => m.id === matId);
          const initialMetalness = mat ? mat.metalness : 0.8;

          const rect = metalnessSlider.getBoundingClientRect();
          const startX = rect.left + rect.width * 0.8;
          const y = rect.top + rect.height / 2;
          const endX = rect.left + rect.width * 0.1;

          await mouseControls.start({
            x: startX,
            y,
            transition: { duration: 0.7, ease: "easeInOut" },
          });

          // Pause on slider before dragging
          await new Promise((r) => setTimeout(r, 400));

          setIsClicking(true);
          await mouseControls.start({
            scale: 0.9,
            transition: { duration: 0.15 },
          });

          await animate(startX, endX, {
            duration: 1.0,
            ease: "easeInOut",
            onUpdate: (latest) => {
              const progress = (latest - startX) / (endX - startX);
              const val = initialMetalness - progress * initialMetalness;
              updateMaterial(matId, { metalness: val });
              mouseControls.set({ x: latest });
            },
          });

          await animate(endX, startX, {
            duration: 1.0,
            ease: "easeInOut",
            onUpdate: (latest) => {
              const progress = (latest - endX) / (startX - endX);
              const val = progress * initialMetalness;
              updateMaterial(matId, { metalness: val });
              mouseControls.set({ x: latest });
            },
          });

          setIsClicking(false);
          await mouseControls.start({
            scale: 1,
            transition: { duration: 0.3 },
          });
        }
      }

      // 3. Turn Model
      await new Promise((resolve) => setTimeout(resolve, 600));
      const inspectorWidth = 320;
      const centerX = (window.innerWidth - inspectorWidth) / 2;
      const centerY = window.innerHeight / 2;

      await mouseControls.start({
        x: centerX,
        y: centerY,
        transition: { duration: 0.8, ease: "easeInOut" },
      });

      // Brief pause before starting drag
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Read fresh animation/transform state
      const currentState = useStore.getState();
      const initialAutoRotate = currentState.animation.autoRotate;
      const initialRotation = [...currentState.transform.rotation] as [
        number,
        number,
        number,
      ];

      setAnimation({ autoRotate: false });

      setIsClicking(true);
      await mouseControls.start({ scale: 0.9, transition: { duration: 0.15 } });

      const dragDistance = 150;

      await animate(centerX, centerX - dragDistance, {
        duration: 0.9,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (latest) => {
          const p = (latest - centerX) / -dragDistance;
          const angle = (p * -Math.PI) / 2;
          setTransform({
            rotation: [
              initialRotation[0],
              initialRotation[1] + angle,
              initialRotation[2],
            ],
          });
          mouseControls.set({ x: latest });
        },
      });

      await animate(centerX - dragDistance, centerX + dragDistance, {
        duration: 1.2,
        ease: "easeInOut",
        onUpdate: (latest) => {
          const p = (latest - (centerX - dragDistance)) / (dragDistance * 2);
          const angle = -Math.PI / 2 + p * Math.PI;
          setTransform({
            rotation: [
              initialRotation[0],
              initialRotation[1] + angle,
              initialRotation[2],
            ],
          });
          mouseControls.set({ x: latest });
        },
      });

      await animate(centerX + dragDistance, centerX, {
        duration: 0.9,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (latest) => {
          const p = (latest - (centerX + dragDistance)) / -dragDistance;
          const angle = Math.PI / 2 - (p * Math.PI) / 2;
          setTransform({
            rotation: [
              initialRotation[0],
              initialRotation[1] + angle,
              initialRotation[2],
            ],
          });
          mouseControls.set({ x: latest });
        },
      });

      setIsClicking(false);
      await mouseControls.start({ scale: 1, transition: { duration: 0.3 } });
      setAnimation({ autoRotate: initialAutoRotate });

      // Finish
      await new Promise((resolve) => setTimeout(resolve, 600));
      await mouseControls.start({
        opacity: 0,
        scale: 2,
        transition: { duration: 0.8, ease: "easeInOut" },
      });
      setIsVisible(false);
    } finally {
      temporal.clear();
      temporal.resume();
    }

    setIsOnboarding(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: "50vw", y: "50vh", opacity: 0, scale: 0.5 }}
          animate={mouseControls}
          className="fixed top-0 left-0 pointer-events-none z-9999"
        >
          <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{
                scale: isClicking ? [1, 1.5, 1.2] : 1,
                opacity: isClicking ? 0.6 : 0.4,
              }}
              className="absolute inset-0 bg-primary rounded-full blur-2xl"
            />

            <motion.div
              animate={{
                scale: isClicking ? 0.5 : 1,
                boxShadow: isClicking
                  ? "0 0 20px rgba(56,222,117,0.8)"
                  : "0 0 10px rgba(56,222,117,0.4)",
              }}
              className="size-10 bg-primary/80 rounded-full blur-[2px] border border-white/40 backdrop-blur-sm"
            />

            <div className="absolute size-2 bg-white rounded-full shadow-[0_0_10px_white]" />

            <AnimatePresence>
              {isClicking && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute size-10 border-2 border-primary rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
