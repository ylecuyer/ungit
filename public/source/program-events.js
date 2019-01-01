var signals = require('signals');

if (window.programEvents) {
  console.log('ProgramEvents already defined')
}
else {
  window.programEvents = new signals.Signal();

  window.programEvents.add(function(event) {
    console.log('Event:', event);
  });
}

module.exports = window.programEvents;

