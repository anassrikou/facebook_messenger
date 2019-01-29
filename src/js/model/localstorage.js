export default {
  
  /**
   * save in localstorage by a given key name and value
   *
   * @param {string} key
   * @param {any} value
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
   * @returns promise
   */
  loadFromLocalStorage: key => {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(key) === null) resolve({ error: 'not found' });
      return resolve(JSON.parse(localStorage.getItem(key)));
    });
  },

  /**
   * delete a key/value from the localstorage by a given key
   *
   * @param {string} key
   * @returns promise
   */
  removeFromLocalStorage: key => {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(key) === null) reject({ error: 'not found' });
      return resolve(localStorage.removeItem(key));
    });
  },

  /**
   * clear the localstorage of all the saved values
   *
   */
  clearStorage: () => {
    localStorage.clear();
  }
}