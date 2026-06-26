"use client";

import { useEffect, useState, useRef } from "react";
import { onSnapshot, getDoc } from "firebase/firestore";
import { apiFetch } from "@/lib/api";
import { saveLiveStatus, liveDocRef } from "@/lib/youtube";
import type { YouTubeVideo, YouTubeLiveStatus } from "@/lib/youtube";

const CHECK_INTERVAL = 60_000;
const THROTTLE_MS = 5 * 60 * 1000;

export function useYouTubeLive(): { status: YouTubeLiveStatus; loading: boolean } {
  const [status, setStatus] = useState<YouTubeLiveStatus>({ isLive: false, video: null });
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fsDeniedRef = useRef(false); // stop retrying after first permission denial

  useEffect(() => {
    const unsub = onSnapshot(
      liveDocRef(),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setStatus({
            isLive: data.isLive || false,
            video: data.video || null,
            lastCheckedAt: data.lastCheckedAt,
            detectedAt: data.detectedAt,
          });
          // Successfully read from Firestore — permissions work
          fsDeniedRef.current = false;
        } else {
          setStatus({ isLive: false, video: null });
        }
        setLoading(false);
      },
      () => {
        // Firestore read denied — mark so the interval doesn't keep retrying writes
        fsDeniedRef.current = true;
        setStatus({ isLive: false, video: null });
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const check = async () => {
      // If Firestore permissions are blocked, skip sync to avoid constant write errors
      if (fsDeniedRef.current) return;
      try {
        const snap = await getDoc(liveDocRef());
        if (!snap.exists()) {
          await triggerSync();
          return;
        }
        const data = snap.data();
        const lastChecked = data.lastCheckedAt?.toMillis?.() || 0;
        if (Date.now() - lastChecked < THROTTLE_MS) return;
        await triggerSync();
      } catch {
        // If we get a permission error here, mark it so we stop retrying
        fsDeniedRef.current = true;
      }
    };

    // Initial check with a small delay to let onSnapshot resolve first
    const initTimer = setTimeout(check, 2000);
    timerRef.current = setInterval(check, CHECK_INTERVAL);
    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { status, loading };
}

async function triggerSync() {
  try {
    const res = await apiFetch("/api/youtube/live");
    const result = await res.json();

    if (result.isLive && result.video) {
      await saveLiveStatus({ isLive: true, video: result.video as YouTubeVideo });
    } else {
      await saveLiveStatus({ isLive: false });
    }
  } catch {
    // silent
  }
}
