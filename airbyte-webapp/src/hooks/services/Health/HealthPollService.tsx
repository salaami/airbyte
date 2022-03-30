import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { useNotificationService } from "hooks/services/Notification/NotificationService";
import { useConfig } from "config";
import { useHealthService } from "../../../services/useInitService";

const HEALTH_NOTIFICATION_ID = "health.error";
const HEALTHCHECK_MAX_COUNT = 3;

function useApiHealthPoll(): void {
  const [count, setCount] = useState(0);
  const { formatMessage } = useIntl();
  const { healthCheckInterval } = useConfig();
  const healthService = useHealthService();
  const {
    registerNotification,
    unregisterNotificationById,
  } = useNotificationService();

  useEffect(() => {
    const errorNotification = {
      id: HEALTH_NOTIFICATION_ID,
      title: formatMessage({ id: "notifications.error.health" }),
      isError: true,
    };

    const interval = setInterval(async () => {
      try {
        await healthService.health();
        if (count >= HEALTHCHECK_MAX_COUNT) {
          unregisterNotificationById(HEALTH_NOTIFICATION_ID);
        }
        setCount(0);
      } catch (e) {
        if (count < HEALTHCHECK_MAX_COUNT) {
          setCount((count) => ++count);
        } else {
          registerNotification(errorNotification);
        }
      }
    }, healthCheckInterval);

    return () => clearInterval(interval);
  }, [
    count,
    healthCheckInterval,
    formatMessage,
    unregisterNotificationById,
    registerNotification,
    healthService,
  ]);
}

export { useApiHealthPoll };
