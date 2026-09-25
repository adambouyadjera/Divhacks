import * as maplibregl from "./vendor/maplibre/maplibre-gl.mjs";

let toastTimeout;
let selectedLngLat;
let draftMarker;

const toast = document.getElementById("toast");
const mapExperience = document.getElementById("map-experience");
const formPanel = document.getElementById("event-form-panel");
const eventForm = document.getElementById("event-form");
const categorySelect = document.getElementById("event-category");
const otherCategoryField = document.getElementById("other-category-field");
const otherCategoryInput = document.getElementById("other-category");
const playersField = document.getElementById("players-field");
const playersInput = document.getElementById("players-needed");
const selectedLocation = document.getElementById("selected-location");
const eventList = document.getElementById("event-list");
const eventCount = document.getElementById("event-count");

const campusBoundary = {
  south: 40.8036,
  west: -73.9669,
  north: 40.8168,
  east: -73.9505,
};
let events = [];
let eventMarkers = [];

function showMessage(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 4000);
}
function isOnCampus({ lng, lat }) {
  return (
    lat >= campusBoundary.south &&
    lat <= campusBoundary.north &&
    lng >= campusBoundary.west &&
    lng <= campusBoundary.east
  );
}

const map = new maplibregl.Map({
  container: "campus-map",
  style: "https://api.maptiler.com/maps/streets-v2/style.json?key=7SPiYhrDSwC1bV3NH29O",
  center: [-73.9608, 40.8092],
  zoom: 16.6,
  minZoom: 16.6,
  maxZoom: 16.6,
  maxBounds: [
    [-73.9726, 40.8],
    [-73.9448, 40.82],
  ],
  attributionControl: true,
});
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disableRotation();

function eventPopup(event) {
  const players = event.playersNeeded
    ? `<br>${event.playersNeeded} more player${event.playersNeeded === 1 ? "" : "s"} needed`
    : "";
  return `<strong>${event.title}</strong><br>${event.category}${players}`;
}
function addEventMarker(event) {
  const element = document.createElement("button");
  element.className = "event-marker";
  element.type = "button";
  element.setAttribute("aria-label", `${event.title}: ${event.category}`);
  return new maplibregl.Marker({ element, anchor: "bottom" })
    .setLngLat([event.lng, event.lat])
    .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(eventPopup(event)))
    .addTo(map);
}
async function loadEvents() {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Could not load events.");
  events = await response.json();
  eventMarkers.forEach((marker) => marker.remove());
  eventMarkers = events.map((event) =>
    addEventMarker({
      ...event,
      lat: event.latitude,
      lng: event.longitude,
      playersNeeded: event.players_needed,
    }),
  );
  renderEvents();
}
function renderEvents() {
  eventList.innerHTML = "";
  eventCount.textContent = `${events.length} event${events.length === 1 ? "" : "s"}`;
  events.forEach((event) => {
    const card = document.createElement("article");
    card.className = "event-card";
    const needed = event.players_needed ?? event.playersNeeded;
    card.innerHTML = `<p class="event-category">${event.category}</p><h3>${event.title}</h3><p>${needed ? `${Math.max(needed - (event.joined_count ?? 0), 0)} more player${needed === 1 ? "" : "s"} needed` : "Open to the Columbia community"}</p><button type="button">Join event</button>`;
    card.querySelector("button").addEventListener("click", async () => {
      const response = await fetch(`/api/events/${event.id}/join`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) return showMessage(result.error);
      showMessage(`You joined ${event.title}.`);
      loadEvents();
    });
    eventList.append(card);
  });
}
function resetDraft() {
  selectedLngLat = undefined;
  eventForm.reset();
  otherCategoryField.hidden = true;
  playersField.hidden = true;
  otherCategoryInput.required = false;
  playersInput.required = false;
  mapExperience.classList.remove("is-drafting");
  formPanel.setAttribute("aria-hidden", "true");
  if (draftMarker) {
    draftMarker.remove();
    draftMarker = undefined;
  }
}
map.on("load", () => loadEvents().catch((error) => showMessage(error.message)));
map.on("click", (event) => {
  if (!isOnCampus(event.lngLat)) {
    showMessage("Choose a point inside the Columbia campus boundary.");
    return;
  }
  selectedLngLat = event.lngLat;
  if (draftMarker) draftMarker.remove();
  const element = document.createElement("div");
  element.className = "draft-marker";
  draftMarker = new maplibregl.Marker({ element })
    .setLngLat(selectedLngLat)
    .addTo(map);
  selectedLocation.textContent = `Location selected: ${selectedLngLat.lat.toFixed(5)}, ${selectedLngLat.lng.toFixed(5)}`;
  mapExperience.classList.add("is-drafting");
  formPanel.setAttribute("aria-hidden", "false");
  document.getElementById("event-title").focus();
});
categorySelect.addEventListener("change", () => {
  const isOther = categorySelect.value === "Other";
  const isSports = categorySelect.value === "Sports";
  otherCategoryField.hidden = !isOther;
  playersField.hidden = !isSports;
  otherCategoryInput.required = isOther;
  playersInput.required = isSports;
});
document.getElementById("cancel-event").addEventListener("click", resetDraft);
eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedLngLat) return;
  const category =
    categorySelect.value === "Other"
      ? otherCategoryInput.value.trim()
      : categorySelect.value;
  const payload = {
    title: document.getElementById("event-title").value.trim(),
    category,
    playersNeeded:
      categorySelect.value === "Sports"
        ? Number(playersInput.value)
        : undefined,
    latitude: selectedLngLat.lat,
    longitude: selectedLngLat.lng,
    closesAt: document.getElementById("event-closes-at").value,
  };
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) return showMessage(result.error);
  showMessage(`${result.title} was saved.`);
  resetDraft();
  loadEvents();
});
