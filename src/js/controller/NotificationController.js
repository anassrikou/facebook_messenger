import AWN from "awesome-notifications";

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
}