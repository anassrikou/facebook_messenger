import notifier from './NotificationController';

export default class ErrorController {

  constructor() {
    this.error_codes = {
      '10' : 'API Permission Denied',
      '100': 'Server Error, try again later',
      '190': 'Access token has expired, login again.',
      '210': 'Wrong token used, login again.',
      '492': 'Session expired, login again.'
    };
  }

  handleError(error) {
    if (this.error_codes[error.code] !== null) {
      notifier.showErrorNotification(this.error_codes[error.code]);
    }
  }
}