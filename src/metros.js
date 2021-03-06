import config from './config'
import axios from 'axios'
import csv from 'csvtojson'

const axs = axios.create({ baseURL: config.baseURL })

class Station{
  constructor(id,name,lat,lng){
    this.id = id
    this.name = name
    this.coords = {
      lat: lat,
      lng: lng
    }
  }
}

class Stations{
  constructor(){
    this.stations = []
  }

  addStation(station){
    if( this.stations.every( stn => ( stn.id != station.id ) ) ) 
      this.stations.push(station)
  }
}

const metros = {

  'chicta':{
    id: 'chicta',
    name: 'CTA',
    city: 'Chicago',
    coords: {
      lat: 41.8787,
      lng: -87.6403
    },

    getStations: async ()=>{
      let stations = new Stations();
      (await axs.get('https://data.cityofchicago.org/resource/8pix-ypme.json'))
        .data.forEach( station => {
          stations.addStation( new Station(
            station.stop_id,
            station.stop_name,
            parseFloat(station.location.latitude), 
            parseFloat(station.location.longitude)
          ))
        })
      return stations.stations
    },
  },

  'houmetro':{
    id: 'houmetro',
    name: 'METRORail',
    city: 'Houston',
    coords: {
      lat: 29.7573,
      lng: -95.3646
    },

    getStations: async () => {
      let stations = new Stations();
      (await axs.get('/metro/static/data/houmetro.geojson'))
        .data.features.forEach( async station => {
          stations.addStation( new Station(
            station.properties.OBJECTID.toString(),
            station.properties.Stat_Name,
            station.geometry.coordinates[1], 
            station.geometry.coordinates[0]
          ))                
        })
      return stations.stations
    },
  },

  'lametro':{
    id: 'lametro',
    name: 'Metro',
    city: 'Los Angeles',
    coords: {
      lat: 34.0562,
      lng: -118.2365
    },

    getStations: async ()=>{
      let stations = new Stations();
      (await axs.get('https://api.metro.net/agencies/lametro-rail/routes'))
        .data.items.forEach( async route => {
          (await axs.get('https://api.metro.net/agencies/lametro-rail/routes/'+route.id+'/stops'))
            .data.items.forEach( station => {
              stations.addStation( new Station(
                station.id,
                station.display_name,
                station.latitude, 
                station.longitude
              ))                
            })
        })
      return stations.stations
    },
  },

  'nycmta':{
    id: 'nycmta',
    name: 'MTA',
    city: 'New York City',
    coords: {
      lat: 40.7527,
      lng: -73.9772
    },

    getStations: async ()=>{
      let stations = new Stations();
      (await csv().fromString( ( await axs.get( '/metro/static/data/nycmta.csv' ) ).data ))
        .forEach( station => {
          stations.addStation( new Station(
            station['Station ID'],
            station['Stop Name'],
            parseFloat(station['GTFS Latitude']),
            parseFloat(station['GTFS Longitude'])
          ))
        })      
      return stations.stations
    },
  },

  'phlsepta':{
    id: 'phlsepta',
    name: 'SEPTA',
    city: 'Philadelphia',
    coords: {
      lat: 39.9558,
      lng: -75.1820
    },

    getStations: async ()=>{
      let stations = new Stations();
      (await axs.get('/metro/static/data/phlsepta.json'))
        .data.forEach( station => {
          stations.addStation( new Station(
            station.location_id, 
            station.location_name,
            parseFloat(station.location_lat), 
            parseFloat(station.location_lon)
          ))  
        })
      return stations.stations
    },
  },

  'sfbart':{
    id: 'sfbart',
    name: 'BART',
    city: 'San Francisco',
    coords: {
      lat: 37.7767,
      lng: -122.3949
    },

    getStations: async ()=>{
      let stations = new Stations();
      (await axs.get('http://api.bart.gov/api/stn.aspx?cmd=stns&json=y&key=' + config.apiKeys.sfbart))
        .data.root.stations.station.forEach( station => {
          stations.addStation( new Station(
            station.abbr,
            station.name,
            parseFloat(station.gtfs_latitude), 
            parseFloat(station.gtfs_longitude)
          ))
        })
      return stations.stations
    },
  }
}

export default metros