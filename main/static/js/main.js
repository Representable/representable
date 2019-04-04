{% load static %}

/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', "{% static assets/particles.json' %}", function() {
  console.log('callback - particles.min.js config loaded');
});
