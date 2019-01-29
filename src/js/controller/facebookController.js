import ls from '../model/localstorage';
import renderer from '../view/renderer';

/**
 * the controller class for all the facebook operations using the FB api
 *
 * @export class
 * @class FacebookController
 */
export default class FacebookController {

  /**
   * Creates an instance of FacebookController.
   * @param {string} app_id
   * @param {string} version
   * @memberof FacebookController
   */
  constructor(app_id, version) {
    this.app_id = app_id;
    this.version = version;
    this.token = '';
    this.status = '';
    this.user_pages = [];
    this.user_subscribed_page = {};
    this.current_conversation = '';
    this.current_sender = {};
    this.senders_list = [];
  }
  /**
   * initialize the FB sdk
   *
   * @returns FB global instance
   * @memberof FacebookController
   */
  async init() {
    try {
      await FB.init({
        appId: this.app_id,
        cookie: true, // enable cookies to allow the server to access
        // the session
        xfbml: true, // parse social plugins on this page
        version: this.version // use graph api version 3.2
      });
      const response = await this.getLoginStatus();
      console.log('awaited response', response);
      FB.Event.subscribe('auth.login', this.userLoggedIn.bind(this));
      FB.Event.subscribe('auth.logout', this.userLoggedOut.bind(this));
      return response;
    } catch (e) {
      console.log('Error initializing FB: ', e);
    }
  }

  /**
   * save the token in localstorage and save it in the class instance
   *
   * @param {string} token
   * @memberof FacebookController
   */
  setToken(token) {
    if (!token) throw new Error('no token provided');
    ls.saveInLocalStorage('access_token', token);
    this.token = token;
  }
  getToken() {
    return this.token;
  }

  getTokenFromLocalStorage() {
    return ls.loadFromLocalStorage('access_token');
  }


  /**
   * save the subscribed page in localstorage and in the class instance
   *
   * @param {Object} page
   * @memberof FacebookController
   */
  setUserSubedPage(page) {
    console.log('setting subed page ', page);
    if (!page) throw new Error('no page provided');
    ls.saveInLocalStorage('subed_page', page);
    this.user_subscribed_page = page;
  }

  getUserSubedPage() {
    return this.user_subscribed_page;
  }
  setUserPages(pages) {
    if (!pages) throw new Error('no pages provided');
    ls.saveInLocalStorage('user_pages', pages);
    this.user_pages = pages;
  }

  /**
   * return the list of the user pages
   *
   * @returns promise
   * @memberof FacebookController
   */
  getUserPages() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('user_pages') === null) {
        // user doesnt have any pages cached in localstorage
        // so we send request to FB API to get them
        // then we save the result in LS
        console.log('getting user pages from api');
        FB.api('/me/accounts?fields=name,id,access_token,picture{url}', {
            'access_token': this.token
          },
          response => {
            this.setUserPages(response.data)
            if (!response || response.error) reject(response);
            resolve(response.data);
          });
      } else {
        ls.loadFromLocalStorage('user_pages')
          .then(result => {
            this.setUserPages(result);
            console.log('user page are cached in ls', this.user_pages);
            resolve(this.user_pages);
          })
          .catch(error => reject(error));
      }
    });
  }

  /**
   * return the current status of the user
   *
   * @returns promise
   * @memberof FacebookController
   */
  getLoginStatus() {
    return new Promise((resolve, reject) => {
      FB.getLoginStatus(response => {
        if (!response) reject(response);
        resolve(response);
      })
    });
  }

  /**
   * if the login status changed, will check if the token is still valid
   * and save it in the class instance
   *  
   * @param {Object} response
   * @memberof FacebookController
   */
  statusChanged(response) {
    console.log('response:', response);
    this.setToken(response.authResponse.accessToken);
    // fb.test().then(response => console.log(response)).catch(error => console.log(error));
    this.getLongLivedToken()
      .then(response => {
        console.log(response);
        this.setToken(response); // swap the short lived token with the long lived one
      })
      .catch(error => {
        console.log(error)
      });
  }

  userLoggedIn(response) {
    console.log('user logged in:', response);
  }

  /**
   * reset the class properties once the user logout
   *
   * @param {Object} response
   * @memberof FacebookController
   */
  userLoggedOut(response) {
    console.log('user logged out', response);
    this.token = '';
    this.status = '';
    this.user_pages = [];
    this.user_subscribed_page = {};
    this.current_conversation = '';
    this.current_sender = {};
    this.senders_list = [];
    ls.clearStorage();
    renderer.clearPage();
    window.location.reload();
  }

  checkForDeclinedPermissions() {
    return new Promise((resolve, reject) => {
      FB.api('/me/permissions', function(response) {
        var declined = [];
        for (let i = 0; i < response.data.length; i++) { 
          if (response.data[i].status == 'declined') {
            declined.push(response.data[i].permission);
          }
        }
        resolve(declined);
      });
    });
  }

  /**
   * return the user stored token from the server
   *
   * @returns promise
   * @memberof FacebookController
   */
  checkBackendForToken() {
    const form_data = new FormData();
    form_data.append('action', 'get');
    return fetch('http://localhost:21080/fb-callback.php', {
      method: 'POST',
      body: form_data,
    });
  }

  /**
   * request a long lived token from the back-end
   *
   * @returns promise
   * @memberof FacebookController
   */
  getLongLivedToken() {
    const form_data = new FormData();
    form_data.append('access-token', this.token);
    form_data.append('action', 'change');
    return fetch('http://localhost:21080/fb-callback.php', {
        method: 'POST',
        body: form_data,
    });
  }

  /**
   * check localstorage for saved subed page
   *
   * @returns promise
   * @memberof FacebookController
   */
  checkForSubedPage() {
    return ls.loadFromLocalStorage('subed_page');
  }

  /**
   * check all the user pages if they are subscribed using the FB api
   * 
   * @memberof FacebookController
   */
  checkForSubedPageByApi(callback) {
    this.user_pages.forEach(page => {
      console.log('looping:', page);
      FB.api(`/me/subscribed_apps`, {
        'access_token': page.access_token }, response => {
        console.log('subscribed_apps:', response.data);
        if (!response || response.error) return callback(response);
        if (response.data.length === 0) return callback({ error: 'not subed' }); // do nothing
        this.setUserSubedPage(page);
        callback(undefined, page);
      });
    });
  }

  /**
   * either subscribe or unsubscribe the page
   *
   * @param {event} e
   * @returns object
   * @memberof FacebookController
   */
  async handleSub(e) {
    console.log('event ', e);
    if (!this.user_subscribed_page) {
      console.log('handlesub: subed page not found');
      // if user_subscribed_page is empty it means there's no page subscribed
      // so any page clicked will subscribe by Default;
      const page = this.user_pages.find(page => page.id === e.target.dataset.id);
      console.log('subing ' + page.name);
      const response = await this.subscribePage(page);
      return { 'subscribe': response };
    }
    // check if the page is subscribed or not
    if (e.target.dataset.id === this.user_subscribed_page.id) {
      // page is subed, remove it
      console.log('unsubing ' + this.user_subscribed_page.name);
      const response = await this.unsubscribePage(this.user_subscribed_page);
      return { 'unsubscribe': response };
    } else {
      // page is not subed, add it
      const page = this.user_pages.find(page => page.id === e.target.dataset.id);
      console.log('subing ' + page.name);
      const response = await this.subscribePage(page);
      return { 'subscribe': response };
    }

  }

  /**
   * subscribe the page so we can get the conversation and receive client messages
   *
   * @param {Object} page
   * @returns promise
   * @memberof FacebookController
   */
  subscribePage(page) {
    return new Promise((resolve, reject) => {
      FB.api('/me/subscribed_apps?subscribed_fields=messages,messaging_postbacks',
        'post', {
          'access_token': page.access_token
        },
        response => {
          if (!response || response.error) reject(response);
          this.setUserSubedPage(page);
          resolve(response);
        });
    });
  }

  /**
   * remove the subscription of the page
   *
   * @param {Object} page
   * @returns promise
   * @memberof FacebookController
   */
  unsubscribePage(page) {
    return new Promise((resolve, reject) => {
      FB.api('/me/subscribed_apps',
        'delete', {
          'access_token': page.access_token
        },
        response => {
          if (!response || response.error) reject(response);
          ls.removeFromLocalStorage('subed_page');
          this.resetSubedPage();
          renderer.hideInput();
          resolve(response);
        });
    });
  }

  resetSubedPage() {
    this.user_subscribed_page = {};
  }

  /**
   * return a list of conversations of the subscribed page
   *
   * @returns promise
   * @memberof FacebookController
   */
  getPageConversations() {
    return new Promise((resolve, reject) => {
      FB.api('/me/conversations?fields=id,senders', {
        'access_token': this.user_subscribed_page.access_token
      }, response => {
        console.log('convo', response);
        if (response.data.length === 0) reject({
          error: 'no conversations'
        });
        resolve(response.data);
      });
    });
  }

  /**
   * make a list of all unique senders of all the conversations
   * and save them in localstorage and in class instance
   *
   * @param {array} conversations
   * @memberof FacebookController
   */
  getAllSenders(conversations) {
    let users = [];
    conversations.forEach(function (conversation) {
      conversation.senders.data.forEach(function (sender) {
        users.push(sender);
      });
    });
    // filter the list of users to keep only unique values
    this.senders_list = users.filter((user, pos, arr) => {
      return arr.map(mapObj => mapObj['id']).indexOf(user['id']) === pos;
    });
    ls.saveInLocalStorage('senders_list', this.senders_list);
  }

  /**
   * return a list of the conversation messages
   *
   * @param {event} e
   * @returns promise
   * @memberof FacebookController
   */
  getConversationMessages(e) {
    const conversation_id = e.target.dataset.id;
    renderer.showInput();
    return new Promise((resolve, reject) => {
      FB.api(`/${conversation_id}?fields=messages{message,from,to}`, {
          'access_token': this.user_subscribed_page.access_token
        },
        response => {
          if (!response || response.error) reject({
            error: response
          })
          if (response.messages.data.length === 0) reject({
            error: 'no messages'
          });
          this.makeConversationActive(conversation_id, response.messages.data[0]);
          resolve(response);
        })
    });
  }

  /**
   * save the current conversation in localstorage and in the class instance
   *
   * @param {string} conversation_id
   * @param {string} message
   * @memberof FacebookController
   */
  makeConversationActive(conversation_id, message) {
    // get the sender either from the 'from' object or 'to' object
    if (message.from.id === this.user_subscribed_page.id) {
      ls.saveInLocalStorage('current_sender', message.to.data[0]);
      this.current_sender = message.to.data[0];
    } else {
      ls.saveInLocalStorage('current_sender', message.from);
      this.current_sender = message.from;
    }
    this.current_conversation = conversation_id;
    ls.saveInLocalStorage('current_conversation', conversation_id);
  }

  /**
   * send the customer message to the client
   *
   * @param {string} message
   * @param {function} callback
   * @memberof FacebookController
   */
  async sendMessage(message, callback) {
    try {
      const conversation_id = await ls.loadFromLocalStorage('current_conversation');
      const page = this.user_subscribed_page;
      FB.api(`/${conversation_id}/messages`, 'post', {
        'access_token': page.access_token,
        'message': message.get('message')
      }, response => {
        console.log(response);
        // check if the message sent successfuly
        if (response.error) {
          callback(response.error);
        }
        callback(undefined, {
          response,
          sender: page.name
        });
      });
    } catch (error) {
      callback(error);
    }
  }

  /**
   * when receive a new message from client, update the message list
   *
   * @param {Object} message
   * @returns 
   * @memberof FacebookController
   */
  updateConversationMessages(message) {
    // check if the message is coming to this page
    const page_id = this.user_subscribed_page.id;
    if (message.recipient.id !== page_id) return;
    // check if the sender is in the sender list
    const sender = this.senders_list.find(sender => sender.id === message.sender.id);
    if (!sender) {
      // sender is not in the list, send alert
      alert('new message from new sender');
      // this.updateSendersList(message.sender.id);
    } else {
      const active_sender = this.current_sender;
      if (sender.id === active_sender.id) {
        renderer.renderNewReceivedMessage(message.message.text, sender.name);
      } else {
        alert('new message from ' + sender.name);
      }
    }
  }
  updateSendersList(sender_id) {
    FB.api(`/${sender_id}`, {
      'access_token': this.user_subscribed_page.access_token
    }, response => {
      if (!response || response.error) console.log('get new user errorr', resposne.error);
      this.senders_list.push(response);
      ls.saveInLocalStorage('senders_list', this.senders_list);
    });
  }
}