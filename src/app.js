const UI = class {

  static textarea = document.querySelector("textarea");

};



const DB = class {

  static open = () => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('appDB', 1);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        db.createObjectStore('texts', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  static saveText = async text => {
    try {
      const db = await DB.open();
      const transaction = db.transaction(['texts'], 'readwrite');
      const store = transaction.objectStore('texts');
      const data = { id: 1, text: text };
      store.put(data);
    } catch(error) {
      console.error('Errore durante il salvataggio nel database:', error);
    }
  };

  static loadText = async () => {
    try {
      const db = await DB.open();
      const transaction = db.transaction(['texts'], 'readonly');
      const store = transaction.objectStore('texts');
      const request = store.get(1);
      request.onsuccess = event => {
        const data = event.target.result;
        if (data) UI.textarea.value = data.text;
      };
    } catch(error) {
      console.error('Errore durante il salvataggio nel database:', error);
    }
  };

};



const App = class {

  static timer;

  static textAutosave = () => {
    clearTimeout(App.timer);
    DB.saveText(UI.textarea.value);
  };

  static resetAutosaveTimer = () => {
    clearTimeout(App.timer);
    App.timer = setTimeout(App.textAutosave, 1000);
  };

  static init = () => {
    if (!localStorage.getItem('testPopup')) {
      if (confirm("This app is in ALPHA state and should be used for testing purposes only."))
        localStorage.setItem('testPopup','ok');
      else
        window.location.href = "https://app.tardito.it/";
    }
    DB.loadText();
    UI.textarea.addEventListener('input', App.resetAutosaveTimer);
    window.addEventListener('unload', () => {
      DB.saveText(UI.textarea.value);
    });
  };

}



window.addEventListener("load",App.init);