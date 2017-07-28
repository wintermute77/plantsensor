'use strict';

var https = require('https');
var util = require('util');
var queryString = require('querystring');

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var DYNAMODB_OPTIONS = {
  "table": "PlantSensor2",
  "plantName": "Adam",
}

exports.handler = function(event, context) {

    /**
     * Fetch the most recent sensor reading
     * @param  {Function} queryReturnCallback Function to call when query returns. Will receive sensor reading as param.
     * @return void
     */
    var fetchLatestSensorReading = function(queryReturnCallback){
      // fetch all sensor readings in the past hour
      var oneHourAgo = Math.floor(new Date().getTime() / 1000) - (60*60);
      var params = {
        TableName : DYNAMODB_OPTIONS.table,
        KeyConditionExpression: 'PlantName = :plantname and SensorTime > :since',
        ExpressionAttributeValues:{
          ":plantname": DYNAMODB_OPTIONS.plantName,
          ":since": oneHourAgo
        },
        ScanIndexForward: false // sort descending
      };
      docClient.query(params, function(err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          // return first (most recent) reading
          var reading = data.Items[0];
          queryReturnCallback(reading);
        }
      });
    }


    /**
     * Pad with a leading zero
     * @param  {Mixed} v Thing to be padded
     * @return {String}   Padded thing
     */
    var padTimeValue = function(v){
      return ("0" + v).slice(-2);
    }


    /**
     * Return a human-friendly time value.
     * @param  {Date} dt
     * @return {String}   Time
     */
    var getHumanTime = function(dt){
      return padTimeValue(dt.getUTCHours()) + ":" + padTimeValue(dt.getMinutes());
    }


    /**
     * Return a status message corresponding to the sensor value
     * @param  {Integer} sensorValue
     * @param  {Object} messageFields  A list of fields that can be optionally added to the message.
     * @return {String}   Message
     */
    var getSensorThresholdMessage = function(sensorValue, messageFields){
      var thresholds = [
        {"val": 350, "message": "Who, me? I'm... pretty soggy, actually. Have I just been watered?"},
        {"val": 400, "message": "Hi " + messageFields.userName +  ". Everything good here, thanks. How about you?"},
        {"val": 450, "message": "Oh, I'm fine. No, really. Thanks though."},
        {"val": 470, "message": "Hey, thanks for asking. Maybe a wee drop of water wouldn't hurt. Only a little, mind."},
        {"val": 480, "message": "Actually, I'm pretty thirsty. Yeah, I'll have whatever you're having. Cheers!"},
        {"val": 490, "message": "I thought you'd never ask! I'm parched, I tell you. Parched."},
        {"val": 500, "message": "At LAST. Do I look like a fucking cactus to you?"},
        {"val": 550, "message": "<gasp>... water... water..."}
      ];
      return thresholds.reduce(function(msg, threshold){
        return (msg === null && sensorValue < threshold.val) ? threshold.message : msg;
      }, null);
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////

    // Go!
    var helpText = "Hi there. I'm a plant. You can offer me a drink with `/plant drink` or get my latest sensor readings with `/plant status`."
    var queryData = queryString.parse(event.body); // querystring from Slack webhook
    if (queryData.text) {

      var chat = /(chat)|(drink)|(thirsty)/i;
      var status = /(stat)|(latest)/i;

      if (queryData.text.match(status)) {

        // Return a boring statement of time and sensor value
        fetchLatestSensorReading(function(reading){
          var readingTime = new Date(reading.SensorTime * 1000);
          context.succeed({
            "statusCode": 200,
            "body": "Last reading at " + getHumanTime(readingTime) + " UTC: " + reading.SensorValue
          });
        });

      }else if (queryData.text.match(chat)) {

        // Return a friendly message customised to the sensor value
        fetchLatestSensorReading(function(reading){
          var readingTime = new Date(reading.SensorTime * 1000);
          var messageFields = {
            "userName": queryData.user_name,
            "readingTime": getHumanTime(readingTime)
          }
          var bodyText = getSensorThresholdMessage(reading.SensorValue, messageFields);
          context.succeed({
            "statusCode": 200,
            "body": bodyText
          });
        });

      } else {
        // No matching control text - show help
        context.succeed({
          "statusCode": 200,
          "body": helpText
        });

      }

    } else {
      // No control text found - show help
      context.succeed({
        "statusCode": 200,
        "body": helpText
      });

    }

};
