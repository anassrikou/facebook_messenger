import AWN from "awesome-notifications";

const checkForPushPermission = () => {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    return false;
  }

  // Let's check whether notification permissions have already been granted
  if (Notification.permission !== "granted") {
    return false;
  }

  return true;
}

const options = {
  position: 'top-right',
  duration: 5000
};
const notifier = new AWN(options);

/**
 * this is notifier class which will handle all the notification for this app
 *
 * @export class
 * @class NotificationController
 */
export default class NotificationController {

  static showSuccessNotification(message = 'operation success') {
    notifier.success(message);
  }

  static showErrorNotification(message = 'something wrong happened') {
    console.log(message);
    notifier.alert(message);
  }

  static PushNotification(title, options = {}) {
    const notification_available = checkForPushPermission();
    if (!notification_available)
      return this.showErrorNotification('push notification not available or permission not granted');
    const notificaiton = new Notification(title, options);
  }
}