//##############################################################################################
// Store our API endpoint inside queryUrl
//##############################################################################################
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//##############################################################################################
// Perform a GET request to the query URL then send response to appropriate function
//##############################################################################################
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

//##############################################################################################
// Define createFeatures function
//##############################################################################################
function createFeatures(earthquakeData) {

  // Create circle marker array
  var myCircleArray = new Array();

  // For-loop through cities and make a marker for each earthquake
  for (var i = 0; i < earthquakeData.length; i++) {

    // Add coordinates
    coordinates = [earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]];
    geometry = earthquakeData[i].geometry;
    properties = earthquakeData[i].properties;

    // Add color scale based on earthquake depth
    var color = "#51D5CC";
    if (geometry.coordinates[2] > 90) {
      color = "#B9050D";
    }
    else if (geometry.coordinates[2] > 70) {
      color = "#F58828";
    }
    else if (geometry.coordinates[2] > 50) {
      color = "#F5DC28";
    }
    else if (geometry.coordinates[2] > 30) {
      color = "#3CF528";
    }
    else if (geometry.coordinates[2] > 10) {
      color = "#28F5B2";
    }
    else if (geometry.coordinates[2] < -10) {
        color = "#51B2D5";
      }

    // Add circles to map
    var myCircle = L.circle(coordinates, {
      fillOpacity: 0.5,
      color: color,
      fillColor: color,
      // Adjust radius based on earthquake magnitude
      radius: (properties.mag * 5000)
    }).bindPopup("<h1>" + properties.place + "</h1> <hr> <h3>Depth: " + geometry.coordinates[2].toFixed(2) + "</h3>");
    //Add the cricle to the array
    myCircleArray.push(myCircle);
  }

  // Create the layer for the circles
  var earthquakes = L.layerGroup(myCircleArray);

  // Define streetmap layer
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // Define darkmap layer
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our street and dark layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Add the layer to the map
  var myMap = L.map("map", {
    center: [59.64, -150.71], //over Alaska (good earthquake activity demo)
    zoom: 5,
    layers: [streetmap,earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps,overlayMaps, {
     collapsed: false
  }).addTo(myMap);

  //Create the legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  	var div = L.DomUtil.create('div', 'info legend');
  	var grades = ["-10-10", "10-30", "30-50", "50-70", "70-90", ">90"];
    var color = ["#51B2D5","#28F5B2","#3CF528","#F5DC28","#F58828","#B9050D"];

  	// loop through our density intervals and generate a label with a colored square for each interval
  	for (var i = 0; i < grades.length; i++) {
  		div.innerHTML +=
  			'<p style="margin-left: 5px">' + '<i style="background:' + color[i] + ' "></i>' + '&nbsp;&nbsp;' + grades[i]+ '<\p>';
  	}

  	return div;
  };

  //Add the legend by default
  legend.addTo(myMap)

  //Overlay listener for adding
  myMap.on('overlayadd', function(a) {
    //Add the legend
    legend.addTo(myMap);
  });

  //Overlay listener for remove
  myMap.on('overlayremove', function(a) {
    //Remove the legend
    myMap.removeControl(legend);
  });
}