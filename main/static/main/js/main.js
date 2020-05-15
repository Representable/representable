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
let jQuery = window.jQuery
let states = ['mi', 'tx', 'va']

jQuery(document).ready(function () {
  setUpUSAMap()
})

let setUpUSAMap = function () {
  colors = {}
  for (x in states) {
    colors[states[x]] = '#7FD9C6'
  }
  jQuery('#usa-map').vectorMap({
    map: 'usa_en',
    backgroundColor: '#FFFFFF',
    enableZoom: false,
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderOpacity: 1,
    showTooltip: true,
    selectedColor: '#00C6A6',
    hoverColor: '#00C6A6',
    colors: colors,
    onRegionClick: ignoreUnsupportedStates,
    onRegionOver: ignoreUnsupportedStates,
    onRegionSelect: function (event, code, region) {
      window.location.href = "/entry"
    },
    onLabelShow: function (event, label, code) {
      return ignoreUnsupportedStates(event, code)
    }
  });
}

const ignoreUnsupportedStates = function (event, code, region) {
  if (!states.includes(code)) {
    event.preventDefault()
  }
}
