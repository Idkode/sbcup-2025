import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataPoint } from '../../interfaces/data-point.model';
import { environment } from '../../environments/environment';


export interface ImageDTO {
  number: number;
  time: number; // Minutes since the start of the day
}

export interface ImageFullDTO {
  camera: string;
  datetime: string;
  image: string;
  detections: Detection[];
}

export interface Detection {
  confidence: number;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * A class that deals with all interactions to backend
 */
@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private apiUrl = "/api"; // Backend requests will be sent to front-end ip + /api. Nginx deals with redirect

  constructor(private http: HttpClient) { }

  /**
   * Gets all DataPoints available for a selected camera and date
   * @param camera Selected camera
   * @param date Selected date
   * @returns List of DataPoints
   */
  getDataPoints(camera: string, date?: string): Observable<DataPoint[]> {
    let params = new HttpParams().set('camera', camera);
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<ImageDTO[]>(`${this.apiUrl}/image/general`, { params: params }).pipe(
      map((imageDTOs: ImageDTO[]) => {
        // Transformation logic:
        return imageDTOs.map(imageDTO => {
          return {
            x: imageDTO.time,
            y: imageDTO.number,
          };
        });
      })
    );
  }

  /**
   * Gets information about an image, including the image itself
   * @param camera Selected camera
   * @param date Image date
   * @param time Image time
   * @returns Image info
   */
  getFullImage(camera: string, date: string, time: string): Observable<ImageFullDTO> {
    const params = new HttpParams()
      .set('camera', camera)
      .set('date', date)
      .set('time', time)
      .set('annotated', true);
    return this.http.get<ImageFullDTO>(`${this.apiUrl}/image/specific`, { params: params });
  }

  /**
   * Gets only the data point information about an image
   * @param camera Selected camera
   * @param date Image date
   * @param time Image time
   * @returns A DataPoint
   */
  getImageInfo(camera: string, date: string, time: string): Observable<DataPoint> {
    const params = new HttpParams()
      .set('camera', camera)
      .set('date', date)
      .set('time', time);
    return this.http.get<ImageDTO>(`${this.apiUrl}/image/specific/less`, { params: params }).pipe(
      map(imageDTO => {
        return {x: imageDTO.time,
                y: imageDTO.number
              };
      })
    );
  }

  /**
   * Gets all available camera names
   * @param date Monitoring date
   * @returns List of cameras
   */
  getCameras(date: string): Observable<string[]> {
    const params = new HttpParams()
      .set('date', date);
    return this.http.get<string[]>(`${this.apiUrl}/image/cameras`, { params: params });
  }
}

