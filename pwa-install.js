(function () {
  const installButton = document.querySelector("[data-pwa-install]");
  const installIcon = installButton && installButton.querySelector("svg");
  const installLabel = installButton && installButton.querySelector(".home-install-label");
  const installDescription = installButton &&
    installButton.querySelector(".home-install-description");
  if (!installButton || !installIcon || !installLabel || !installDescription) return;

  const defaultLabel = "Get the App";
  const defaultDescription = "Install our free app for easier access.";
  const installedLabel = "App Installed";
  const installedDescription =
    "Ease Your Anxiety is installed. Open it from your Home Screen.";
  const downloadIcon = installIcon.innerHTML;
  const checkIcon = '<path d="m5 12 4 4L19 6"></path>';
  const ua = navigator.userAgent || "";
  const isChrome = ua.indexOf("Chrome/") !== -1 &&
    !/(EdgA|EdgiOS|Edg|OPR|SamsungBrowser|Brave|Vivaldi)/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariIOS = isIOS && /Safari/i.test(ua) &&
    !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/i.test(ua);
  const isStandalone = (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  let deferredPrompt = null;
  let showingIOSInstructions = false;

  function showNotInstalled() {
    installButton.hidden = false;
    installIcon.innerHTML = downloadIcon;
    installLabel.textContent = defaultLabel;
    installDescription.textContent = defaultDescription;
    installDescription.style.fontSize = "";
    installButton.dataset.installState = "not-installed";
    installButton.removeAttribute("aria-label");
  }

  function showInstalled() {
    installButton.hidden = false;
    installIcon.innerHTML = checkIcon;
    installLabel.textContent = installedLabel;
    installDescription.textContent = installedDescription;
    installDescription.style.fontSize = "";
    installButton.dataset.installState = "installed";
    installButton.setAttribute("aria-label",
      installedLabel + ". " + installedDescription);
  }

  function showIOSInstructions() {
    showingIOSInstructions = true;
    installLabel.textContent = "Add to Home Screen";
    installDescription.textContent = isSafariIOS
      ? "Tap Share → Add to Home Screen."
      : "Open in Safari, then tap Share → Add to Home Screen.";
    installDescription.style.fontSize = "9px";
    installButton.dataset.installState = "ios-instructions";
    installButton.setAttribute("aria-label",
      installLabel.textContent + ". " + installDescription.textContent);
  }

  if (isStandalone) {
    showInstalled();
    return;
  }

  showNotInstalled();

  if (isIOS) {
    installButton.addEventListener("click", function () {
      if (showingIOSInstructions) {
        showingIOSInstructions = false;
        showNotInstalled();
      } else {
        showIOSInstructions();
      }
    });
    return;
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton.dataset.installState === "browser-menu") {
      showNotInstalled();
    }
  });

  installButton.addEventListener("click", async function () {
    if (!deferredPrompt) {
      installLabel.textContent = "Install from browser menu";
      installDescription.textContent = isChrome
        ? "Open Chrome's ⋮ menu, then choose Install app."
        : "Open your browser's menu and choose Install or Add to Home Screen.";
      installDescription.style.fontSize = "9px";
      installButton.dataset.installState = "browser-menu";
      return;
    }

    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") {
        showInstalled();
      }
    } catch (error) {
      showNotInstalled();
    }
  });

  window.addEventListener("appinstalled", showInstalled);
})();