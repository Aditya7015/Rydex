import { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

// Initialize MapTiler with your API key
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

export default function LocationMap({ fromLocation, toLocation, onMapLoad }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [distance, setDistance] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Use the correct style - BASIC is the most stable
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.BASIC, // Changed from STREETS to BASIC
        center: [78.9629, 20.5937], // India center
        zoom: 5,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('Map loaded successfully');
      });

      map.current.on('error', (error) => {
        console.error('Map error:', error);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Draw route when both locations are selected and map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    if (!fromLocation?.lat || !toLocation?.lat) return;

    drawRoute();
  }, [fromLocation, toLocation, mapLoaded]);

  const drawRoute = async () => {
    try {
      // Clear existing markers and routes
      const existingMarkers = document.querySelectorAll('.maptiler-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Remove existing route layer if exists
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add markers for pickup and dropoff
      new maptilersdk.Marker({ color: '#22c55e' })
        .setLngLat([fromLocation.lng, fromLocation.lat])
        .setPopup(new maptilersdk.Popup().setHTML('<strong>📍 Pickup Location</strong>'))
        .addTo(map.current);

      new maptilersdk.Marker({ color: '#ef4444' })
        .setLngLat([toLocation.lng, toLocation.lat])
        .setPopup(new maptilersdk.Popup().setHTML('<strong>🏁 Dropoff Location</strong>'))
        .addTo(map.current);

      // Fit bounds to show both markers
      const bounds = new maptilersdk.LngLatBounds()
        .extend([fromLocation.lng, fromLocation.lat])
        .extend([toLocation.lng, toLocation.lat]);
      
      map.current.fitBounds(bounds, { padding: 50 });

      // Get route from MapTiler API
      const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
      const url = `https://api.maptiler.com/routing/route/v1/driving/${fromLocation.lng},${fromLocation.lat};${toLocation.lng},${toLocation.lat}.json?key=${apiKey}&overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        setDistance(distanceKm);
        
        // Send distance to parent component
        if (onMapLoad) {
          onMapLoad({ distance: distanceKm });
        }
        
        // Draw route on map
        const geojson = {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        };
        
        map.current.addSource('route', {
          type: 'geojson',
          data: geojson
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4f46e5',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });
      } else {
        console.error('No route found');
        // Fallback: draw straight line
        drawStraightLine();
      }
    } catch (error) {
      console.error('Error drawing route:', error);
      // Fallback: draw straight line
      drawStraightLine();
    }
  };

  const drawStraightLine = () => {
    try {
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [fromLocation.lng, fromLocation.lat],
            [toLocation.lng, toLocation.lat]
          ]
        }
      };
      
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
      
      map.current.addSource('route', {
        type: 'geojson',
        data: geojson
      });
      
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4f46e5',
          'line-width': 4,
          'line-dasharray': [5, 5],
          'line-opacity': 0.8
        }
      });
      
      // Calculate straight line distance
      const R = 6371; // Earth's radius in km
      const lat1 = fromLocation.lat * Math.PI / 180;
      const lat2 = toLocation.lat * Math.PI / 180;
      const deltaLat = (toLocation.lat - fromLocation.lat) * Math.PI / 180;
      const deltaLon = (toLocation.lng - fromLocation.lng) * Math.PI / 180;
      
      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const straightDistance = (R * c).toFixed(1);
      
      setDistance(straightDistance);
      if (onMapLoad) {
        onMapLoad({ distance: straightDistance });
      }
    } catch (error) {
      console.error('Error drawing straight line:', error);
    }
  };

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden border-2 border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
      {distance && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
          <p className="text-sm font-semibold text-gray-700">
            📍 Distance: {distance} km
          </p>
        </div>
      )}
    </div>
  );
}