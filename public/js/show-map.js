<script>
  document.addEventListener("DOMContentLoaded", () => {
    const toggleMapBtn = document.getElementById("toggleMapBtn");
    const mapContainer = document.getElementById("mapContainer");
    let mapInitialized = false;
    let map;

    toggleMapBtn.addEventListener("click", () => {
      if (mapContainer.style.display === "none" || mapContainer.style.display === "") {
        // Show the map container
        mapContainer.style.display = "block";
        toggleMapBtn.textContent = "❌ Hide Map";

        if (!mapInitialized) {
          // Initialize the map if it's not initialized already
          map = L.map("map").setView([20.5937, 78.9629], 5);  // Center map at India (default)
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);

          // Assuming `listingCoords` is an array of coordinate objects from your server
          if (typeof listingCoords === "object") {
            const bounds = [];
            listingCoords.forEach(({ lat, lng, title }) => {
              if (lat && lng) {
                L.marker([lat, lng])
                  .addTo(map)
                  .bindPopup(`<b>${title}</b>`);
                bounds.push([lat, lng]);
              }
            });

            if (bounds.length > 0) {
              map.fitBounds(bounds, { padding: [50, 50] });  // Adjust map view to include all markers
            }
          }

          mapInitialized = true;
        }
      } else {
        // Hide the map container
        mapContainer.style.display = "none";
        toggleMapBtn.textContent = "🗺️ Show Map";
      }
    });
  });
</script>
