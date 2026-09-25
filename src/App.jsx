import { useEffect, useRef, useState } from 'react';
import * as maplibregl from '../www/vendor/maplibre/maplibre-gl.mjs';
import '../www/vendor/maplibre/maplibre-gl.css';

const campus = { south: 40.8036, west: -73.9669, north: 40.8168, east: -73.9505 };
const categories = ['Festivities', 'Info session', 'Social meetup', 'Sports', 'Student fair', 'Social wellness', 'Barbecue', 'Other'];
const onCampus = ({ lng, lat }) => lat >= campus.south && lat <= campus.north && lng >= campus.west && lng <= campus.east;

export default function App() {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const draftRef = useRef(null);
  const markersRef = useRef([]);
  const [events, setEvents] = useState([]);
  const [location, setLocation] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', category: '', otherCategory: '', playersNeeded: '', closesAt: '' });
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 4000); };
  const loadEvents = async () => {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Could not load events.');
    setEvents(await response.json());
  };

  useEffect(() => {
    const map = new maplibregl.Map({ container: mapNode.current, style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=7SPiYhrDSwC1bV3NH29O', center: [-73.9608, 40.8092], zoom: 16.6, minZoom: 16.6, maxZoom: 16.6, maxBounds: [[-73.9726, 40.8], [-73.9448, 40.82]], attributionControl: true });
    map.scrollZoom.disable(); map.doubleClickZoom.disable(); map.boxZoom.disable(); map.keyboard.disable(); map.touchZoomRotate.disableRotation();
    map.on('load', () => loadEvents().catch((error) => notify(error.message)));
    map.on('click', (event) => {
      if (!onCampus(event.lngLat)) return notify('Choose a point inside the Columbia campus boundary.');
      const point = event.lngLat;
      if (draftRef.current) draftRef.current.remove();
      const marker = document.createElement('div'); marker.className = 'draft-marker';
      draftRef.current = new maplibregl.Marker({ element: marker }).setLngLat(point).addTo(map);
      setLocation({ lng: point.lng, lat: point.lat });
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = events.map((event) => {
      const node = document.createElement('button'); node.className = 'event-marker'; node.type = 'button'; node.setAttribute('aria-label', `${event.title}: ${event.category}`);
      const players = event.players_needed ? `<br>${event.players_needed} more player${event.players_needed === 1 ? '' : 's'} needed` : '';
      return new maplibregl.Marker({ element: node, anchor: 'bottom' }).setLngLat([event.longitude, event.latitude]).setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(`<strong>${event.title}</strong><br>${event.category}${players}`)).addTo(mapRef.current);
    });
  }, [events]);

  const reset = () => { if (draftRef.current) draftRef.current.remove(); draftRef.current = null; setLocation(null); setForm({ title: '', category: '', otherCategory: '', playersNeeded: '', closesAt: '' }); };
  const submit = async (event) => {
    event.preventDefault(); if (!location) return;
    const payload = { title: form.title.trim(), category: form.category === 'Other' ? form.otherCategory.trim() : form.category, playersNeeded: form.category === 'Sports' ? Number(form.playersNeeded) : undefined, latitude: location.lat, longitude: location.lng, closesAt: form.closesAt };
    const response = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json(); if (!response.ok) return notify(result.error);
    notify(`${result.title} was saved.`); reset(); loadEvents();
  };
  const join = async (event) => { const response = await fetch(`/api/events/${event.id}/join`, { method: 'POST' }); const result = await response.json(); if (!response.ok) return notify(result.error); notify(`You joined ${event.title}.`); loadEvents(); };
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return <><header className="site-header"><a className="app-brand" href="#" aria-label="Campus Connect home"><span className="app-logo-placeholder" aria-hidden="true">◇</span><span>Campus Connect</span></a><span className="header-note">Columbia University</span></header><main><section className="map-section section-wrap" aria-labelledby="map-heading"><div className="section-heading"><div><p className="eyebrow">CAMPUS HAPPENINGS</p><h1 id="map-heading">Find your people <em>at Columbia.</em></h1></div><p className="map-instruction">Tap a point on campus to host an event.</p></div><div className={`map-experience ${location ? 'is-drafting' : ''}`}><div className="map-column"><div className="map-panel"><div ref={mapNode} className="location-map" role="application" aria-label="Interactive map of Columbia University campus" /></div><p className="map-caption">The map is limited to Columbia University's Morningside campus.</p></div><aside className="event-form-panel" aria-hidden={!location}><div className="form-heading"><div><p className="eyebrow">NEW CAMPUS EVENT</p><h2>Tell people what's happening.</h2></div><button className="icon-button" onClick={reset} type="button" aria-label="Close event form">×</button></div><p className="selected-location">{location ? `Location selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Choose a point on the map.'}</p><form onSubmit={submit}><label>Event name<input value={form.title} onChange={update('title')} type="text" placeholder="e.g. Sunset soccer" required maxLength="60" /></label><label>Category<select value={form.category} onChange={update('category')} required><option value="" disabled>Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>{form.category === 'Other' && <label>Your category<input value={form.otherCategory} onChange={update('otherCategory')} required maxLength="40" /></label>}{form.category === 'Sports' && <label>Other players needed<input value={form.playersNeeded} onChange={update('playersNeeded')} type="number" min="1" max="99" required /></label>}<label>Listing closes<input value={form.closesAt} onChange={update('closesAt')} type="datetime-local" required /></label><button className="primary-button" type="submit">Publish event</button></form></aside></div></section><section className="events section-wrap" aria-labelledby="events-heading"><div className="section-heading"><div><p className="eyebrow">ON CAMPUS NOW</p><h2 id="events-heading">Events to join</h2></div><span className="section-index">{events.length} event{events.length === 1 ? '' : 's'}</span></div><div className="event-list">{events.map((event) => { const needed = event.players_needed; return <article key={event.id} className="event-card"><p className="event-category">{event.category}</p><h3>{event.title}</h3><p>{needed ? `${Math.max(needed - event.joined_count, 0)} more player${needed === 1 ? '' : 's'} needed` : 'Open to the Columbia community'}</p><button type="button" onClick={() => join(event)}>Join event</button></article>; })}</div></section></main><footer><a className="logo" href="#">Campus Connect<span>✳</span></a><span>Meet, make plans, and show up.</span></footer><div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div></>;
}
