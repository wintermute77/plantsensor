# Plant Sensor

A set of tools for monitoring and reporting on the output of a moisture sensor.

Currently includes:

### plantsensor.py

A python script that runs on a Raspberry Pi hooked up to a moisture sensor. Every half hour it:
* takes a reading from the sensor
* posts it to an AWS DynamoDB database

The script is run via supervisor.

To "deploy" changes to the script:

* Make changes, push to repo.
* On the Pi, run:

      sudo supervisorctl stop plantsensor
      cd ~/dev/plantsensor && git pull
      sudo supervisorctl start plantsensor

### AWS Lambda functions

#### publishPlantSensorValue.lambda.js

Triggered automatically by any new entry to the DynamoDB database.

Checks for a changed sensor value, and optionally posts a Slack message via a webhook when the value reaches key thresholds.

#### fetchPlantSensorLatestValue.lambda.js

Called via AWS API Gateway from a Slack slash-command. Currently reports the latest sensor reading.

### /report

A utility for generating a graph visualisation from records exported from DynamoDB. See `report/README.md` for more details.
