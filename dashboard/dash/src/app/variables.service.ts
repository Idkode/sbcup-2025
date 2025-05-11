// selected-screen.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataPoint } from '../interfaces/data-point.model';

/**
 * Manages multiple application variables
 */
@Injectable({
  providedIn: 'root',
})
export class VariablesService {
  private selectedScreenSource = new BehaviorSubject<string>('');
  selectedScreen$ = this.selectedScreenSource.asObservable();

  private clickedPointDataSource: WritableSignal<null | DataPoint> = signal(null);
  
  private camerasSource = new BehaviorSubject<string[]>([]);

  cameras$ = this.camerasSource.asObservable();

  private selectedCamera: WritableSignal<string> = signal('');

  private multiple: WritableSignal<number> = signal(5);

  setClickedPointData(data: DataPoint | null): void {
    this.clickedPointDataSource.set(data);
  }

  getClickedPointData(){
    return this.clickedPointDataSource();
  }

  setSelectedScreen(screen: string) {
    this.selectedScreenSource.next(screen);
  }

  getSelectedScreen() {
    return this.selectedScreenSource.value;
  }

  setCameras(cameras: string[]){
    this.camerasSource.next(cameras);
  }

  getCameras(){
    return this.camerasSource.value;
  }

  setSelectedCamera(camera: string) {
    this.selectedCamera.set(camera);
  }

  getSelectedCamera(): string {
    return this.selectedCamera();
  }

  setSelectedMultiple(multiple: number) {
    this.multiple.set(multiple);
  }

  getSelectedMultiple(): number {
    return this.multiple();
  }
}