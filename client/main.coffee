

Meteor.startup ->
  console.log("client startup")
  $('body').attr("unresolved", true)

  Template.body.created = ->
    console.log("body created")
    Template.body.ready = new ReactiveVar(false)


  Template.body.rendered = ->
    console.log("body rendered")
    console.log("add unresolved")
    $('body').attr("unresolved", true)
    Meteor.defer ->
      Template.body.ready.set(true)


  Template.body.helpers
    ready: ->
      console.log("ready", Template.body.ready.get())
      Template.body.ready.get()
    
