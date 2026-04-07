import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

const GOOGLE_MAPS_API_KEY = "AIzaSyCnKdZ8Rwf9GJnTGaZ3u4vlE932nhgRr5c";
const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Delhi fallback

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function NearbyPharmacies() {
  const { toast } = useToast();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);

  const searchNearby = useCallback(
    (location: { lat: number; lng: number }, mapInstance: google.maps.Map) => {
      if (!mapInstance) return;
      const service = new google.maps.places.PlacesService(mapInstance);
      serviceRef.current = service;
      setLoading(true);

      service.nearbySearch(
        {
          location,
          radius: 3000,
          type: "pharmacy",
        },
        (results, status) => {
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPharmacies(
              results.map((p) => ({
                id: p.place_id || crypto.randomUUID(),
                name: p.name || "Unknown Pharmacy",
                address: p.vicinity || "Address not available",
                lat: p.geometry?.location?.lat() || 0,
                lng: p.geometry?.location?.lng() || 0,
              }))
            );
          }
        }
      );
    },
    []
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Using default location.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (map) {
          map.panTo(loc);
          searchNearby(loc, map);
        }
      },
      () => {
        toast({ title: "Location access denied", description: "Using default location. Enable location for better results." });
      }
    );
  }, [map, searchNearby, toast]);

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      serviceRef.current = new google.maps.places.PlacesService(mapInstance);
      if (userLocation) {
        searchNearby(userLocation, mapInstance);
      }
    },
    [userLocation, searchNearby]
  );

  const handleSearch = () => {
    if (!searchQuery.trim() || !serviceRef.current || !map) return;
    setLoading(true);
    serviceRef.current.textSearch(
      { query: `${searchQuery} pharmacy`, location: userLocation || defaultCenter, radius: 5000 },
      (results, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const mapped = results.map((p) => ({
            id: p.place_id || crypto.randomUUID(),
            name: p.name || "Unknown Pharmacy",
            address: p.formatted_address || "Address not available",
            lat: p.geometry?.location?.lat() || 0,
            lng: p.geometry?.location?.lng() || 0,
          }));
          setPharmacies(mapped);
          if (mapped.length > 0) {
            map.panTo({ lat: mapped[0].lat, lng: mapped[0].lng });
          }
        } else {
          toast({ title: "No results", description: "Try a different search term." });
        }
      }
    );
  };

  const openDirections = (pharmacy: Pharmacy) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
    const dest = `${pharmacy.lat},${pharmacy.lng}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Search bar */}
      <div className="z-10 border-b bg-card p-3 shadow-sm">
        <div className="mx-auto flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1" style={{ minHeight: "calc(100vh - 140px)" }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={14}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "hsl(221, 83%, 53%)",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              title="Your Location"
            />
          )}

          {/* Pharmacy markers */}
          {pharmacies.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
              onClick={() => setSelectedPharmacy(pharmacy)}
              title={pharmacy.name}
            />
          ))}

          {/* Info window */}
          {selectedPharmacy && (
            <InfoWindow
              position={{ lat: selectedPharmacy.lat, lng: selectedPharmacy.lng }}
              onCloseClick={() => setSelectedPharmacy(null)}
            >
              <div className="max-w-[200px] p-1">
                <h3 className="font-semibold text-sm text-gray-900">{selectedPharmacy.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{selectedPharmacy.address}</p>
                <button
                  onClick={() => openDirections(selectedPharmacy)}
                  className="mt-2 flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  Get Directions
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
