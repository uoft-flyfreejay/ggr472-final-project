/*--------------------------------------------------------------------
INITIALIZE MAP
--------------------------------------------------------------------*/
mapboxgl.accessToken = ''; //ADD YOUR ACCESS TOKEN HERE

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
// Add data source and draw initial visiualization of layer
map.on('load', () => {
    map.addSource('restaurants', {
        type: 'geojson',
        data: restaurantsjson
    });

    // Add a layer for restaurants to display the data
    map.addLayer({
        id: 'restaurants-layer',
        type: 'circle', // This example uses circles, but you can change it based on your needs
        source: 'restaurants', // This should match the ID of the source added
        paint: {
            // Define the visual appearance of the data (this is just an example)
            'circle-radius': 6,
            'circle-color': '#B42222'
        }
    });
});

const restaurantLayers = ['italian-restaurants', 'korean-restaurants', 'chinese-restaurants', 'restaurants-layer'];

let popup = null; // This variable will hold the currently displayed popup

restaurantLayers.forEach(function(layerId) {
    // When the user moves their mouse over the layer, show the popup
    map.on('mouseenter', layerId, function(e) {
        var properties = e.features[0].properties;
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = `<h3>${properties.name}</h3>`;
        description += `<p>Cuisine: ${properties.cuisine}</p>`;

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