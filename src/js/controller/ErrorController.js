errors = {
    '10' : 'API Permission Denied',
    '190': 'Access token has expired',
    '210': 'Wrong token used',
    '492': 'Session expired'
};

export default {
  handleError: (code) => {
    if (errors[code] !== null) {
      return errors[code];
    }
  }
}