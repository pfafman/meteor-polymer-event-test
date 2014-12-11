

Router.configure
  layoutTemplate: 'layout'



#Router.map ->
#  @route '/',
#    name: 'hello'
 

Router.route '/', ->
  @render('hello')