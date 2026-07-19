"use client";

import { useEffect } from "react";

function sanitize(raw: string, kind: string) {
  if (kind === "integer") return raw.replace(/\D/g, "");

  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

export function NumericInputs() {
  useEffect(() => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;

    function handleInput(e: Event) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;

      const kind = target.dataset.numeric;
      if (kind !== "integer" && kind !== "decimal") return;

      const clean = sanitize(target.value, kind);
      if (clean === target.value) return;

      const { selectionStart, selectionEnd } = target;
      nativeInputValueSetter?.call(target, clean);
      if (selectionStart !== null && selectionEnd !== null) {
        target.setSelectionRange(Math.min(selectionStart, clean.length), Math.min(selectionEnd, clean.length));
      }
    }

    document.addEventListener("input", handleInput, true);
    return () => document.removeEventListener("input", handleInput, true);
  }, []);

  return null;
}
