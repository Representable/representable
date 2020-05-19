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
let states = ['mi', 'nj', 'tx', 'va']
let statesDatabase = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AS': 'American Samoa',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District Of Columbia',
  'FM': 'Federated States Of Micronesia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'GU': 'Guam',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MH': 'Marshall Islands',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'MP': 'Northern Mariana Islands',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PW': 'Palau',
  'PA': 'Pennsylvania',
  'PR': 'Puerto Rico',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VI': 'Virgin Islands',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming'
}

jQuery(document).ready(function () {
  setUpUSAMap()
  populateStateSelectionDropdown()
})

let populateStateSelectionDropdown = function() {
  let selectElement = document.getElementById('stateSelectionDropdown')
  for (x in states) {
    let stateName = statesDatabase[states[x].toUpperCase()]
    let newOption = document.createElement('option')
    newOption.value = states[x]
    newOption.label = stateName
    newOption.innerHTML = stateName
    selectElement.appendChild(newOption)
  }
  jQuery('#stateSelectionDropdown').on('change', function() {
    window.location = '/entry'
  })
}

// source: https://github.com/10bestdesign/jqvmap
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
    onRegionOut: ignoreUnsupportedStates,
    onRegionSelect: function (event, code, region) {
      if (jQuery('#stateSelectionDropdown').val() !== code) {
        jQuery('#stateSelectionDropdown').val(code)
      }
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
  } else {
    jQuery('#stateSelectionDropdown').val(code)
  }
}
