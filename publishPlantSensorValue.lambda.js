'use strict';

var https = require('https');
var util = require('util');

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var DYNAMODB_OPTIONS = {
  "table": "PlantSensor2",
  "plantName": "Adam",
}

var SLACK_OPTIONS = {
  "hostname":     "hooks.slack.com",
  "channel":      "#hkx-devs",
  "webhook_url":  "/services/T0J943ASX/B6CNJ6PAM/oGZhtC5oeOntJmlMm4sC4c1z",
  "username":     "PlantBot",
  "icon_emoji":   ":seedling:"
};


//console.log('Loading function publishPlantSensorValue');


exports.handler = (event, context, callback) => {

    var getPlantMessage = function(sensorvalue){
      if (sensorvalue <= 350) {
        return "Hi everyone. I'm probably a little too soggy right now. Please don't water me."
      }
      if (sensorvalue <= 400) {
        if (sensorvalue === 404) {
          return "Sensor Value 404: Plant Not Found. HAHAHAHAHAHAHAHA."
        }else{
          return "Hey guys! I'm comfortably moist. Isn't that great?"
        }
      }
      if (sensorvalue <= 420) {
        return "Plant here. Letting you know that everything is just A-OK."
      }
      if (sensorvalue <= 440) {
        return "Hey guys! How's it going? No rush, but I'm probably going to need some water soon. Just saying."
      }
      if (sensorvalue <= 460) {
        return "Guys? You're going to water me soon, right?"
      }
      if (sensorvalue <= 480) {
        return "<cough> Excuse me. May I have a glass of water?"
      }
      if (sensorvalue <= 490) {
        return "HELLOOOOO? I'M THIRSTY. GIVE ME WATER."
      }
      if (sensorvalue <= 500) {
        return "You feckless fuckers. I've got a mouth like Ghandi's flip flop. Look at me, all wilted and pathetic. You bastards."
      }
      if (sensorvalue > 500) {
        return "Hello. This is an automated message. Your plant is dead."
      }
    }

    /**
     * Fetch the previous sensor value from DynamoDB
     * @param  {Function} queryReturnCallback Function to call when query returns. Will receive sensor value as param.
     * @return void
     */
    var fetchPreviousSensorValue = function(queryReturnCallback){
      var params = {
        TableName : DYNAMODB_OPTIONS.table,
        Key: {
            "PlantName": DYNAMODB_OPTIONS.plantName,
            "SensorTime": 0
        }
      };
      docClient.get(params, function(err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          queryReturnCallback(parseInt(data.Item.SensorValue));
        }
      });
    }


    /**
     * Update the "previous" sensor value in DynamoDB
     * @param  {Int} sensorvalue The value to set
     * @return void
     */
    var updateSensorValue = function(sensorvalue){
      var params = {
        TableName : DYNAMODB_OPTIONS.table,
        Item: {
            "PlantName": DYNAMODB_OPTIONS.plantName,
            "SensorTime": 0,
            "SensorValue": sensorvalue
        },
      };
      docClient.put(params, function(err, data) {
        if (err) {
          console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
        }
      });
    }


    /**
     * Post a message to Slack via a webhook
     * @param  {String} message The message text
     * @param  {Object} context AWS Lambda runtime context. See http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
     * @return void
     */
    var postToSlack = function(message, context){

      var postData = {
        "channel": SLACK_OPTIONS.channel,
        "username": SLACK_OPTIONS.username,
        "icon_emoji": SLACK_OPTIONS.icon_emoji,
        "text": message
      };

      var httpOptions = {
        method: 'POST',
        hostname: SLACK_OPTIONS.hostname,
        port: 443,
        path: SLACK_OPTIONS.webhook_url
      };

      var req = https.request(httpOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          context.done(null, postData);
        });
      });

      req.on('error', function(e) {
        console.log('Error sending Slack message: ' + e.message);
      });

      req.write(util.format("%j", postData));
      req.end();
    }


    /**
     * Receive a new sensor value, compare it to the previous one, fire alert to Slack as necessary.
     * @param  {Object} event               DynamoDB trigger event
     * @param  {Int}    previousSensorValue
     * @return void
     */
    var processNewSensorValue = function(previousSensorValue){
      //console.log('Received event:', JSON.stringify(event, null, 2));

      event.Records.forEach((record) => {
        if (record.eventName == 'INSERT') {

          var sensorvalue = parseInt(record.dynamodb.NewImage.SensorValue.N);

          if (sensorvalue !== previousSensorValue) {
            // update "previous" sensor value
            updateSensorValue(sensorvalue);
            // if message has changed, post to Slack
            if (getPlantMessage(sensorvalue) !== getPlantMessage(previousSensorValue)) {
              postToSlack(getPlantMessage(sensorvalue), context);
            }
          }
        }
      });

      callback(null, `Successfully processed ${event.Records.length} records.`);
    }


//////////////////////////////////////////////////////////////////////////////////////////

    // Go!
    fetchPreviousSensorValue(processNewSensorValue);

};
