"use client";

import { useEffect, useState } from "react";

export function useModalDismiss(
  dismissKey: string,
  dismissId: string,
  todayKey: string,
  delay: number = 500,
) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(dismissKey);
    if (dismissed === dismissId) return;
    const todayDismissed = localStorage.getItem(todayKey);
    if (todayDismissed === new Date().toISOString().slice(0, 10)) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(dismissKey, dismissId);
    setShow(false);
  };

  const dismissToday = () => {
    localStorage.setItem(todayKey, new Date().toISOString().slice(0, 10));
    setShow(false);
  };

  return { show, dismiss, dismissToday };
}
