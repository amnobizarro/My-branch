"use strict"

const shared_bg_ipc = require('./shared_bg_ipc')
//	
// Public - Setup - Entrypoints:
function InitWithTasks_AndStartListening(tasksByName, reporting_processName, reporting_appVersion)
{ // Call this to set up the child
	// if (process.env.NODE_ENV !== 'development') {
	// 	{ // start crash reporting
	// 		const options_template = require('../reporting/crashReporterOptions.electron')
	// 		const options = JSON.parse(JSON.stringify(options_template)) // quick n dirty copy
	// 		options.crashesDirectory = "electron_child_crashReport_tmp" // this must be supplied for child processes; TODO: does this really work in prod?
	// 		options.extra.process = reporting_processName
	// 		process.crashReporter.start(options) // and child processes must access process.crashReporter
	// 	}
	// 	{ // start exception reporting
	// 		const Raven = require('raven') // we're using the Node.JS raven package here for now because of https://github.com/getsentry/raven-js/issues/812 … any downsides?
	// 		const options = require('../reporting/exceptionReporterOptions.electron')(
	// 			reporting_appVersion, 
	// 			reporting_processName
	// 		)
	// 		const sentry_dsn = options.sentry_dsn
	// 		const raven_params = 
	// 		{
	// 			autoBreadcrumbs: options.autoBreadcrumbs,
	// 			release: options.release,
	// 			environment: options.environment,
	// 			extra: options.extra
	// 		}
	// 		Raven.config(sentry_dsn, raven_params).install()
	// 	}
	// }
	//
	{ // start observing incoming messages
		process.on('message', function(m)
		{
			var payload;
			if (typeof m === 'string') {
				try {
					payload = JSON.parse(m)
				} catch (e) {
					console.error("Child couldn't parse incoming message with error" , e, "\n\nmessage:", m)
					throw e
				}
			} else if (typeof m === 'object') {
				payload = m
			} else {
				const errStr = "Child couldn't parse unrecognized typeof incoming message:" + m
				console.error(errStr)
				throw errStr
			}
			//
			shared_bg_ipc._didReceiveIPCPayload(
				tasksByName, // exposed dependency to avoid having to nest fns
				payload
			)
		})
	}
	{ // ack boot
		process.send("child is up")
	}
}
exports.InitWithTasks_AndStartListening = InitWithTasks_AndStartListening
//
// Public - Imperatives - Yielding task products
function CallBack(taskUUID, err, returnValue)
{
	shared_bg_ipc.CallBack(
		taskUUID,
		err,
		returnValue,
		function(payload)
		{
			process.send(payload)
		}
	)
}	
exports.CallBack = CallBack