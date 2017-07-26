'use strict';

var https = require('https');
var util = require('util');

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
      var oneHourAgo = Math.floor(new Date().getTime() / 1000) - (60*60);
      var params = {
        TableName : DYNAMODB_OPTIONS.table,
        KeyConditionExpression: 'PlantName = :plantname and SensorTime > :oneHourAgo',
        ExpressionAttributeValues:{
            ":plantname": DYNAMODB_OPTIONS.plantName,
            ":oneHourAgo": oneHourAgo
        },
        ScanIndexForward: false
      };
      docClient.query(params, function(err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            var reading = data.Items[0];
            queryReturnCallback(reading);
        }
      });
    }


    var padTimeValue = function(v){
        return ("0" + v).slice(-2);
    }

    fetchLatestSensorReading(function(reading){
        var readingDate = new Date(reading.SensorTime * 1000);
        var bodyText = "At " + padTimeValue(readingDate.getUTCHours()) + ":" + padTimeValue(readingDate.getMinutes()) + " UTC the sensor reading was " + reading.SensorValue;
        var response = {
          "statusCode": 200,
          "body": bodyText
        }
        context.succeed(response);
    });


};
