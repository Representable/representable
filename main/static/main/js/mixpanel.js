// Handle mixpanel code.
var properties = {
  user_type: user_type,
  member: member,
  moderator: moderator,
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
mixpanel.track_links(".campaign-new-entry", "Drive New Entry Started");
mixpanel.track_links(".new-entry", "New Entry Started");

// Thanks Page
mixpanel.track_links(
  ".thanks-submission-link",
  "Submission Link Pressed (Thanks Page)"
);
mixpanel.track_links(
  ".thanks-campaign-map",
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
