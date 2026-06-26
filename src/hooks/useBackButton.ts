"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/", "/login"];

export function useBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const listener = await App.addListener("backButton", () => {
          // 1. Check for open modals — close them first
          const activeModal = document.querySelector(".modal-overlay.active, .onboarding-overlay, .w-detail-modal.active, .series-detail-modal.active");
          if (activeModal) {
            // Try clicking a close button
            const closeBtn = activeModal.querySelector(
              "[data-close], .modal-close, .close-btn, .series-detail-close, .w-detail-close"
            );
            if (closeBtn) {
              (closeBtn as HTMLElement).click();
            } else {
              // Remove active class to close the modal
              activeModal.classList.remove("active");
            }
            // Also notify any listening components via custom event
            window.dispatchEvent(new CustomEvent("modal-back-pressed"));
            return;
          }

          // 2. Check for custom overlay panels (e.g., notifications panel)
          const activePanel = document.querySelector(".panel-overlay.active, .notifications-panel.active");
          if (activePanel) {
            activePanel.classList.remove("active");
            return;
          }

          // 3. Navigate back — but avoid going to public pages (login)
          if (PUBLIC_PATHS.includes(pathname)) {
            // Already on a public page — minimize instead
            try { App.minimizeApp?.(); } catch { App.exitApp().catch(() => {}); }
            return;
          }

          router.back();

          // 4. Guard: after a short delay, if we ended up on a public page, redirect to dashboard
          const guardTimer = setTimeout(() => {
            const currentPath = window.location.pathname;
            if (PUBLIC_PATHS.includes(currentPath)) {
              router.replace("/dashboard");
            }
          }, 100);

          // Cancel guard if component unmounts
          const cancelGuard = () => clearTimeout(guardTimer);
          window.addEventListener("beforeunload", cancelGuard, { once: true });
        });

        unsub = () => listener.remove();
      } catch {
        // Not in Capacitor environment — nothing to do
      }
    })();

    return () => { unsub?.(); };
  }, [router, pathname]);
}
