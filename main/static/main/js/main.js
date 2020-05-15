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

 jQuery(document).ready(function () {
  setUpUSAMap()
})

let setUpUSAMap = function () {
  jQuery('#usa-map').vectorMap({
    map: 'usa_en',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    enableZoom: false,
    borderWidth: 2,
    showTooltip: true,
    selectedColor: null,
    hoverColor: null,
    colors: {
      mo: '#C9DFAF',
      fl: '#C9DFAF',
      or: '#C9DFAF'
    },
    onRegionClick: function(event, code, region){
      event.preventDefault();
    }
  });
}
