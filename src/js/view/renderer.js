const pagelist = document.querySelector('#pagelist');
const conversationlist = document.querySelector('#conversationlist');
const messagelist = document.querySelector('#messagelist');
const sendform = document.querySelector('#sendform');

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
  renderPageConversations: function(conversations, cb) {
    this.clearConversationList();
    conversations.forEach(conversation => {
      const markup = `
      <div class="chat_list">
        <div class="chat_people">
          <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png"> </div>
          <div class="chat_ib">
            <a href='#' class="conversation" data-id='${conversation.id}'> ${conversation.senders.data[0].name} </a>
          </div>
        </div>
      </div>
      `;
      conversationlist.insertAdjacentHTML('beforeend', markup);
    });
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
        <div class="${ message.from.id === sender_id ? 'incoming_msg' : 'outgoing_msg' }">
          <div class="${ message.from.id === sender_id ? 'received_msg' : 'sent_msg' }"">
            <p>${message.from.name}: ${message.message}</p>
          </div>
        </div>
      `;
      messagelist.insertAdjacentHTML('afterbegin', markup);
    });
  },

  /**
   * render the customer sent message
   *
   * @param {string} message
   * @param {string} sender
   */
  renderSentMessage: function(message, sender) {
    console.log('renderSentMessage');
    const markup = `
      <div class="outgoing_msg">
        <div class="sent_msg">
          <p>${message}</p>
        </div>
      </div>
    `;
    messagelist.insertAdjacentHTML('beforeend', markup);
  },

  /**
   * render the received message from a client
   *
   * @param {string} message
   * @param {string} sender
   */
  renderNewReceivedMessage: function(message, sender) {
    const markup = `
      <div class="incoming_msg">
        <div class="received_msg">
          <p>${sender}: ${message}</p>
        </div>
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

}