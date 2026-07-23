"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

function serializeForm(form: HTMLFormElement) {
  const entries: [string, string][] = [];
  new FormData(form).forEach((value, key) => {
    entries.push([key, value instanceof File ? `${value.name}:${value.size}` : value]);
  });
  return JSON.stringify(entries);
}

export function ConfirmSaveButton({
  formRef,
  pending,
  label = "Salvar",
  pendingLabel = "Salvando...",
  className,
  title = "Salvar alterações",
  message = "Você alterou os dados. Deseja realmente salvar?",
}: {
  formRef: RefObject<HTMLFormElement | null>;
  pending: boolean;
  label?: string;
  pendingLabel?: string;
  className?: string;
  title?: string;
  message?: string;
}) {
  const snapshotRef = useRef<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (formRef.current) {
      snapshotRef.current = serializeForm(formRef.current);
    }
  }, [formRef]);

  function handleClick() {
    if (!formRef.current) return;
    const current = serializeForm(formRef.current);
    if (snapshotRef.current !== null && current !== snapshotRef.current) {
      setConfirming(true);
    } else {
      formRef.current.requestSubmit();
    }
  }

  return (
    <>
      <button type="button" disabled={pending} onClick={handleClick} className={className}>
        {pending ? pendingLabel : label}
      </button>
      <ConfirmDialog
        open={confirming}
        title={title}
        message={message}
        confirmLabel="Salvar"
        pending={pending}
        onConfirm={() => {
          setConfirming(false);
          formRef.current?.requestSubmit();
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
