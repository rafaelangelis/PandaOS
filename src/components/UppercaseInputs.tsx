"use client";

import { useEffect } from "react";

const EXCLUDED_NAMES = new Set(["username", "q", "cliente"]);

export function UppercaseInputs() {
  useEffect(() => {
    // Setting `.value` directly on a React-controlled input goes through
    // React's own instrumented setter, which updates its internal value
    // tracker and can make React think nothing changed (skipping onChange).
    // Using the native prototype setter bypasses that instrumentation so
    // React still detects the change correctly once the event reaches it.
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    function handleInput(e: Event) {
      const target = e.target;
      const isTextInput = target instanceof HTMLInputElement && (target.type === "text" || target.type === "");
      const isTextarea = target instanceof HTMLTextAreaElement;
      if (!isTextInput && !isTextarea) return;

      const el = target as HTMLInputElement | HTMLTextAreaElement;
      if (EXCLUDED_NAMES.has(el.name) || el.dataset.noUppercase !== undefined) return;

      const upper = el.value.toUpperCase();
      if (upper === el.value) return;

      const { selectionStart, selectionEnd } = el;
      const setter = isTextarea ? nativeTextareaValueSetter : nativeInputValueSetter;
      setter?.call(el, upper);
      if (selectionStart !== null && selectionEnd !== null) {
        el.setSelectionRange(selectionStart, selectionEnd);
      }
    }

    document.addEventListener("input", handleInput, true);
    return () => document.removeEventListener("input", handleInput, true);
  }, []);

  return null;
}
