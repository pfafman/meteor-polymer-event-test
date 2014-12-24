
Template.hello.rendered = ->
  console.log("hello rendered")
  Session.setDefault("templateEventCounter", 0)
  Session.setDefault("onclickCounter", 0)
  
  $('button').on 'click', (e) ->
    console.log("jquery click event")
    Session.set("onclickCounter", Session.get("onclickCounter") + 1)

  $('paper-button').on 'click', (e) ->
    console.log("jquery click event")
    Session.set("onclickCounter", Session.get("onclickCounter") + 1)
  
  


Template.hello.helpers
  templateEventCounter: ->
    Session.get("templateEventCounter")

  onclickCounter: ->
    Session.get("onclickCounter")


Template.hello.events
  # Will not fire if webcomponents.js is loaded
  'click button': (e, tmpl) ->
    console.log("template click event")
    Session.set("templateEventCounter", Session.get("templateEventCounter") + 1)
  
  'click paper-button': (e, tmpl) ->
    console.log("template click event")
    Session.set("templateEventCounter", Session.get("templateEventCounter") + 1)

  'click #open-dialog': (e, tmpl) ->
    console.log("Open Dialog")
    #Blaze.render(Template.dialog, document.getElementById('attach'));
    $("#test-dialog")[0].open()

  'click #test-hell': (e, tmpl) ->
    console.log("hello test")
  
  

#console.log("Template Hello events", Template.hello.__eventMaps)
#console.log("Template Hello  events", $._data($('button')?.get(0), "events"))
