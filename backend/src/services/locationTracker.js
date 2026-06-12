// In-memory location store (for development)
// In production, use Redis
const activeRideLocations = new Map();

class LocationTracker {
  // Store driver location for a ride
  static updateDriverLocation(rideId, driverId, location) {
    const key = `ride:${rideId}`;
    const data = {
      driverId,
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || 10,
        heading: location.heading || 0,
        speed: location.speed || 0,
        timestamp: new Date().toISOString()
      },
      lastUpdate: Date.now()
    };
    
    activeRideLocations.set(key, data);
    
    // Auto cleanup after 15 minutes of inactivity
    setTimeout(() => {
      if (activeRideLocations.get(key)?.lastUpdate === data.lastUpdate) {
        activeRideLocations.delete(key);
      }
    }, 15 * 60 * 1000);
    
    return data;
  }
  
  // Get driver location for a ride
  static getDriverLocation(rideId) {
    const key = `ride:${rideId}`;
    return activeRideLocations.get(key) || null;
  }
  
  // Check if ride is being tracked
  static isRideTracked(rideId) {
    const key = `ride:${rideId}`;
    return activeRideLocations.has(key);
  }
  
  // Stop tracking a ride
  static stopTracking(rideId) {
    const key = `ride:${rideId}`;
    activeRideLocations.delete(key);
  }
  
  // Get active rides count
  static getActiveRidesCount() {
    return activeRideLocations.size;
  }
}

module.exports = LocationTracker;