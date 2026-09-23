import * as maplibregl from './vendor/maplibre/maplibre-gl.mjs';

let toastTimeout;
let selectedLngLat;
let draftMarker;

const toast = document.getElementById('toast');
const mapExperience = document.getElementById('map-experience');
const formPanel = document.getElementById('event-form-panel');
const eventForm = document.getElementById('event-form');
const categorySelect = document.getElementById('event-category');
const otherCategoryField = document.getElementById('other-category-field');
const otherCategoryInput = document.getElementById('other-category');
const playersField = document.getElementById('players-field');
const playersInput = document.getElementById('players-needed');
const selectedLocation = document.getElementById('selected-location');
const eventList = document.getElementById('event-list');
const eventCount = document.getElementById('event-count');

const campusBoundary = { south: 40.8036, west: -73.9669, north: 40.8168, east: -73.9505 };
const events = [
  { title: 'Pickup basketball', category: 'Sports', playersNeeded: 2, lat: 40.8101, lng: -73.9635 },
  { title: 'Student org mixer', category: 'Social meetup', lat: 40.8078, lng: -73.9631 },
  { title: 'Club fair', category: 'Student fair', lat: 40.8072, lng: -73.9625 },
];

function showMessage(message) {
  clearTimeout(toastTimeout); toast.textContent = message; toast.classList.add('visible');
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 4000);
}
function isOnCampus({ lng, lat }) {
  return lat >= campusBoundary.south && lat <= campusBoundary.north && lng >= campusBoundary.west && lng <= campusBoundary.east;
}

const map = new maplibregl.Map({
  container: 'campus-map', style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-73.9608, 40.8092], zoom: 16.6, minZoom: 16.6, maxZoom: 16.6,
  maxBounds: [[-73.9726, 40.8], [-73.9448, 40.82]], attributionControl: true,
});
map.scrollZoom.disable(); map.doubleClickZoom.disable(); map.boxZoom.disable(); map.keyboard.disable(); map.touchZoomRotate.disableRotation();

function eventPopup(event) {
  const players = event.playersNeeded ? `<br>${event.playersNeeded} more player${event.playersNeeded === 1 ? '' : 's'} needed` : '';
  return `<strong>${event.title}</strong><br>${event.category}${players}`;
}
function addEventMarker(event) {
  const element = document.createElement('button');
  element.className = 'event-marker'; element.type = 'button'; element.setAttribute('aria-label', `${event.title}: ${event.category}`);
  return new maplibregl.Marker({ element, anchor: 'bottom' }).setLngLat([event.lng, event.lat])
    .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(eventPopup(event))).addTo(map);
}
function renderEvents() {
  eventList.innerHTML = ''; eventCount.textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;
  events.forEach(event => {
    const card = document.createElement('article'); card.className = 'event-card';
    card.innerHTML = `<p class="event-category">${event.category}</p><h3>${event.title}</h3><p>${event.playersNeeded ? `${event.playersNeeded} more player${event.playersNeeded === 1 ? '' : 's'} needed` : 'Open to the Columbia community'}</p><button type="button">Join event</button>`;
    card.querySelector('button').addEventListener('click', () => showMessage(`You joined ${event.title}. Shared joining will be connected to the Node server next.`));
    eventList.append(card);
  });
}
function resetDraft() {
  selectedLngLat = undefined; eventForm.reset(); otherCategoryField.hidden = true; playersField.hidden = true;
  otherCategoryInput.required = false; playersInput.required = false; mapExperience.classList.remove('is-drafting'); formPanel.setAttribute('aria-hidden', 'true');
  if (draftMarker) { draftMarker.remove(); draftMarker = undefined; }
}
map.on('load', () => { events.forEach(addEventMarker); renderEvents(); });
map.on('click', event => {
  if (!isOnCampus(event.lngLat)) { showMessage('Choose a point inside the Columbia campus boundary.'); return; }
  selectedLngLat = event.lngLat; if (draftMarker) draftMarker.remove();
  const element = document.createElement('div'); element.className = 'draft-marker';
  draftMarker = new maplibregl.Marker({ element }).setLngLat(selectedLngLat).addTo(map);
  selectedLocation.textContent = `Location selected: ${selectedLngLat.lat.toFixed(5)}, ${selectedLngLat.lng.toFixed(5)}`;
  mapExperience.classList.add('is-drafting'); formPanel.setAttribute('aria-hidden', 'false'); document.getElementById('event-title').focus();
});
categorySelect.addEventListener('change', () => {
  const isOther = categorySelect.value === 'Other'; const isSports = categorySelect.value === 'Sports';
  otherCategoryField.hidden = !isOther; playersField.hidden = !isSports; otherCategoryInput.required = isOther; playersInput.required = isSports;
});
document.getElementById('cancel-event').addEventListener('click', resetDraft);
eventForm.addEventListener('submit', event => {
  event.preventDefault(); if (!selectedLngLat) return;
  const category = categorySelect.value === 'Other' ? otherCategoryInput.value.trim() : categorySelect.value;
  const newEvent = { title: document.getElementById('event-title').value.trim(), category, playersNeeded: categorySelect.value === 'Sports' ? Number(playersInput.value) : undefined, lat: selectedLngLat.lat, lng: selectedLngLat.lng };
  events.unshift(newEvent); addEventMarker(newEvent).togglePopup(); renderEvents(); showMessage(`${newEvent.title} is now visible on your map.`); resetDraft();
});
