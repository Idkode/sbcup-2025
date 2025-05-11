import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContentComponent } from '../content/content.component';
import { VariablesService } from '../variables.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MonitoringService } from '../core/monitoring.service';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, SidebarComponent, ContentComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{
  currentCamera: string = ''
  currentScreen: string = '';
  cameras: string[] = [];
  private cameraRefreshDelay: any;
  private cameraRefreshInterval: any;

  constructor(public selectedScreenService: VariablesService,
              public monitoringService: MonitoringService
  ) {
    effect(() => {
      this.currentCamera = this.selectedScreenService.getSelectedCamera(); // Update selected camera signal
    });
  }

  ngOnInit(): void {
    var currentDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    this.refreshCameras(currentDate)

    this.cameraRefreshDelay = setInterval(() => {
      currentDate = new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      this.refreshCameras(currentDate);
    }, 300000); // 5 minutes to refresh cameras

  }
  ngOnDestroy(): void {
    if (this.cameraRefreshDelay)
      clearTimeout(this.cameraRefreshDelay)
    if (this.cameraRefreshInterval)
      clearInterval(this.cameraRefreshInterval)
  }

  refreshCameras(currentDate: string): void{
    this.monitoringService.getCameras(currentDate).subscribe((cameras: string[]) => {
      const currentCamera: string | null = this.selectedScreenService.getSelectedCamera() ?? null;
      this.selectedScreenService.setCameras(cameras);
      this.cameras = this.selectedScreenService.getCameras();
      if (!currentCamera || !this.cameras.includes(currentCamera))
        this.selectedScreenService.setSelectedCamera(this.cameras[0])
    });
  }
}

