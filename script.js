//token 
mapboxgl.accessToken = 'Put your mapbox token key here!!!!';


//Create Map
const map = new mapboxgl.Map({
   container: 'map', //  div
   style: 'mapbox://styles/mapbox/streets-v11', 
   center: [-71.104081, 42.365554], 
   zoom: 12,
   projection: 'globe' 
});

// Get json from the mbta
async function getBusLocations(){
    const url = 'https://api-v3.mbta.com/vehicles?filter[route]=&include=trip';
    const response = await fetch(url);
    const json = await response.json();
    console.log(json.data);
    return json.data;
 }




// bus movement, waits for data from mbta
async function MoveBus(){ 
   const buses = await getBusLocations();

   buses.forEach( bus => {
       const xBus = getMarker(bus.id);        
           if(xBus){
               const marker = Object.values(xBus)[0];
               moveMarker(marker, bus);
           }else{    
                addMarker(bus, bus.id);
               }    
});     
setTimeout(MoveBus, 11000); //update rate, Dont call too offten or get banned.
}


// add markers layers
//the markers are defult but can be made custom.
let markers = [];
function addMarker(bus, id) {
   const marker = new mapboxgl.Marker()
       .setLngLat([bus.attributes.longitude, bus.attributes.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 35 })
        .setHTML('<ul><li>ID: ' + bus.attributes.label + '</li><li>Bearing: ' + bus.attributes.bearing + '</li><li>Status: ' + (bus.attributes.current_status) + '</li><li>Speed: '+(bus.attributes.speed) + '</li></ul>'))
       .addTo(map);
   const mLayer = {};
        mLayer.marker = marker;
        mLayer.id = id;
markers.push(mLayer);   
}

// Move Bus Marker
function moveMarker(marker, bus) {
marker.setLngLat([bus.attributes.longitude, bus.attributes.latitude])
}

// Get Bus Id
function getMarker(busId) {
   const playerID = markers.find(item => 
       item.id === busId
   );
return playerID;
}

//gradient line//not dynamic prob can be
const geojson = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'coordinates': [
                    [-71.104081, 42.365554],
                    [-71.09604525937269, 42.36085607733188],
                    [-71.093897, 42.359425],
                    [-71.089503, 42.350864],
                    [-71.085852, 42.343426]
                ],
                'type': 'LineString'
            }
        }
    ]
};




map.on('load', () => {
    // 'line-gradient' can only be used with GeoJSON sources
    // and the source must have the 'lineMetrics' option set to true
    map.addSource('line', {
        type: 'geojson',
        lineMetrics: true,
        data: geojson
    });

    // the layer must be of type 'line'
    map.addLayer({
        type: 'line',
        source: 'line',
        id: 'line',
        paint: {
            'line-color': 'red',
            'line-width': 14,
            // 'line-gradient' must be specified using an expression
            // with the special 'line-progress' property
            'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                'blue',
                0.1,
                'royalblue',
                0.3,
                'cyan',
                0.5,
                'lime',
                0.7,
                'yellow',
                1,
                'red'
            ]
        },
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        }
    });
});
//longitude, latitude on mosemove
map.on('mousemove', (e) => {
    document.getElementById('info').innerHTML =
    // `e.point` is the x, y coordinates of the `mousemove` event
    // relative to the top-left corner of the map.
    JSON.stringify(e.point) +
    '<br />' +
    // `e.lngLat` is the longitude, latitude geographical position of the event.
    JSON.stringify(e.lngLat.wrap());
});
//earthquakes
map.on('load', () => {
    map.addSource('earthquakes', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
    });

    map.addLayer({
        'id': 'earthquakes-layer',
        'type': 'circle',
        'source': 'earthquakes',
        'paint': {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'red',
            'circle-stroke-color': 'white'
        }
    });
});
