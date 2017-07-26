import Rickshaw from 'rickshaw';
import styles from './rickshaw.min.css'
import * as data from './data.json';

document.addEventListener("DOMContentLoaded", function(event) {

  var graph = new Rickshaw.Graph( {
      element: document.querySelector("#chart"),
      width: 800,
      height: 300,
      min: 400,
      renderer: 'line',
      series: [{
          color: 'steelblue',
          data: data
      }]
  });

  var x_axis = new Rickshaw.Graph.Axis.Time({
    graph: graph
  });

  var y_axis = new Rickshaw.Graph.Axis.Y({
    graph: graph,
    orientation: 'left',
    //tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axis'),
  });

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph
  });

  graph.render();

});
