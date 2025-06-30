import * as Notifications from "expo-notifications";

export const scheduleDailyReminder = async () => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "GreenSteps Reminder",
      body: "Don't forget - have you reached your step goal?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20, // 8 PM
      minute: 0,
    },
  });
};

const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("You need to enable notifications in your settings.");
    return false;
  }
  return true;
};
