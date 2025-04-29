import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/services/event/event.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css']
})
export class EventMapComponent implements OnInit {
  map!: L.Map;

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    this.eventService.getEvents().subscribe(events => {
      const event = events.find(e => e.eventId?.toString() === eventId);
      if (event && event.location?.trim()) {
        this.initMap(event.location, event.title);
      } else {
        alert('Aucune localisation définie pour cet événement.');
      }
    });
  }

  initMap(location: string, title: string): void {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert("Emplacement introuvable : " + location);
          return;
        }

        const coords: L.LatLngExpression = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        this.map = L.map('map').setView(coords, 13);
        setTimeout(() => this.map.invalidateSize(), 0);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        L.marker(coords).addTo(this.map).bindPopup(title).openPopup();
      })
      .catch(err => console.error('Erreur Leaflet :', err));
  }
}
