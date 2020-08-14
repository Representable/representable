/*
 * Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
 *
 * This file is part of Representable
 * (see http://representable.org).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

let jQuery = window.jQuery;

jQuery(document).ready(function () {
  setUpUSAMap();
  populateStateSelectionDropdown();
});

var $root = $("html, body");

$('a[href^="#"]').click(function () {
  $root.animate(
    {
      scrollTop: $($.attr(this, "href")).offset().top,
    },
    500
  );

  return false;
});

let populateStateSelectionDropdown = function () {
  let selectElement = document.getElementById("stateSelectionDropdown");
  for (x in states) {
    let stateName = statesDatabase[states[x].toUpperCase()];
    let newOption = document.createElement("option");
    newOption.value = states[x];
    newOption.label = stateName;
    newOption.innerHTML = stateName;
    selectElement.appendChild(newOption);
  }
  jQuery("#stateSelectionDropdown").on("change", function () {
    window.location = "/state/" + this.value;
  });
};

// source: https://github.com/10bestdesign/jqvmap
let setUpUSAMap = function () {
  colors = {};
  for (x in states) {
    colors[states[x]] = "#7FD9C6";
  }
  jQuery("#usa-map").vectorMap({
    map: "usa_en",
    backgroundColor: "#FFFFFF",
    enableZoom: false,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    borderOpacity: 1,
    showTooltip: true,
    selectedColor: "#00C6A6",
    hoverColor: "#00C6A6",
    colors: colors,
    onRegionClick: ignoreUnsupportedStates,
    onRegionOver: ignoreUnsupportedStates,
    onRegionOut: ignoreUnsupportedStates,
    onRegionSelect: function (event, code, region) {
      if (jQuery("#stateSelectionDropdown").val() !== code) {
        jQuery("#stateSelectionDropdown").val(code);
      }
      if (code !== "mi") {
        window.location.href = "/entry";
      } else {
        window.location.href = "/michigan";
      }
    },
    onLabelShow: function (event, label, code) {
      return ignoreUnsupportedStates(event, code);
    },
  });
};

const ignoreUnsupportedStates = function (event, code, region) {
  if (!states.includes(code)) {
    event.preventDefault();
  } else {
    jQuery("#stateSelectionDropdown").val(code);
  }
};
