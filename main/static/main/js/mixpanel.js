// Handle mixpanel code.
var properties = {
  user_type: user_type,
  admin: admin,
};
mixpanel.register(properties);
mixpanel.track("Page Load");

// Track Sign up, Log in, Log out started actions.
mixpanel.track_links(".sign-up-started", "Sign Up Started");
mixpanel.track_links(".log-in-started", "Log In Started");
mixpanel.track_links(".log-out-started", "Log Out Started");

// Track Sign up completed.
mixpanel.track_forms("#sign-up-form", "Sign Up Completed");

// Track Log In Completed
mixpanel.track_forms("#log-in-form", "Log In Completed");

// Track Log out completed.
mixpanel.track_forms("#log-out-form", "Log Out Completed");
// Track returning user log in.
if (is_auth == true && session_auth_state == false) {
  mixpanel.track("Log In Completed");
  mixpanel.alias(user_id);
  session_auth_state = true;
  sessionStorage.setItem("session_auth_state", true);
}

// Track Email Confirmation.
mixpanel.track_forms("#account-confirm-form", "Account Confirmed");

// Track New Entry
mixpanel.track_links(".drive-new-entry", "Drive New Entry Started");
mixpanel.track_links(".new-entry", "New Entry Started");

// Thanks Page
mixpanel.track_links(
  ".thanks-submission-link",
  "Submission Link Pressed (Thanks Page)"
);
mixpanel.track_links(
  ".thanks-drive-map",
  "Drive Map Link Pressed (Thanks Page"
);
mixpanel.track_links(
  ".thanks-send-feedback",
  "Send Feedback Link Pressed (Thanks Page)"
);

// Footer
mixpanel.track_links(
  ".footer-send-feedback",
  "Send Feedback Link Pressed (Footer)"
);

// Consent banner code

function checkUserConsent() {
  var user_consent = localStorage.getItem("user_consent");
  if (user_consent == null) {
    showConsentBanner();
    hideTrackingSettings();
  } else {
    // storage stores strings in most browsers. need to parse it.
    user_consent = JSON.parse(user_consent);
    hideConsentBanner();
    if (!user_consent) {
      // disable mixpanel tracking
      mixpanel.opt_out_tracking();
      // disable google analytics
      window["ga-disable-UA-139926191-1"] = true;
    } else {
      // enable mixpanel tracking
      mixpanel.opt_in_tracking();
      // enable google analytics
      window["ga-disable-UA-139926191-1"] = false;
      // show settings
    }
    showConsentSettings();
  }
}

function showConsentBanner() {
  var consent_banner = document.getElementById("id-consent-banner");
  consent_banner.style.display = "block";
}

function hideConsentBanner() {
  var consent_banner = document.getElementById("id-consent-banner");
  consent_banner.style.display = "none";
}

function setConsentTrue() {
  localStorage.setItem("user_consent", "true");
  hideConsentBanner();
  showConsentSettings();
}

function setConsentFalse() {
  localStorage.setItem("user_consent", "false");
  hideConsentBanner();
  showConsentSettings();
}

function showConsentSettings() {
  showTrackingSettings();
  let user_consent = localStorage.getItem("user_consent");
  user_consent = JSON.parse(user_consent);

  let opt_in_settings = document.getElementById("consent-settings-opt-in");
  let opt_out_settings = document.getElementById("consent-settings-opt-out");
  if (user_consent === true) {
    opt_in_settings.style.display = "block";
    opt_out_settings.style.display = "none";
  } else if (user_consent === false) {
    opt_in_settings.style.display = "none";
    opt_out_settings.style.display = "block";
  } else {
    opt_in_settings.style.display = "none";
    opt_out_settings.style.display = "none";
  }
}

function hideTrackingSettings() {
  let tracking_settings = document.getElementById("tracking-settings");
  if (tracking_settings != null) {
    tracking_settings.style.display = "none";
  }
}

function showTrackingSettings() {
  let tracking_settings = document.getElementById("tracking-settings");
  if (tracking_settings != null) {
    tracking_settings.style.display = "block";
  }
}
