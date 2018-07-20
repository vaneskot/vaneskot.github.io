function installWorkers() {
  let workerUrl = 'sw.js';
  navigator.serviceWorker.register(workerUrl)
    .then(registration => {
      console.log("Registration successful. Scope:", registration.scope);
    })
    .catch(error => {
      console.log("Could not register Service Worker. Error:", error);
    });
}

if ('serviceWorker' in navigator) {
  installWorkers();
}
