// Endpoint
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var url2 = "static/data/plates.json"

// Perform GET request using USGS url
d3.json(url, function(data) {
    d3.json(url2, function(data2) {
        console.log(data.features);
        console.log(data2.features);
        createFeatures(data.features, data2.features);
    });
});

function createFeatures(earthquakeData, tectonicplatesData) {
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

    var tectonicplates = L.geoJSON(tectonicplatesData, 
        {
            color: "orange",
            fillColor: "#ffffff00",
            weight: 1
        }
    );

    // // function to filter earthquake type data
    // function typeFilter(feature, layer) {
    //     if (feature.properties.type === "earthquake") {
    //         onEachFeature: onEachFeature
    //         return true;
    //     }
    // };

    // Sending earthquakes layer to the createmap function
    createMap(earthquakes, tectonicplates);
};

function createMap(earthquakes, tectonicplates) {

    // Define map styles
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });

    var satellitemap =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var outdoors =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var google =  L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellit Map": satellitemap,
        "Grayscale": lightmap,
        "Outdoors": outdoors,
        "Google Hybrid": google
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Fault Lines": tectonicplates,
        Earthquakes: earthquakes
    };

    // Create map, giving it the lightmap and earthquakes layers to display on load
    //  [15.5994, -28.6731]
    var map = L.map("map", {
        center: [39.09, -105.71],
        zoom: 3,
        layers: [satellitemap, tectonicplates, earthquakes]
    });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // To activate the tool tip after user deselect and select Fault Lines Overlay layer
  map.on('overlayadd', function(ol) {
    //   console.log("Inside overload add function...");
    //   console.log("Name:", ol.name);
      if (ol.name === 'Fault Lines') {
        // console.log("detecting tectonicplates overload add...");
        this.removeLayer(earthquakes);
        this.addLayer(earthquakes);
      }
  });

  map.on("baselayerchange", function(bl) {
      console.log("Base Map layer changed", bl.name);
      if (bl.name === "Grayscale" || bl.name == "Outdoors") {
          lineColor = "red";
          tectonicplates.setStyle({color: lineColor});
      }
      else {
          lineColor = "orange";
          tectonicplates.setStyle({color: lineColor});
      };
      console.log(lineColor);
  });

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

