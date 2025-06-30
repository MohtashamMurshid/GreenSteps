import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";

export const usePedometer = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const checkAvailability = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 1);

        const pastStepCountResult = await Pedometer.getStepCountAsync(
          start,
          end
        );
        if (pastStepCountResult) {
          setCurrentStepCount(pastStepCountResult.steps);
        }

        subscription = Pedometer.watchStepCount(
          (result: Pedometer.PedometerResult) => {
            setCurrentStepCount(result.steps);
          }
        );
      }
    };

    checkAvailability();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { isPedometerAvailable, currentStepCount };
};
