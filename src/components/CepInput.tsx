"use client";

import { useState } from "react";
import { maskCep } from "@/lib/masks";

export function CepInput({
  defaultValue,
  className,
}: {
  defaultValue?: string | null;
  className?: string;
}) {
  const [value, setValue] = useState(maskCep(defaultValue ?? ""));

  return (
    <input
      type="text"
      name="zipCode"
      inputMode="numeric"
      value={value}
      onChange={(e) => setValue(maskCep(e.target.value))}
      className={className}
    />
  );
}
