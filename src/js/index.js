import {
  APP_ID,
  VERSION,
  SOCKETIO_URL
} from './config';
import FacebookController from './controller/FacebookController';
import renderer from './view/renderer';
import ls from './model/localstorage';
import io from 'socket.io-client';

const fb = new FacebookController(APP_ID, VERSION);
const socket = io(SOCKETIO_URL);

// connect to the socketio server to receive the message from facebook
socket.on('new_message', function (data) {
  console.log('new message:', data);
  updateCurrentConversation(data.message[0]);
});

// initialize the send form for our input
document.querySelector('#sendform').addEventListener('submit', sendMessage);

// first init the controller and get the FB instance 
async function init() {
  try {
    const response = await fb.init();
    if (response.status !== 'connected')
      return console.log('not connected');
    // after init, check for the token in localstorage, if not found then in the server
    // and retrieve if found or get new one
    // fb.setToken(response.authResponse.accessToken);
    let token;
    let token_from_server = 'no token';

    token = await checkForTokenInLocal();
    console.log(token);

    if (token.error) {
      // there's no token in localstorage, get it from server
      console.log('no token');
      token_from_server = JSON.parse(await checkForTokenInServer());
      if (!token_from_server) {
        // save the token
        fb.setToken(response.authResponse.accessToken);
      } else {
        console.log('token_from_server:', token_from_server);
        fb.setToken(token_from_server.response);
      }
    }
    
    // if (token_from_server !== 'no token') {
    //   console.log('saving llt in ls');
    //   fb.setToken(token_from_server); // save the token in LS
    // } else {
    //   fb.setToken(response.authResponse.accessToken);
    //   console.log('we didnt find any token saved in server');
    //   fb.setToken(await getNewLongLivedToken());
    // }

    // const declined_permissions = await checkForDeclinedPermissions();
    // console.log(declined_permissions);
    // if (declined_permissions.length !== 0) {
    //   alert('user declined: ', declined_permissions);
    // }

    // get the user pages
    await checkUserPages();
    
    // check if the user doesnt have any subed page
    // if (Object.keys(fb.user_subscribed_page).length === 0 && fb.user_subscribed_page.constructor === Object) {
    //   throw new Error('u dont have subed page');
    // }

    await checkPageConversations();

  } catch (error) {
    console.error('cant init FB api ', error);
  }
};

const checkForTokenInLocal = async () => {
  try {
    return await fb.getTokenFromLocalStorage();
  } catch (error) {
    console.log('checkForTokenInLocal error', error);
  }
}

const checkForTokenInServer = async () => {
  try {
    const response = await fb.checkBackendForToken();
    return await response.text();
  } catch (error) {
      console.log('checkForTokenInServer error', error);
  }
}

const getNewLongLivedToken = async () => {
  try {
    const long_lived_token = await fb.getLongLivedToken();
    return await long_lived_token.text();
  } catch (error) {
    console.log('getNewLongLivedToken error', error);
  }
}

const checkForDeclinedPermissions = async () => {
  try {
    return await fb.checkForDeclinedPermissions();
  } catch (error) {
    console.log('checkfordeclinedpermission error', error);
  }
} 

const getUserPages = async () => {
  try {
    const pages = await fb.getUserPages();
    console.log(pages);
    return pages;
  } catch (error) {
    console.log('getUserPages error', error);
  }
}

const checkForSubedPage = async () => {
  try {
    return await fb.checkForSubedPage();
  } catch (error) {
    console.log('checkForSubedPage error', error);
  }
}

const checkForSubedPageFromDB = async () => {
  try {
    return await fb.checkForSubedPageFromDB();
  } catch (error) {
    console.log('checkForSubedPageFromDB error', error);
  }
}

const checkForSubedPageByApi = () => {
  try {
    return fb.checkForSubedPageByApi((error, response) => {
      if (error) return console.log(error);
      return response;
    });
  } catch (error) {
    console.log('checkForSubedPageByApi error', error);
  }
}

const getPageConversations = async () => {
  try {
    return await fb.getPageConversations();
  } catch (error) {
    console.log('getPageConversations error', error);
  }
}

// IMPORTANT fix this issue: not showing the subed page if ls is empty
const checkUserPages = async () =>  {
  try {
    const pages = await getUserPages();
    var subed_page_from_api;
    if (pages.length === 0) return console.log('no pages');
    // after getting user pages, check if one of the page is subscribed
    const subed_page = await checkForSubedPage();
    console.log('subed_page', subed_page);
    if (!subed_page || subed_page.error) {
      console.log('no subed page in ls');
      // no page is subed and saved in localstorage, check in the DB then we check using the API
      const subed_page_from_db = await checkForSubedPageFromDB();
      console.log('subed page from db: ', subed_page_from_db);
      if (!subed_page_from_db || subed_page_from_db.error) {
        subed_page_from_api = checkForSubedPageByApi();
        console.log('subedpage from api', subed_page_from_api);
        console.log('pages.... ', pages);
        if (!subed_page_from_api || subed_page_from_api.error || Object.keys(subed_page_from_api).length === 0) {
          renderer.renderUserPages(pages, addListenerToPageNodes);
        } else {
          console.log('subed pagr form api');
          fb.setUserSubedPage(subed_page_from_api);
          renderer.renderUserSubedPage(subed_page_from_api, addListenerToPageNodes);
        }
      } else {
        // render the subed page we got from the db
        fb.setUserSubedPage(JSON.parse(subed_page_from_db));
        renderer.renderUserSubedPage(JSON.parse(subed_page_from_db), addListenerToPageNodes);
      }
    } else {
      fb.setUserSubedPage(subed_page);
      renderer.renderUserSubedPage(subed_page, addListenerToPageNodes);
    }

  } catch (error) {
    console.log('error checking user pages: ', error);
  }
}

const checkPageConversations = async () => {
  try {
    renderer.showLoader();
    const conversations = await getPageConversations();
    fb.getAllSenders(conversations, conversation => {
      console.log(conversation); renderer.renderPageConversation(conversation, addListenerToConversationNodes)
      });
    // after we finish rendering all the conversations, we remove the loader
    renderer.hideLoader();
    // renderer.renderPageConversations(conversations, addListenerToConversationNodes);
  } catch (error) {
    console.log('checkPageConversations error', error);
  }
  
}

/**
 * attach event listeners to the page nodes
 *
 */
const addListenerToPageNodes = () => {
  document.querySelectorAll('.sub').forEach(node => {
    node.addEventListener('click', handleSubFunction);
  });
}

/**
 * attach event listeners to the conversation nodes
 *
 */
const addListenerToConversationNodes = () => {
  document.querySelectorAll('.conversation').forEach(node => {
    node.addEventListener('click', getMessages);
  });
}

const handleSubFunction = (e) => {
  fb.handleSub(e)
    .then(response => {
      console.log('subscribe/unsubscribe:', response);
      if (response.subscribe) {
        console.log('subscribed');
        checkUserPages();
        checkPageConversations();
        saveSubedPageInDB();
      }
      else if (response.unsubscribe) {
        console.log('unsubscribe');
        renderer.renderUserPages(fb.user_pages, addListenerToPageNodes);
        renderer.clearConversationList();
        renderer.clearMessageList();
        removeSubedPageFromDB();
      }
      else {
        throw new Error(response);
      }
    })
    .catch(error => {
      console.log('error subscribe:', error);
    });
}

const saveSubedPageInDB = async () => {
  try {
    await fb.saveSubedPageInDB();
  } catch (error) {
    console.log('saveSubedPageInDB error', error);
  }
}

const removeSubedPageFromDB = async () => {
  try {
    await fb.removeSubedPageFromDB();
  } catch (error) {
    console.log('removeSubedPageFromDB error', error);
  }
}

const getMessages = (e) => {
  e.preventDefault();
  fb.getConversationMessages(e).then( async response => {
      console.log('conv messages', response);
      const sender = await ls.loadFromLocalStorage('current_sender');
      renderer.renderConversationMessages(response.messages, sender.id);
      renderer.showInput();
    })
    .catch(error => {
      console.log('conv message error ', error);
    });
}

function sendMessage (e) {
  e.preventDefault();
  // console.log(e);
  // TODO handle:
  // - message not coming from our form
  // - empty message (DONE)
  // - sending message by pressing enter (DONE)
  const form_data = new FormData(e.target);
  console.log(form_data.get('message'));
  if (form_data.get('message').trim() === '') {
    console.log('message is empty');
    alert('write something first');
    return;
  }
  fb.sendMessage(form_data, (error, response) => {
    if (error) return console.log('cant send message', error);
    renderer.renderSentMessage(form_data.get('message'), response.sender);
    document.querySelector('#sendform').reset();
  });
}

const updateCurrentConversation = (message) => {
  fb.updateConversationMessages(message, () => {
    fb.getPageConversations()
      .then(response => {
        console.log(response);
        fb.getAllSenders(response);
        renderer.renderPageConversations(response, addListenerToConversationNodes);
      })
      .catch(error => {
        console.log(error);
      });
  });
}

init();
