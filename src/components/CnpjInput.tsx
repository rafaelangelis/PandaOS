"use client";

import { useState } from "react";
import { maskCpfCnpj } from "@/lib/masks";

export function CnpjInput({
  defaultValue,
  className,
}: {
  defaultValue?: string | null;
  className?: string;
}) {
  const [value, setValue] = useState(maskCpfCnpj(defaultValue ?? ""));

  return (
    <input
      type="text"
      name="cnpj"
      inputMode="numeric"
      value={value}
      onChange={(e) => setValue(maskCpfCnpj(e.target.value))}
      className={className}
    />
  );
}
