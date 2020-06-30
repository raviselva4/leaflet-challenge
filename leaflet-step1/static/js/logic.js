// Endpoint
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform GET request using USGS url
d3.json(url, function(data) {
    createFeatures(data.features);
    console.log(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place, magnitue and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " +
          feature.properties.mag + "</p><hr><p>" + new Date(feature.properties.time) + "</p>");
    };

    function getColor(mag) {
        switch(true) {
            case (mag <= 1):
                // return "#59ed24";
                return "#40e305";
            case (mag <= 2):
                return "#c2e305";
            case (mag <= 3):
                return "#edce05";
            case (mag <= 4):
                return "#e3a549";
            case (mag <= 5):
                return "#c45704";
            case (mag > 5):
                return "#e02716";
        }
    };

    function geojsonMarkerOptions(feature)  {
        return {
            radius: feature.properties.mag * 3,
            fillColor: getColor(feature.properties.mag),
            color: "#000",
            weight: 0.5,
            fillOpacity: 1.5
        }
    };

    // Create a GeoJSON layer containing the features array on the earthquakeData object using filter type
    // Run the onEachFeature function once for each piece of data in the array
    // var earthquakes = L.geoJSON(earthquakeData, {filter:typeFilter},
    var earthquakes = L.geoJSON(earthquakeData, 
        { pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(feature));
            // return L.circleMarker(latlng, style(feature));
            },
        onEachFeature: onEachFeature
    });

    // // function to filter earthquake type data
    // function typeFilter(feature, layer) {
    //     if (feature.properties.type === "earthquake") {
    //         onEachFeature: onEachFeature
    //         return true;
    //     }
    // };

    // Sending earthquakes layer to the createmap function
    createMap(earthquakes);
};

function createMap(earthquakes) {

    // Define lightmap
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": lightmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map, giving it the lightmap and earthquakes layers to display on load
    //  [15.5994, -28.6731]
    var map = L.map("map", {
        center: [39.09, -105.71],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // Set up the legend
  var colors = ["#40e305", "#c2e305", "#edce05", "#e3a549",  "#c45704", "#e02716"];
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    // var labels = [];
    var text;
    
    for (i=0; i<6; i++) {
        var ii = i+1;
        if ((i<5) ?  text=" "+i+"-"+ ii : text=' 5+');
        // labels.push("<li style=\"background-color: " + colors[i] + "\"></li>");
        div.innerHTML += '<i style="background:' + colors[i] + '"></i>' + 
         text + '<br>';
    };

    // div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;

    };

  // Adding legent to the map
  legend.addTo(map);

};
