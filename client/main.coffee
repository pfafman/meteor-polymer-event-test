
Meteor.startup ->
  console.log("client startup")
  $('body').attr("unresolved", true)