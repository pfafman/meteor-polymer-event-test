
Template.hello.rendered = ->
  Session.setDefault("templateEventCounter", 0)
  Session.setDefault("onclickCounter", 0)

  console.log("hello.rendered button events before", $._data($('button').get(0), "events"))

  
  $('button').on 'click', (e) ->
    console.log("jquery click event")
    Session.set("onclickCounter", Session.get("onclickCounter") + 1)

  $('paper-button').on 'click', (e) ->
    console.log("jquery click event")
    Session.set("onclickCounter", Session.get("onclickCounter") + 1)
  
  console.log("hello.rendered button events after", $._data($('button').get(0), "events"))



Template.hello.helpers
  templateEventCounter: ->
    Session.get("templateEventCounter")

  onclickCounter: ->
    Session.get("onclickCounter")

#console.log("Set up template hello", Template.hello.events)
Template.hello.events
  # Will not fire if webcomponents.js is loaded
  'click button': ->
    console.log("template click event")
    Session.set("templateEventCounter", Session.get("templateEventCounter") + 1)
  
  'click paper-button': ->
    console.log("template click event")
    Session.set("templateEventCounter", Session.get("templateEventCounter") + 1)
  

console.log("Template Hello events", Template.hello.__eventMaps)
#console.log("Template Hello  events", $._data($('button')?.get(0), "events"))
