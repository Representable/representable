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

var $root = $("html, body");

jQuery(document).ready(function() {
    authFocus();
})

$('a[href^="#"]').click(function () {
  var link = $.attr(this, "href")
  $root.animate(
    {
      scrollTop: $(link).offset().top,
    },
    500
  );

  if (link == '#login-form') {
    $('#id_login').focus();
  } else {
    $('#id_email').focus();
  }

  return false;
});

let authFocus = function() {
    if (window.location.href.indexOf('signup') > -1) {
        $('#id_email').focus();
    } else {
        $('#id_login').focus();
    }
}