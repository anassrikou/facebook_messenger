const pagelist = document.querySelector('#pagelist');
const conversationlist = document.querySelector('.conversation__people');
const messagelist = document.querySelector('.chat__messages');
const sendform = document.querySelector('#send_form');
const loader = document.querySelector('.loader');

export default {

  /**
   * render the list of pages of a user
   *
   * @param {array} pages
   * @param {function} cb
   */
  renderUserPages: function(pages, cb) {
    this.clearPage();
    pages.forEach(page => {
      const markup = `
      <li>
        <img src=${page.picture.data.url} width="30px" />
        ${page.name} <button class="btn btn-default sub" data-id='${page.id}'> subscribe </button>
      </li>
      `;
      pagelist.insertAdjacentHTML('beforeend', markup);
    });
    cb();
  },

  /**
   * render only the subscribed page
   *
   * @param {Object} page
   * @param {function} cb
   */
  renderUserSubedPage: function(page, cb) {
    this.clearPage();
    const markup = `
      <li>
        <img src=${page.picture.data.url} width="30px" />
        ${page.name} <button class="btn btn-default sub" data-id='${page.id}'> unsubscribe </button>
      </li>
    `;
    pagelist.insertAdjacentHTML('beforeend', markup);
    cb();
  },

  /**
   * render the conversation list
   *
   * @param {array} conversations
   * @param {function} cb
   */
  renderPageConversation: function(conversation, cb) {    
      const markup = `
        <li>
          <div class="person__img">
            <img src="${conversation.senders.data[0].profile_pic}">
          </div>
          <div class="person__info">
            <a href="#" class="conversation" data-id="${conversation.id}"> ${conversation.senders.data[0].first_name} ${conversation.senders.data[0].last_name} </a>
          </div>
        </li>
      `;
      conversationlist.insertAdjacentHTML('beforeend', markup);
    
    cb();
  },

  /**
   * render the conversation messages
   *
   * @param {array} messages
   */
  renderConversationMessages: function(messages, sender_id) {
    this.clearMessageList();
    messages.data.forEach(message => {
      const markup = `
        <div class="message ${ message.from.id === sender_id ? 'them' : 'me' }">
          <p>${message.message}</p>
        </div>
      `;
      messagelist.insertAdjacentHTML('afterbegin', markup);
    });
  },

  /**
   * render the customer sent message
   *
   * @param {string} message
   */
  renderSentMessage: function(message) {
    console.log('renderSentMessage');
    const markup = `
      <div class="message me">
        <p>${message}</p>
      </div>
    `;
    messagelist.insertAdjacentHTML('beforeend', markup);
  },

  /**
   * render the received message from a client
   *
   * @param {string} message
   */
  renderNewReceivedMessage: function(message) {
    const markup = `
      <div class="message them">
        <p>${message}</p>
      </div>
    `;
    messagelist.insertAdjacentHTML('beforeend', markup);
  },

  /**
   * reset the conversation list and remove all the conversations
   *
   */
  clearConversationList: function() {
    conversationlist.innerHTML = '';
  },

  /**
   * reset the message list and remove the messages
   *
   */
  clearMessageList: function() {
    messagelist.innerHTML = '';
  },
  
  /**
   * reset the whole page and delete everything
   *
   */
  clearPage: function() {
    pagelist.innerHTML = '';
    this.clearConversationList();
    this.clearMessageList();
  },

  /**
   * make the input form appear so the user can type a message
   *
   */
  showInput: function() {
    sendform.classList.remove('hidden');
  },

  /**
   * hide the input form
   *
   */
  hideInput: function() {
    sendform.classList.add('hidden');
  },

  showLoader: function () {
    console.log('showing loader');
    loader.classList.remove('hidden');
  },

  hideLoader: function() {
    console.log('hiding loader');
    loader.classList.add('hidden');
  },

  showNoPageAlert: function() {
    const markup = `
      <li>
        you don't have any page. please create a facebook 
        <a href="https://www.facebook.com/pages/creation/" target="_blank">page</a> first.
      </li>
    `;
    pagelist.insertAdjacentHTML('beforeend', markup);
  }

}