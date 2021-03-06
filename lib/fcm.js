var admin = require("firebase-admin");
function FCM(key, appName) {
	var myFirebaseApp
	if (!key) {
		throw Error('Please provide the key file!');
	} else if (appName) {
		if (admin.apps.length > 0) {
			myFirebaseApp = admin.apps.find(function(app) {
				return app.name === appName
			})
		}
		if (!myFirebaseApp) {
			myFirebaseApp = admin.initializeApp({
				credential: admin.credential.cert(key)
			}, appName);
		}
	} else if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(key)
		});
	}

	this.send = function(payload, callback){
		if (!callback) {
				throw Error('Please provide a callback function');
		} else {
			if (!payload) callback(new Error('Please provide message object'))
			else {
				// See documentation on defining a message payload.
				// var message = {
				//   data: {
				//     score: '850',
				//     time: '2:45'
				//   },
				//   token: registrationToken
				// };

				// Send a message to the device corresponding to the provided
				// registration token.
				admin.messaging(myFirebaseApp).send(payload)
					.then((response) => {
						// Response is a message ID string.
						callback(null,response)
						console.log('Successfully sent message:', response);
					})
					.catch((error) => {
						callback(error)
						console.log('Error sending message:', error);
					});
			}
		}
	}

	var multipleTokens = function(i, tokens, payload, arrayResult, callback) {
		if (tokens.length > i) {
			payload['token'] =  tokens[i];
			var arrayObj = {
					token : payload.token
			};
			admin.messaging(myFirebaseApp).send(payload)
				.then((response) => {
					arrayObj.response = 'Successfully sent message:'+ response;
					arrayResult.push(arrayObj);
					i = i + 1;
					multipleTokens(i, tokens, payload, arrayResult, callback);
					//console.log(arrayResult);
				})
			.catch((error) => {
				console.warn('Error sending message:', error);
				arrayObj.response = 'Error sending message:', error;
				arrayResult.push(arrayObj);
				i = i + 1;
				multipleTokens(i, tokens, payload, arrayResult, callback);
				//console.log(arrayResult);
			});
		} else {
			callback(arrayResult)
		}
	}

	this.sendToMultipleToken = function(payload, tokens, callback) {
		multipleTokens(0, tokens, payload, [], function(response) {
			callback(null, response);
		})
	}

	this.subscribeToTopic = function(registrationTokens, topic, callback) {
		admin.messaging(myFirebaseApp).subscribeToTopic(registrationTokens, topic)
			.then(function(response) {
				// See the MessagingTopicManagementResponse reference documentation
				// for the contents of response.
				callback(null,response)
				console.log('Successfully subscribed to topic:', response);
			})
			.catch(function(error) {
				callback(error)
				console.log('Error subscribing to topic:', error);
			});
	}

	this.unsubscribeFromTopic = function(registrationTokens, topic, callback) {
		admin.messaging(myFirebaseApp).unsubscribeFromTopic(registrationTokens, topic)
			.then(function(response) {
				// See the MessagingTopicManagementResponse reference documentation
				// for the contents of response.
				callback(null,response)
				console.log('Successfully unsubscribed to topic:', response);
			})
			.catch(function(error) {
				callback(error)
				console.log('Error unsubscribing to topic:', error);
			});
	}

	var multipleTopics = function(i, topics, payload, arrayResult, callback) {
		if (topics.length > i) {
			payload['topic'] =  topics[i];
			var arrayObj = {
					topic : payload.topic
			};
			admin.messaging(myFirebaseApp).send(payload)
				.then((response) => {
					arrayObj.response = 'Successfully sent message:'+ response;
					arrayResult.push(arrayObj);
					i = i+1;
					multipleTopics(i, topics, payload, arrayResult, callback);
					//console.log(arrayResult);
				})
			.catch((error) => {
				arrayObj.response = 'Error sending message:', error;
				arrayResult.push(arrayObj);
				i = i+1;
				multipleTopics(i, topics, payload, arrayResult, callback);
				//console.log(arrayResult);
			});
		} else {
			callback(arrayResult)
		}
	}

	this.sendToMultipleTopic = function(payload, topics, callback) {
		multipleTopics(0, topics, payload, [], function(response) {
			callback(null, response);
		})
	}
}

module.exports = FCM;
