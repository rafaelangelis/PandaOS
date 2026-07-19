"use client";

import { useState } from "react";
import { maskPhone } from "@/lib/masks";

export function PhoneInput({
  defaultValue,
  className,
}: {
  defaultValue?: string | null;
  className?: string;
}) {
  const [value, setValue] = useState(maskPhone(defaultValue ?? ""));

  return (
    <input
      type="text"
      name="phone"
      inputMode="numeric"
      value={value}
      onChange={(e) => setValue(maskPhone(e.target.value))}
      className={className}
    />
  );
}
