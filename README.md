Meteor Polymer TemplateEvent Test
=================================

Testing to see how to get meteor template events to work

### Background

Once you include webcomponents.js in the header, events that are set in a meteor template stop firing in Safari and Firefox.  Chrome still works.

The only branch that seems to work is the Famous wrapped one but seems nuts to add all that to just get polymer to stop dumping the meteor template events.

Events set up via jQuery will still fire.

Example Site: http://polymer-event-test.meteor.com

### Branches

* Header insert (main branch) - Via Bower and links in head.

* Compatibility - Polymer in client compatibility

* Package - Add polymer as a package

* Inject Initial - Inject the polymer js so it loads before Meteor

* Famous Wrapped - *This one works !?!?!*

* No Polymer - Reference


