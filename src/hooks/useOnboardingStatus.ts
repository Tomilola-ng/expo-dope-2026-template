import { getOnboardingComplete, setOnboardingComplete as persistOnboardingComplete } from "@/services/onboarding-storage";
import { useCallback, useEffect, useState } from "react";

export function useOnboardingStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    getOnboardingComplete()
      .then((value) => setIsComplete(value))
      .finally(() => setIsLoading(false));
  }, []);

  const markComplete = useCallback(async () => {
    await persistOnboardingComplete(true);
    setIsComplete(true);
  }, []);

  return {
    isLoading,
    isComplete,
    markComplete,
  };
}
