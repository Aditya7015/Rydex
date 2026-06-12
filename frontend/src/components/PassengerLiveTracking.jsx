import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaMapMarkerAlt, FaTimesCircle } from 'react-icons/fa';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

export default function PassengerLiveTracking({ rideId, driverName, onTrackingEnd }) {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [location, setLocation] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Waiting for driver location...');
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingStopped, setTrackingStopped] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC,
      center: [78.9629, 20.5937],
      zoom: 5,
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId !== rideId) return;
      const updatedLocation = data.location;
      setLocation(updatedLocation);
      setTrackingActive(true);
      setTrackingStopped(false);
      setLastUpdate(updatedLocation.timestamp || new Date().toISOString());
      setStatusMessage('Driver live location received');

      if (map.current) {
        const coords = [updatedLocation.lng, updatedLocation.lat];
        if (marker.current) {
          marker.current.setLngLat(coords);
        } else {
          marker.current = new maptilersdk.Marker({ color: '#2563eb' })
            .setLngLat(coords)
            .addTo(map.current);
        }
        map.current.setCenter(coords);
        map.current.setZoom(13);
      }
    };

    const handleTrackingStopped = (data) => {
      if (data.rideId !== rideId) return;
      setTrackingStopped(true);
      setTrackingActive(false);
      setStatusMessage('Driver has stopped sharing location');
    };

    const handleTrackingAvailable = (data) => {
      if (data.rideId !== rideId) return;
      setStatusMessage('Driver is sharing live location');
      emit('passenger:request-location', { rideId });
    };

    const handleLocationUnavailable = (data) => {
      if (data.rideId !== rideId) return;
      setStatusMessage('Driver location is not available yet');
    };

    on('driver:location-update', handleLocationUpdate);
    on('driver:tracking-stopped', handleTrackingStopped);
    on('driver:tracking-available', handleTrackingAvailable);
    on('driver:location-unavailable', handleLocationUnavailable);

    emit('passenger:join-ride', { rideId });
    emit('passenger:request-location', { rideId });

    return () => {
      off('driver:location-update', handleLocationUpdate);
      off('driver:tracking-stopped', handleTrackingStopped);
      off('driver:tracking-available', handleTrackingAvailable);
      off('driver:location-unavailable', handleLocationUnavailable);
      emit('passenger:leave-ride', { rideId });
    };
  }, [socket, isConnected, on, off, emit, rideId]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Driver Live Tracking</h3>
            <p className="text-sm text-gray-600">Tracking {driverName || 'driver'} in real time</p>
          </div>
          <button
            onClick={() => {
              if (onTrackingEnd) onTrackingEnd();
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            <FaTimesCircle className="inline mr-1" /> Close
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={mapContainer} className="w-full h-96" />
        {!location && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-4 text-center">
            <FaMapMarkerAlt className="text-4xl mb-3" />
            <p className="font-semibold">{statusMessage}</p>
            <p className="text-sm opacity-80 mt-2">Connects as soon as the driver shares their position.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Status</span>
            <span>{statusMessage}</span>
          </div>
          {location && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
              <div className="bg-white p-3 rounded-xl border">
                <div className="text-xs text-gray-500">Latitude</div>
                <div className="font-mono mt-1">{location.lat.toFixed(6)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border">
                <div className="text-xs text-gray-500">Longitude</div>
                <div className="font-mono mt-1">{location.lng.toFixed(6)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border">
                <div className="text-xs text-gray-500">Last updated</div>
                <div className="mt-1">{new Date(lastUpdate).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
          {trackingStopped && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
              Driver stopped sharing location. You can close this view and check again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
