# Plant Sensor Data Visualiser

Generates a graph from plant sensor data:

https://eu-west-1.console.aws.amazon.com/dynamodb/home?region=eu-west-1#tables:selected=PlantSensor2

* Run a query where PlantName = "Adam" and SensorTime > 0
* Select all records
* Actions -> Export to .csv

Then... somehow... convert the CSV into a JSON file so that each line (e.g):
`"Adam","1501081096","439"`
becomes:
`{ x: 1501081096, y: 439 }`


## Requirements

 * [yarn](https://yarnpkg.com/lang/en/) `brew install yarn`

## Installation

`yarn install`

## Development

To start local dev server with live reload:

`yarn run start`

To build for production:

`yarn run build`
