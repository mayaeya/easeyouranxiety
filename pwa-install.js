(function () {
  const installButton = document.querySelector("[data-pwa-install]");
  const iosInstructions = document.querySelector("[data-pwa-ios-instructions]");
  const installedMessage = document.querySelector("[data-pwa-installed-message]");
  if (!installButton || !iosInstructions || !installedMessage) return;

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariIOS = isIOS && /Safari/i.test(ua) &&
    !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/i.test(ua);
  const isStandalone = (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  let deferredPrompt = null;

  function hideInstallOptions() {
    installButton.hidden = true;
    iosInstructions.hidden = true;
    installedMessage.hidden = true;
  }

  function showInstallOptions() {
    installButton.hidden = false;
    installedMessage.hidden = true;
  }

  function showInstalled(message) {
    installButton.hidden = true;
    iosInstructions.hidden = true;
    installedMessage.textContent = message ||
      "Ease Your Anxiety is installed. Open it from your Home Screen.";
    installedMessage.hidden = false;
  }

  if (isStandalone) {
    showInstalled();
    return;
  }

  if (isIOS) {
    showInstallOptions();
    iosInstructions.textContent = isSafariIOS
      ? "In Safari, tap Share → Add to Home Screen."
      : "Open this page in Safari, then tap Share → Add to Home Screen.";
    iosInstructions.hidden = false;
    installButton.addEventListener("click", function () {
      iosInstructions.scrollIntoView({ behavior: "smooth", block: "center" });
      iosInstructions.focus({ preventScroll: true });
    });
    return;
  }

  hideInstallOptions();

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    showInstallOptions();
  });

  installButton.addEventListener("click", async function () {
    if (!deferredPrompt) return;
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") {
        showInstalled("Ease Your Anxiety is being installed.");
      } else {
        installButton.hidden = true;
        installedMessage.textContent =
          "You can install Ease Your Anxiety later from your browser menu.";
        installedMessage.hidden = false;
      }
    } catch (error) {
      hideInstallOptions();
    }
  });

  window.addEventListener("appinstalled", function () {
    showInstalled();
  });
})();
