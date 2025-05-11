import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { VariablesService } from '../variables.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges {
  selectedCamera: string = '';
  @Input()
  cameraList: string[] = [];
  cameras: string[] = [];

  constructor(private selectedService: VariablesService) {
    effect(() => {
      this.selectedCamera = selectedService.getSelectedCamera()
    });
  }
  
  ngOnInit(): void {
  }

  selectCamera(route: string){
    this.selectedService.setSelectedCamera(route);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["cameraList"]){
      this.cameras = this.cameraList;

      }
    
  }
}