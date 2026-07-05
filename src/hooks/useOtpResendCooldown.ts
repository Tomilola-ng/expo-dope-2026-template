import { useCallback, useEffect, useState } from "react";

export const DEFAULT_OTP_RESEND_COOLDOWN_SECONDS = 60;

export function useOtpResendCooldown(
  initialSeconds = DEFAULT_OTP_RESEND_COOLDOWN_SECONDS,
) {
  const [countdown, setCountdown] = useState(initialSeconds);

  const startCooldown = useCallback((seconds = DEFAULT_OTP_RESEND_COOLDOWN_SECONDS) => {
    setCountdown(Math.max(0, seconds));
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  return {
    countdown,
    canResend: countdown <= 0,
    startCooldown,
  };
}
