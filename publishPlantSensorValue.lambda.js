'use strict';
var AWS = require("aws-sdk");
var sns = new AWS.SNS();

console.log('Loading function');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    event.Records.forEach((record) => {

      if (record.eventName == 'INSERT') {
          var sensordatestamp = JSON.stringify(record.dynamodb.NewImage.sensordatestamp.N);
          var sensorvalue = JSON.stringify(record.dynamodb.NewImage.sensorvalue.N);

          var d = new Date(sensordatestamp);
          var sensordate = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

          var params = {
              Subject: 'PlantSensor Reading',
              Message: 'PlantSensor value at ' + sensordate + ': ' + sensorvalue,
              TopicArn: 'arn:aws:sns:eu-west-1:911352385366:PlantSensorTopic'
          };
          sns.publish(params, function(err, data) {
              if (err) {
                  console.error("Unable to send message. Error JSON:", JSON.stringify(err, null, 2));
              } else {
                  console.log("Results from sending message: ", JSON.stringify(data, null, 2));
              }
          });
      }

    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};
