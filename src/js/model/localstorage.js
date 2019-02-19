export default {
  
  /**
   * save in localstorage by a given key name and value
   *
   * @param {string} key
   */
  saveInLocalStorage: (key, value) => {
    if (!value) throw new Error('no value provided');
    console.log('saving ' + key);
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * retrieve a value from localstorage 
   *
   * @param {string} key
   * @returns {any} value
   */
  loadFromLocalStorage: (key = '') => {
    console.log('key', key);
    // if (localStorage.getItem(key) === null) throw new Error(key + 'not found');
    return JSON.parse(localStorage.getItem(key));
  },

  /**
   * delete a key/value from the localstorage by a given key
   *
   * @param {string} key
   */
  removeFromLocalStorage: (key = '') => {
    console.log('key', key);
    // since this is not critical part of the operation, no need for extra check.
    localStorage.removeItem(key);
  },

  /**
   * clear the localstorage of all the saved values
   *
   */
  clearStorage: () => {
    localStorage.clear();
  }
}