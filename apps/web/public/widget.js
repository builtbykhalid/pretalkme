(function () {
  var script = document.currentScript || document.querySelector('script[data-key], script[data-tenant]');
  if (!script) return;

  var publicKey = script.getAttribute('data-key') || script.getAttribute('data-tenant');
  if (!publicKey) return;

  var apiBase = new URL('/api/v1/widget', window.location.origin).toString();
  var storageKey = 'ptlk_vid';
  var visitorId = window.localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = 'vid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(storageKey, visitorId);
  }

  var state = {
    enabled: true,
    brandColor: '#16a34a',
    greeting: 'Bonjour ! Comment puis-je vous aider ?',
    name: 'Support',
    open: false,
    sessionId: null,
    messages: [],
    polling: null,
  };

  function create(tag, attrs, parent) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === 'text') {
        el.textContent = attrs[key];
      } else if (key === 'html') {
        el.innerHTML = attrs[key];
      } else if (key === 'style') {
        Object.assign(el.style, attrs[key]);
      } else if (key === 'className') {
        el.className = attrs[key];
      } else {
        el.setAttribute(key, attrs[key]);
      }
    });
    if (parent) parent.appendChild(el);
    return el;
  }

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var root = create('div', {
    id: 'ptlk-widget-root',
    style: {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '2147483647',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
  }, document.body);

  var launcher = create('button', {
    type: 'button',
    style: {
      width: '56px',
      height: '56px',
      borderRadius: '999px',
      border: 'none',
      background: state.brandColor,
      color: '#fff',
      boxShadow: '0 18px 36px rgba(0,0,0,0.22)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
    },
    title: 'Ouvrir le chat',
    html: '&#9993;',
  }, root);

  var panel = create('div', {
    style: {
      width: '360px',
      maxWidth: 'calc(100vw - 32px)',
      height: '520px',
      maxHeight: 'calc(100vh - 96px)',
      background: '#fff',
      borderRadius: '24px',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
      overflow: 'hidden',
      marginBottom: '14px',
      display: 'none',
      flexDirection: 'column',
    },
  }, root);

  var header = create('div', {
    style: {
      position: 'relative',
      background: 'linear-gradient(135deg, ' + state.brandColor + ', #0f766e)',
      color: '#fff',
      padding: '16px',
    },
  }, panel);

  create('div', {
    style: {
      fontSize: '15px',
      fontWeight: '700',
      marginBottom: '4px',
    },
    text: state.name,
  }, header);

  var greetingEl = create('div', {
    style: {
      fontSize: '13px',
      lineHeight: '1.45',
      opacity: '0.95',
    },
    text: state.greeting,
  }, header);

  var closeBtn = create('button', {
    type: 'button',
    style: {
      position: 'absolute',
      right: '16px',
      top: '16px',
      border: 'none',
      background: 'rgba(255,255,255,0.16)',
      color: '#fff',
      width: '32px',
      height: '32px',
      borderRadius: '999px',
      cursor: 'pointer',
    },
    text: '×',
    title: 'Fermer',
  }, header);

  var messages = create('div', {
    style: {
      flex: '1',
      padding: '16px',
      overflowY: 'auto',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
  }, panel);

  var composer = create('form', {
    style: {
      display: 'flex',
      gap: '10px',
      padding: '14px',
      borderTop: '1px solid #e2e8f0',
      background: '#fff',
    },
  }, panel);

  var input = create('input', {
    type: 'text',
    placeholder: 'Écrivez votre message...'
  }, composer);
  input.style.cssText = 'flex:1;border:1px solid #dbe3ea;border-radius:999px;padding:12px 16px;font-size:14px;outline:none;';

  var sendBtn = create('button', {
    type: 'submit',
    text: 'Envoyer'
  }, composer);
  sendBtn.style.cssText = 'border:none;border-radius:999px;padding:0 18px;background:' + state.brandColor + ';color:#fff;font-weight:700;cursor:pointer;';

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addBubble(text, mine) {
    var bubble = create('div', {
      text: text,
      style: {
        maxWidth: '82%',
        alignSelf: mine ? 'flex-end' : 'flex-start',
        background: mine ? state.brandColor : '#fff',
        color: mine ? '#fff' : '#0f172a',
        borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 14px',
        fontSize: '14px',
        lineHeight: '1.45',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
        border: mine ? 'none' : '1px solid #e2e8f0',
        whiteSpace: 'pre-wrap',
      },
    }, messages);
    scrollToBottom();
    return bubble;
  }

  function renderMessages(list) {
    messages.innerHTML = '';
    if (!list || !list.length) {
      addBubble(state.greeting, false);
      return;
    }

    list.forEach(function (message) {
      var content = message.content || message.text || '';
      if (!content) return;
      addBubble(content, message.direction === 'outbound');
    });
  }

  async function fetchJson(url, options) {
    var response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Widget API error: ' + response.status);
    }
    return response.json();
  }

  async function initSession() {
    var config = await fetchJson(apiBase + '/config/' + encodeURIComponent(publicKey));
    if (!config || config.enabled === false) {
      launcher.style.display = 'none';
      return;
    }

    state.enabled = true;
    state.brandColor = config.brand_color || state.brandColor;
    state.greeting = config.greeting || state.greeting;
    state.name = config.name || state.name;
    header.style.background = 'linear-gradient(135deg, ' + state.brandColor + ', #0f766e)';
    greetingEl.textContent = state.greeting;
    sendBtn.style.background = state.brandColor;
    launcher.style.background = state.brandColor;

    var session = await fetchJson(apiBase + '/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: publicKey,
        visitorId: visitorId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });

    state.sessionId = session.id || session.session_id || null;
    if (!state.sessionId) return;

    var initialMessages = await fetchJson(apiBase + '/messages/' + encodeURIComponent(state.sessionId));
    state.messages = initialMessages || [];
    renderMessages(state.messages);
  }

  async function refreshMessages() {
    if (!state.sessionId || !state.open) return;
    try {
      var latest = await fetchJson(apiBase + '/messages/' + encodeURIComponent(state.sessionId));
      state.messages = latest || [];
      renderMessages(state.messages);
    } catch (error) {
      console.error('[Pretalk Widget] refresh failed', error);
    }
  }

  function openPanel() {
    state.open = true;
    panel.style.display = 'flex';
    launcher.style.display = 'none';
    if (!state.polling) {
      state.polling = window.setInterval(refreshMessages, 3000);
    }
    setTimeout(function () { input.focus(); }, 0);
  }

  function closePanel() {
    state.open = false;
    panel.style.display = 'none';
    launcher.style.display = 'flex';
    if (state.polling) {
      window.clearInterval(state.polling);
      state.polling = null;
    }
  }

  launcher.addEventListener('click', function () {
    if (!state.enabled) return;
    if (state.open) {
      closePanel();
      return;
    }
    openPanel();
  });

  closeBtn.addEventListener('click', closePanel);

  composer.addEventListener('submit', async function (event) {
    event.preventDefault();
    var text = (input.value || '').trim();
    if (!text || !state.sessionId) return;

    input.value = '';
    addBubble(text, true);

    try {
      await fetchJson(apiBase + '/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          visitorId: visitorId,
          publicKey: publicKey,
          text: text,
        }),
      });

      setTimeout(refreshMessages, 250);
    } catch (error) {
      console.error('[Pretalk Widget] send failed', error);
      addBubble('Impossible d’envoyer le message pour le moment.', false);
    }
  });

  initSession().catch(function (error) {
    console.error('[Pretalk Widget] init failed', error);
    launcher.style.display = 'none';
  });
})();