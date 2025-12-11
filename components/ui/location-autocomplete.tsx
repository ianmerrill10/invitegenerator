"use client";

import * as React from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  fullAddress: string;
}

interface LocationAutocompleteProps {
  value?: string;
  onChange: (location: {
    name: string;
    address: string;
    city: string;
    lat?: number;
    lng?: number;
  }) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

// Using Photon API - free OpenStreetMap-based geocoding
// https://photon.komoot.io/
const PHOTON_API = "https://photon.komoot.io/api";

export function LocationAutocomplete({
  value = "",
  onChange,
  placeholder = "Search for a venue or address...",
  error,
  className,
}: LocationAutocompleteProps) {
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for locations
  const searchLocations = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${PHOTON_API}?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();

      const locations: LocationResult[] = data.features?.map((feature: any) => {
        const props = feature.properties;
        const coords = feature.geometry?.coordinates || [];

        // Build a readable name
        const name = props.name || props.street || "";
        const houseNumber = props.housenumber || "";
        const street = props.street || "";
        const city = props.city || props.town || props.village || props.municipality || "";
        const state = props.state || "";
        const country = props.country || "";

        // Build full address
        const addressParts = [
          houseNumber && street ? `${houseNumber} ${street}` : street,
          city,
          state,
          country,
        ].filter(Boolean);

        const fullAddress = addressParts.join(", ");
        const displayName = name || fullAddress;

        return {
          name: displayName,
          address: houseNumber && street ? `${houseNumber} ${street}` : street || fullAddress,
          city,
          state,
          country,
          lat: coords[1],
          lng: coords[0],
          fullAddress,
        };
      }) || [];

      setResults(locations);
      setIsOpen(locations.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Location search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  // Handle selection
  const handleSelect = (location: LocationResult) => {
    setQuery(location.name);
    setIsOpen(false);
    onChange({
      name: location.name,
      address: location.fullAddress,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Clear input
  const handleClear = () => {
    setQuery("");
    setResults([]);
    onChange({ name: "", address: "", city: "" });
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-xl border bg-white pl-10 pr-10 py-3 text-surface-900 font-body text-base transition-colors",
            "placeholder:text-surface-400",
            "hover:border-surface-400",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
            error ? "border-red-500" : "border-surface-300"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 animate-spin" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 hover:text-surface-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-surface-200 shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lng}-${index}`}
              type="button"
              onClick={() => handleSelect(result)}
              className={cn(
                "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                "hover:bg-surface-50",
                selectedIndex === index && "bg-surface-100",
                index !== results.length - 1 && "border-b border-surface-100"
              )}
            >
              <MapPin className="h-5 w-5 text-surface-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-surface-900 truncate">{result.name}</p>
                <p className="text-sm text-surface-500 truncate">{result.fullAddress}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-surface-200 shadow-lg p-4 text-center text-surface-500">
          No locations found. Try a different search.
        </div>
      )}
    </div>
  );
}
