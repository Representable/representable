function toggleAngleFaq(e) {
  var collapsible = e.parentNode.getElementsByClassName('collapse')[0].id;
  $('#' + collapsible).collapse('toggle');
  if (e.innerHTML.includes("fa-angle-down")) {
    e.getElementsByClassName("dropdown-toggle-angle")[0].innerHTML = e.getElementsByClassName("dropdown-toggle-angle")[0].innerHTML.replace("fa-angle-down", "fa-angle-up");
  } else {
    e.getElementsByClassName("dropdown-toggle-angle")[0].innerHTML = e.getElementsByClassName("dropdown-toggle-angle")[0].innerHTML.replace("fa-angle-up", "fa-angle-down");
  }
}

function toggleAngle(e) {
  var collapsible = e.parentNode.getElementsByClassName('collapse')[0].id;
  $('#' + collapsible).collapse('toggle');
  if (e.innerHTML.includes("fa-angle-down")) {
    e.innerHTML = e.innerHTML.replace("fa-angle-down", "fa-angle-up");
    if (e.classList.contains("state-info-mix")) {
      mixpanel.track("State Info Viewed", {
        question_id: e.id,
      });
    }
  } else {
    e.innerHTML = e.innerHTML.replace("fa-angle-up", "fa-angle-down");
  }
}
