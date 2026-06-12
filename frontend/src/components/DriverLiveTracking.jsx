import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaLocationArrow, FaStop, FaStreetView } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

export default function DriverLiveTracking({ rideId, onStopSharing }) {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC,
      center: [78.9629, 20.5937],
      zoom: 12,
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0
        };

        setLastLocation(location);

        // Update map marker
        if (map.current && marker.current) {
          marker.current.setLngLat([location.lng, location.lat]);
          map.current.setCenter([location.lng, location.lat]);
        } else if (map.current) {
          marker.current = new maptilersdk.Marker({ color: '#4f46e5' })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);
          map.current.setCenter([location.lng, location.lat]);
        }

        // Send location to server
        if (isSharing) {
          emit('driver:update-location', { rideId, location });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    setWatchId(id);
    setIsSharing(true);
    emit('driver:start-sharing', { rideId });
    toast.success('Live location sharing started');
  };

  const stopSharing = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setIsSharing(false);
    emit('driver:stop-sharing', { rideId });
    toast.success('Location sharing stopped');

    if (onStopSharing) {
      onStopSharing();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
            <p className="text-sm text-gray-500">
              {isSharing ? '🔴 Sharing live location' : '⚪ Not sharing'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isSharing ? (
              <button
                onClick={startSharing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
              >
                <FaLocationArrow className="w-4 h-4" />
                Start Sharing
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <FaStop className="w-4 h-4" />
                Stop Sharing
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={mapContainer} className="w-full h-96" />
        {!isSharing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <FaStreetView className="text-5xl mx-auto mb-3" />
              <p className="text-lg font-semibold">Start sharing your location</p>
              <p className="text-sm opacity-80">Passengers will see your live location</p>
            </div>
          </div>
        )}
      </div>

      {isSharing && lastLocation && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Latitude:</span>
              <span className="ml-2 font-mono">{lastLocation.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Longitude:</span>
              <span className="ml-2 font-mono">{lastLocation.lng.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Accuracy:</span>
              <span className="ml-2">{Math.round(lastLocation.accuracy)}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}