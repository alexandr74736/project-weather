import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Coords } from '../shared/Coords';
import { City } from '../shared/city';
import {Observable} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { iconsService } from './icons.service';

  
@Injectable({providedIn: 'root'})
export class HttpService{
  
    constructor(private http: HttpClient, private iconsService: iconsService){ }


    getCoords(cityName:string) : Observable<any> {
        return this.http.get(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName},+7&limit=1&appid=1f8d95b9fca4ced1f40f4bdcff9214e1&lang=ru`)
            .pipe(map((data:any)=>{
                let obj = data;
                
                return new Coords(
                    obj[0]["local_names"]["ru"],
                    obj[0].lat,
                    obj[0].lon,
                )
            }));
    }
      
    getData(lat:number, lon:number) : Observable<City> {
        
        return this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=1f8d95b9fca4ced1f40f4bdcff9214e1&lang=ru`)
            .pipe(map((data:any)=>{
            let obj = data;
            // let description = obj.weather[0]["description"];
            let description = obj.weather[0]["description"];
                description = this.descrFix(description)
            let pressure = Math.floor(obj.main["pressure"] / 1.333223684);
            let temp = (obj.main["temp"] - 273.15).toFixed(0);
            let sunsetTime = new Date(obj.sys["sunset"] * 1000);
            let sunset_time = sunsetTime.toLocaleTimeString()
            let icon = obj.weather[0]["icon"]
                icon = this.iconsService.checkIcon(icon)
             
            return new City(
                obj.name, 
                description, 
                temp, 
                pressure, 
                sunset_time,
                icon
                );
        }));
    }

    getCityData(cityName:string) : Observable<City> {
    
        return this.getCoords(cityName)
            .pipe(
                switchMap( (Coords) => this.getData(Coords.lat, Coords.lon))
            )
    }

    descrFix(str:string) {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
      }
}