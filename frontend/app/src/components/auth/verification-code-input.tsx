"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: VerificationCodeInputProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <InputOTP
        maxLength={length}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <InputOTPGroup>
          {Array.from({ length }, (_, index) => (
            <InputOTPSlot key={index} index={index}/>
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}