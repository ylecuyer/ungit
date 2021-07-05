window.components = window.components || {};
window.components.registered = window.components.registered || {};

exports.register = function(name, creator) {
  window.components.registered[name] = creator;
}

exports.create = function(name, args) {
  var componentConstructor = window.components.registered[name];
  if (!componentConstructor) throw new Error('No component found: ' + name);
  return componentConstructor(args);
}
