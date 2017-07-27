/**
 * Transforms CSV into JSON format for RickshawJS graph data
 * Assumes input CSV format as:
 *  PlantName,SensorTimestamp,SensorValue
 */

var fs = require('fs');
var parse = require('csv-parse');

var parser = parse({delimiter: ','}, function(err, data){
  header_line = data.shift(); // discard
  transformed = data.map(function(el){
    var sensor_time = parseInt(el[1]);
    var sensor_value = parseInt(el[2]);
    return {"x": sensor_time, "y": sensor_value}
  });
  fs.writeFile('../src/data.json', JSON.stringify(transformed) , 'utf-8');
});

fs.createReadStream('data.csv').pipe(parser);
