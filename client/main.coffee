
Template.hello.rendered = ->
  Session.setDefault("templateEventCounter", 0)
  Session.setDefault("onclickCounter", 0)

  $('button').on 'click', (e) ->
    console.log("jquery click event")
    Session.set("onclickCounter", Session.get("onclickCounter") + 1)


Template.hello.helpers
  templateEventCounter: ->
    Session.get("templateEventCounter")

  onclickCounter: ->
    Session.get("onclickCounter")


Template.hello.events
  # Will not fire if webcomponents.js is loaded
  'click button': ->
    console.log("template click event")
    Session.set("templateEventCounter", Session.get("templateEventCounter") + 1)
  

