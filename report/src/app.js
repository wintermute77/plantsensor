import Rickshaw from 'rickshaw';

document.addEventListener("DOMContentLoaded", function(event) {

  var graph = new Rickshaw.Graph( {
      element: document.querySelector("#chart"),
      width: 300,
      height: 200,
      series: [{
          color: 'steelblue',
          data: [
              { x: 0, y: 40 },
              { x: 1, y: 49 },
              { x: 2, y: 38 },
              { x: 3, y: 30 },
              { x: 4, y: 32 } ]
      }]
  });
  graph.render();

});
