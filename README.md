Meteor Polymer TemplateEvent Test
=================================

Testing to see how to get meteor template events to work

### Background

I was finding that in a basic Meteor app with a template include that 
once you include webcomponents.js in the header, events that are set in a meteor template stop firing in Safari and Firefox.  Chrome still works.

So if you do this
```
<body>
  {{> hello}}
</body>
```
and this 
```
Template.hello.events
  # Will not fire if webcomponents.js is loaded
  'click button': ->
    console.log("template click event")
```
The template events will not fire in non chrome browsers!  Events set up via jQuery will still fire.

But if you change the template to this so the included template is in some block.
```
<body>
  <div>
    {{> hello}}
  </div>
</body>

```
then they work.


Example Site: http://polymer-event-test.meteor.com


### Branches

* Header insert (main branch) - Via Bower and links in head.

* Compatibility - Polymer in client compatibility

* Package - Add polymer as a package

* Inject Initial - Inject the polymer js so it loads before Meteor

* Famous Wrapped - *This one works !?!?!*

* No Polymer - Reference

* Iron Router 


