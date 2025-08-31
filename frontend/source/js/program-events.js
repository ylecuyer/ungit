import signals from 'signals';

const programEvents = new signals.Signal();
export default programEvents;
ungit.programEvents = programEvents;

programEvents.add(function (event) {
  ungit.logger.log('Event:', event.event);
});
