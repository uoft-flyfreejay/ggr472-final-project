/*--------------------------------------------------------------------
INITIALIZE MAP
--------------------------------------------------------------------*/
mapboxgl.accessToken = 'pk.eyJ1IjoiZmx5ZnJlZWpheSIsImEiOiJjbHI3emdhZzUyamtqMmpteXNtaGJxbGVyIn0.SrkrFYfxjCieaBwWWdMb-w'; //ADD YOUR ACCESS TOKEN HERE

const map = new mapboxgl.Map({
    container: 'map',
    style: '', // or select existing mapbox style - https://docs.mapbox.com/api/maps/styles/
    zoom: 13,
    center: [-79.3832, 43.6532], // Toronto coordinates (Longitude, Latitude)
    maxBounds: [
        [-180, 30], // Southwest
        [-25, 84]  // Northeast
    ],
});


/*--------------------------------------------------------------------
ADDING MAPBOX CONTROLS AS ELEMENTS ON MAP
--------------------------------------------------------------------*/
// Add search control to map overlay
// Requires plugin as source in HTML
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: "ca" // Limit to Canada only
    })
);

// Add zoom and rotation controls to the top left of the map
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());


let restaurantsjson;


// Fetch GeoJSON from URL and store response
fetch('https://raw.githubusercontent.com/uoft-flyfreejay/ggr472-final-project/main/data/tor_restaurants.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        restaurantsjson = response; // Store geojson as variable using URL from fetch response
    });



/*--------------------------------------------------------------------
ADD DATA AS CHOROPLETH MAP ON MAP LOAD
Use get expression to categorise data based on population values
Same colours and threshold values are used in hardcoded legend
--------------------------------------------------------------------*/
// Add data source and draw i   nitial visiualization of layer
map.on('load', () => {
    map.addSource('restaurants', {
        type: 'geojson',
        data: restaurantsjson
    });

    // Add a layer for restaurants to display the data
    map.addLayer({
        id: 'restaurants-layer',
        type: 'circle',
        source: 'restaurants',
        paint: {
            'circle-color': [
                'match',
                ['get', 'cuisine'], 
                'korean', '#FF0000', // Red for Korean

                'japanese', '#800080', // Purple for Japanese
                'sushi', '#800080', // Purple for Sushi

                'chinese', '#FFA500', // Orange for Chinese
                'asian', '#FFA500', // Orange for Asian

                'italian', '#008000', // Green for Italian
                'german', '#008000', // Green for German
                'french', '#008000', // Green for French


                'turkish', '#FF4500', // OrangeRed for Turkish

                'burger', '#0000FF', // Blue for burgers
                'pizza', '#0000FF', // Blue for pizza
                'fried chicken', '#0000FF', // Blue for fried chicken
                'american', '#0000FF', // Blue for American
                'steak_house', '#0000FF', // Blue for steak houses
                'breakfast', '#0000FF', // Blue for breakfast
                'chicken', '#0000FF', // Blue for chicken

                'salad', '#00FF00', // Lime for salads

                //use different colour thats not yellow
                'thai',  '#FFD700', // Gold for Thai
                'vietnamese', '#FFD700', // Yellow for Vietnamese
                'malaysian', '#FFD700', // Yellow for Malaysian
                'filipino', '#FFD700', // Yellow for Filipino

                'indian', '#FF1493', // DeepPink for Indian

                'ethiopian', '#800000', // Maroon for Ethiopian
                /* default color */ '#808080' // Grey for anything else not listed
            ],
            'circle-radius': 6
        }
    });
});


/*--------------------------------------------------------------------
ADD POP ON HOVER
--------------------------------------------------------------------*/
const restaurantLayers = ['restaurants-layer'];

let popup = null; // This variable will hold the currently displayed popup

restaurantLayers.forEach(function(layerId) {
    // When the user moves their mouse over the layer, show the popup
    map.on('mouseenter', layerId, function(e) {
        var properties = e.features[0].properties;
        var coordinates = e.features[0].geometry.coordinates.slice();
  
        var description = `<h3>${properties.name}</h3>`;

        // Check if the type of cuisine exists and adds to description
        if (properties.cuisine !== undefined) {
            description += `<p>Cuisine: ${properties.cuisine}</p>`;
        }
        
        // Check if the "diet:vegetarian" property exists and set to yes or if the cuisine is salad
        if (properties['diet:vegetarian'] && properties['diet:vegetarian'].toLowerCase() === 'yes') {
            description += '<p><strong>This restaurant offers vegetarian options.</strong></p>'; 
        }
        else if (properties.cuisine && properties.cuisine.toLowerCase() === 'salad') {
            description += '<p><strong>This restaurant offers vegetarian options.</strong></p>';
        }

        // Check if the diet:halal property exists and set to yes
        if (properties['diet:halal'] && properties['diet:halal'].toLowerCase() === 'yes') {
            description += '<p><strong>This restaurant offers halal options.</strong></p>';
        }
        // Check if the address property exists and adds to description
        if ((properties["addr:housenumber"] && properties["addr:street"]&& properties["addr:city"]) !== undefined) {
           description += `<p> Address: ${properties["addr:housenumber"] +' '+ properties["addr:street"] +', '+ properties["addr:city"]}</p>`;
        }
        // Check if the restaurant hours exists and adds to description
        if (properties["opening_hours"] !== undefined) {
            description += `<p> Hours: ${properties["opening_hours"]}</p>`;
        }
        // Check if the phone # exists and adds to description
        if (properties.phone !== undefined) {
            description += `<p> Phone #: ${properties.phone}</p>`;
         }

        // Initialize or set the popup's content and location
        if (!popup) {
            popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
        }
        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // When the mouse leaves the layer, remove the popup
    map.on('mouseleave', layerId, function() {
        if (popup) {
            popup.remove();
            popup = null; // Ensure the popup can be recreated next time the mouse enters
        }
    });
});

/*--------------------------------------------------------------------
ADD LEGEND
--------------------------------------------------------------------*/
const legendItems = [
    { color: '#FF0000', label: 'Korean' },
    { color: '#800080', label: 'Japanese ' },
    { color: '#FFA500', label: 'Chinese / Asian' },
    { color: '#008000', label: 'European' },
    { color: '#FF4500', label: 'Middle Eastern' },
    { color: '#0000FF', label: 'Western' },
    { color: '#00FF00', label: 'Salad' },
    { color: '#FFD700', label: 'Southeast Asian' },
    { color: '#FF1493', label: 'Indian' },
    { color: '#800000', label: 'African' },
    { color: '#808080', label: 'Other' },
];


const legend = document.getElementById('legend');

legendItems.forEach(item => {
    const entry = document.createElement('div');
    const key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = item.color;

    const value = document.createTextNode(item.label);
    
    entry.appendChild(key);
    entry.appendChild(value);
    legend.appendChild(entry);
});


/*--------------------------------------------------------------------
ADD A FILTER TOGGLE
--------------------------------------------------------------------*/
document.getElementById('legendcheck').addEventListener('change', function() {
    document.getElementById('legend').style.display = this.checked ? 'block' : 'none'; // Change display of legend based on check box
});

let filterValue = '';

document.getElementById('dietset').addEventListener('change', function() {
    filterValue = document.getElementById('diet').value;

    console.log(filterValue); // Useful for testing whether correct values are returned from dropdown selection

    if (filterValue == 'All') {
        map.setFilter(
            'restaurants-layer',
            ['has', 'name'] // Returns all points from layer that have a value in field
        );
    } else {
        map.setFilter(
            'restaurants-layer',
            ['==', ['get', filterValue], 'yes' || 'only'] // returns points with value that matches dropdown selection
        );
    }   
});

let ethnoValue;

document.getElementById('ethnicityset').addEventListener('change', function() {
    ethnoValue = document.getElementById('ethno').value;

    console.log(ethnoValue); // Useful for testing whether correct values are returned from dropdown selection

    if ((ethnoValue == 'All' && filterValue === undefined)||(ethnoValue == 'All' && filterValue === 'All')) {
        map.setFilter(
            'restaurants-layer',
            ['has', 'cuisine'] // Returns all points from layer that have a value in field
        );
    } else if (ethnoValue == 'All' && filterValue !== undefined) {
        map.setFilter(
            'restaurants-layer', ['all',
            ['has', 'cuisine'],
            ['==', ['get', filterValue], 'yes' || 'only'] // returns points with value that matches dropdown selection
        ]);
    }else if ((filterValue === undefined)|| (filterValue === 'All')){
        map.setFilter(
            'restaurants-layer',
            ['==', ['get', 'cuisine'], ethnoValue] // returns points with value that matches dropdown selection
        );
    }else {
        map.setFilter(
            'restaurants-layer', ['all',
            ['==', ['get', 'cuisine'], ethnoValue],
            ['==', ['get', filterValue], 'yes' || 'only'] // returns points with value that matches dropdown selection
        ]);
    }    
});

/*--------------------------------------------------------------------
BUFFERING RESTAURANTS BY DISTANCE
--------------------------------------------------------------------*/

// assume no point has been added yet
let pointAdded = false;
let newpoint = {
    'type': 'FeatureCollection',
    'features': []
};

map.on('click', (e) => {
    // if a point hasn't already been added, allow 1 point to be added (referenced from ChatGPT)
    if (!pointAdded) {
    // Store clicked point as geojson feature
    const clickedpoint = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [e.lngLat.lng, e.lngLat.lat] // Access map coords of mouse click
        }
    };

    // Add clicked point to previously empty geojson FeatureCollection variable using push method
    restaurantsjson.features.push(clickedpoint);
    newpoint.features.push(clickedpoint);

    // Update the datasource to include clicked points
    map.getSource('restaurants').setData(restaurantsjson);

    // a point has been added
    pointAdded = true;
    };
});

document.getElementById('0.5km').addEventListener('change', function() {
    if (this.checked) { // making a checkbox toggle for the buffer

    // Create empty featurecollection for buffers
    let buffresult = {
        "type": "FeatureCollection",
        "features": []
    };


    // Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    newpoint.features.forEach((feature) => {
            let buffer = turf.buffer(feature, 0.5); // create buffer variable
            buffresult.features.push(buffer); // append buffer polygons to buffresult
    });

    // add buffresult as data source
    map.addSource('buff', {
        "type": "geojson",
        "data": buffresult  // use buffer geojson variable as data source
    })

    // Show buffers on map using styling
    map.addLayer({
        "id": "inputpointbuff",
        "type": "fill",
        "source": "buff",
        "paint": {
            'fill-color': "#03d3fc",
            'fill-opacity': 0.2,
            'fill-outline-color': "black"
            }
        });

    } else {
        // Remove buffer layer and source
        map.removeLayer('inputpointbuff');
        map.removeSource('buff');
    }
    });

document.getElementById('1km').addEventListener('change', function() {
    if (this.checked) {

    // document.getElementById('buffbutton').disabled = true; // disable  button after click

    // Create empty featurecollection for buffers
    let buffresult = {
        "type": "FeatureCollection",
        "features": []
    };


    // Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    newpoint.features.forEach((feature) => {
            let buffer = turf.buffer(feature, 1); // create buffer variable
            buffresult.features.push(buffer); // append buffer polygons to buffresult
    });

    map.addSource('buff', {
        "type": "geojson",
        "data": buffresult  // use buffer geojson variable as data source
    })

    // Show buffers on map using styling
    map.addLayer({
        "id": "inputpointbuff",
        "type": "fill",
        "source": "buff",
        "paint": {
            'fill-color': "#a903fc",
            'fill-opacity': 0.2,
            'fill-outline-color': "black"
            }
        });
    } else {
        // Remove buffer layer and source
        map.removeLayer('inputpointbuff');
        map.removeSource('buff');
    }
    });

document.getElementById('2km').addEventListener('change', function() {
    if (this.checked) {

    // document.getElementById('buffbutton').disabled = true; // disable  button after click

    // Create empty featurecollection for buffers
    let buffresult = {
        "type": "FeatureCollection",
        "features": []
    };


    // Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    newpoint.features.forEach((feature) => {
            let buffer = turf.buffer(feature, 2); // create buffer variable
            buffresult.features.push(buffer); // append buffer polygons to buffresult
    });

    map.addSource('buff', {
        "type": "geojson",
        "data": buffresult  // use buffer geojson variable as data source
    })

    // Show buffers on map using styling
    map.addLayer({
        "id": "inputpointbuff",
        "type": "fill",
        "source": "buff",
        "paint": {
            'fill-color': "#fc037b",
            'fill-opacity': 0.2,
            'fill-outline-color': "black"
            }
        });
    } else {
        // Remove buffer layer and source
        map.removeLayer('inputpointbuff');
        map.removeSource('buff');
    }
    });
