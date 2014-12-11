
Template.dialog.rendered = ->
  console.log("dialog rendered")
  #$("#test-dialog")[0].open()


Template.dialog.events

  'click #close': (e, tmpl) ->
    console.log("close dialog")
    $("#test-dialog")[0].close()


  #'click [data-action="close-dialog"]': (e, tmpl) ->
  #  console.log("close dialog 2")
  #  $("#test-dialog")[0].close()