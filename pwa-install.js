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
  const platformInfo = [
    navigator.userAgentData && navigator.userAgentData.platform,
    navigator.platform,
    navigator.userAgent
  ].filter(Boolean).join(" ");
  const isIOS = /iPad|iPhone|iPod|iOS/i.test(platformInfo) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = !isIOS && /Android/i.test(platformInfo);
  const isStandalone = (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  let deferredPrompt = null;
  let installationConfirmed = false;

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
    installationConfirmed = true;
    installButton.hidden = false;
    installIcon.innerHTML = checkIcon;
    installLabel.textContent = installedLabel;
    installDescription.textContent = installedDescription;
    installDescription.style.fontSize = "";
    installButton.dataset.installState = "installed";
    installButton.setAttribute("aria-label",
      installedLabel + ". " + installedDescription);
  }

  function showManualInstructions() {
    installLabel.textContent = "Install Help";

    if (isIOS) {
      installDescription.textContent =
        "Tap Share → Add to Home Screen. If unavailable, try Safari; the website still works here.";
    } else if (isAndroid) {
      installDescription.textContent =
        "No install prompt is available here. Open Ease Your Anxiety in Google Chrome on Android to install the app.";
    } else {
      installDescription.textContent =
        "The website can still be used directly in your browser.";
    }

    installDescription.style.fontSize = "9px";
    installButton.dataset.installState = "manual-install";
    installButton.setAttribute("aria-label",
      installLabel.textContent + ". " + installDescription.textContent);
  }

  function showInstallNotConfirmed() {
    installLabel.textContent = "Check your device";
    installDescription.textContent =
      "Your browser accepted the request. Check your Home Screen or app list.";
    installDescription.style.fontSize = "9px";
    installButton.dataset.installState = "install-unconfirmed";
    installButton.setAttribute("aria-label",
      installLabel.textContent + ". " + installDescription.textContent);
  }

  if (isStandalone) {
    showInstalled();
    return;
  }

  showNotInstalled();

  window.addEventListener("beforeinstallprompt", function (event) {
    if (!event || typeof event.prompt !== "function" ||
        typeof event.preventDefault !== "function") return;

    event.preventDefault();
    deferredPrompt = event;

    if (installButton.dataset.installState === "manual-install" ||
        installButton.dataset.installState === "install-unconfirmed") {
      showNotInstalled();
    }
  });

  installButton.addEventListener("click", async function () {
    if (!deferredPrompt) {
      showManualInstructions();
      return;
    }

    const promptEvent = deferredPrompt;
    deferredPrompt = null;

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice && choice.outcome === "accepted") {
        if (!installationConfirmed) showInstallNotConfirmed();
      } else {
        showNotInstalled();
      }
    } catch (error) {
      showManualInstructions();
    }
  });

  window.addEventListener("appinstalled", showInstalled);
})();