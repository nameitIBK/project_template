project = do ($) ->
	
	# Custom functions here
	init: ->
		console.log 'It works!'
		
# Callstack, doc.ready
$(document).ready ->
	project.init()