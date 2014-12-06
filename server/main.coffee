

ShadowDOM = '/bower_components/webcomponentsjs/ShadowDOM.js'
script = "<script src='#{ShadowDOM}'></script>"

Inject.rawHead('ShadowDOM', script)

webcomponents = '/bower_components/webcomponentsjs/webcomponents-lite.js'
script = "<script src='#{webcomponents}'></script>"

Inject.rawHead('webcomponents', script)
