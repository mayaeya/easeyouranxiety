(function () {
  const section = document.getElementById("pwa-install-section");
  if (!section) return;

  const installButtons = Array.from(document.querySelectorAll("[data-pwa-install]"));
  const iosInstructions = section.querySelector("[data-pwa-ios-instructions]");
  const installedMessage = section.querySelector("[data-pwa-installed-message]");
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  let deferredPrompt = null;

  function setVisible(show) {
    section.hidden = !show;
    installButtons.forEach(function (button) {
      button.hidden = !show;
    });
  }

  function showInstalled(message) {
    setVisible(true);
    installButtons.forEach(function (button) {
      button.hidden = true;
    });
    if (iosInstructions) iosInstructions.hidden = true;
    if (installedMessage) {
      if (message) installedMessage.textContent = message;
      installedMessage.hidden = false;
    }
  }

  if (isStandalone) {
    showInstalled();
    return;
  }

  if (isIOS) {
    setVisible(true);
    if (iosInstructions) iosInstructions.hidden = false;
    installButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (iosInstructions) {
          iosInstructions.scrollIntoView({ behavior: "smooth", block: "center" });
          iosInstructions.focus({ preventScroll: true });
        }
      });
    });
    return;
  }

  setVisible(false);

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    setVisible(true);
  });

  installButtons.forEach(function (button) {
    button.addEventListener("click", async function () {
      if (!deferredPrompt) return;
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === "accepted") {
          showInstalled("Ease Your Anxiety is being installed.");
        } else {
          installButtons.forEach(function (item) {
            item.hidden = true;
          });
          if (installedMessage) {
            installedMessage.textContent = "You can install Ease Your Anxiety later from your browser menu.";
            installedMessage.hidden = false;
          }
        }
      } catch (error) {
        setVisible(false);
      }
    });
  });

  window.addEventListener("appinstalled", function () {
    showInstalled("Ease Your Anxiety is installed. Open it from your Home Screen.");
  });
})();
