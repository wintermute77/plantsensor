# Plant Sensor Data Visualiser

Generates a graph from plant sensor data.

## Requirements

 * [yarn](https://yarnpkg.com/lang/en/) `brew install yarn`

## Installation

`yarn install`

## Development

To start local dev server with live reload:

`yarn run start`

To build for production:

`yarn run build`

## To get a data file

https://eu-west-1.console.aws.amazon.com/dynamodb/home?region=eu-west-1#tables:selected=PlantSensor2

* Run a query where PlantName = "Adam" and SensorTime > 0
* Sort _ascending_
* Select all records
* Actions -> Export to .csv
* Move to scripts folder as "data.csv"
* Run the transform tool on it: `cd report/scripts && node transform-csv.js`
