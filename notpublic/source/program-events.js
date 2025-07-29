import signals from 'signals';

const programEvents = new signals.Signal();
export default programEvents;
ungit.programEvents = programEvents;

programEvents.add(function (event) {
  console.log('Event:', event.event);
});
