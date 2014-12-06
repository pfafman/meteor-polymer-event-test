Package.describe({
  summary: "Add Polymer to meteor Project",
  version: "0.0.1",
  git: "https://github.com/pfafman/meteor-polymer.git",
  name: 'pfafman:polymer'
});


Package.on_use(function (api) {
  api.versionsFrom("METEOR@1.0");

  api.add_files([
    'webcomponents.js'
  ], 'client');

});
