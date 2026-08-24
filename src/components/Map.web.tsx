import React from 'react';
import { View, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function Map({ latitude, longitude, startLatitude, startLongitude, style, popupText }: any) {
  // If no coords provided, fallback to Mysore
  const lat = latitude || 12.2958;
  const lng = longitude || 76.6394;
  
  const formattedPopupText = popupText ? popupText.replace(/'/g, "\\'").replace(/\n/g, "<br>") : "Selected Location";

  const hasRoute = startLatitude && startLongitude;
  const startLatStr = startLatitude || 'null';
  const startLngStr = startLongitude || 'null';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      ${hasRoute ? '<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />' : ''}
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      ${hasRoute ? '<script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>' : ''}
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        #route-info { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 10px 20px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: bold; color: #4b2c82; z-index: 1000; display: none; text-align: center; border: 2px solid #4b2c82; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      ${hasRoute ? '<div id="route-info">Calculating route...</div>' : ''}
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var hasRoute = ${hasRoute};
        if (hasRoute) {
          document.getElementById('route-info').style.display = 'block';
          var control = L.Routing.control({
            waypoints: [
              L.latLng(${startLatStr}, ${startLngStr}),
              L.latLng(${lat}, ${lng})
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            show: false, // Hide the turn-by-turn text box
            createMarker: function(i, wp, nWps) {
              if (i === 0) {
                return L.marker(wp.latLng, { draggable: false }).bindPopup('<b>🛵 Your Location</b>').openPopup();
              } else {
                return L.marker(wp.latLng, { draggable: false }).bindPopup('<b>📍 Destination</b><br>${formattedPopupText}');
              }
            }
          }).addTo(map);

          control.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            var distance = (summary.totalDistance / 1000).toFixed(1) + ' km';
            var time = Math.round(summary.totalTime / 60) + ' min';
            document.getElementById('route-info').innerHTML = '🛵 <b>' + time + '</b> away (' + distance + ')';
            
            // Adjust map view to fit the route
            setTimeout(() => {
              var bounds = L.latLngBounds([
                [${startLatStr}, ${startLngStr}],
                [${lat}, ${lng}]
              ]);
              map.fitBounds(bounds, { padding: [50, 50] });
            }, 500);
          });
          
          control.on('routingerror', function(e) {
             document.getElementById('route-info').innerHTML = 'Route calculation failed';
          });
        } else {
          var marker = L.marker([${lat}, ${lng}]).addTo(map);
          marker.bindPopup('<b>Destination</b><br>${formattedPopupText}').openPopup();
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[style, { overflow: 'hidden', position: 'relative' }]}>
      <iframe 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        srcDoc={htmlContent}
        style={{ border: 0 }}
      />
      <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 6, elevation: 2 }}>
         <Text style={{ fontSize: 10, color: colors.darkPurple, fontWeight: 'bold' }}>Web Demo Mode</Text>
      </View>
    </View>
  );
}
