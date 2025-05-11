import { Component, OnInit, OnDestroy, Inject, Input, effect } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import localePt from '@angular/common/locales/pt';
import { DonutComponent } from '../donut/donut.component';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { DataPoint } from '../../interfaces/data-point.model';
import { MonitoringService, ImageFullDTO } from '../core/monitoring.service';
import { VariablesService } from '../variables.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule, DonutComponent, LineChartComponent],
  providers: [DatePipe, {provide: LOCALE_ID, useValue: 'pt-BR'}],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {
  @Input()
  camera: string = '';
  currentDate: string | null = null;
  lineChartData: DataPoint[] = [];
  donutChartData: number[] = [];
  currentImage: ImageFullDTO | null = null;
  currentDataPoint: DataPoint | null = null;
  base64: string = 'data:image/jpg;base64,';
  auto: boolean = true; // Whether current Image should be automatically updated to most recent
  multiple: number = 5; // Interval between points

  date: any;
  time: any;
  private interval: any;
  private imageDelay: any;
  private imageTimeout: any;

  totalVehicles: number = 0;
  peak: number = 0;

  classdict: {[key: string]: number} = {
    "Car": 0,
    "Motorcycle": 2,
    "Bus": 1,
    "Vehicle": 3
  }

  constructor(
    private datePipe: DatePipe,
    private imageService: MonitoringService,
    private variableService: VariablesService,
    private sanitizer: DomSanitizer,
    @Inject(LOCALE_ID) private locale: string
  ) { 
    effect(() => {
      this.currentDataPoint = this.variableService.getClickedPointData()
      this.loadCurrentImage() // Change image showed when selecting another data point
    });
    this.multiple = this.variableService.getSelectedMultiple();
    effect(() => {
      this.camera = this.variableService.getSelectedCamera()
      if (this.camera !== '')
        this.loadInitialData(); // Fetch data points from backend when changing camera
    });
  }
  
  ngOnInit(): void {
    registerLocaleData(localePt);
    const date1 = new Date();
    const delay = 60000 - (date1.getSeconds() * 1000 + date1.getMilliseconds()); // Delay until the start of the next minute
    this.updateDate()
    setTimeout(() => {
      this.updateDate();
      this.interval = setInterval(() => {
        this.updateDate();
      }, 60000);
    }, delay);
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.imageTimeout){
      clearTimeout(this.imageTimeout)
    }
    if(this.imageDelay){
      clearInterval(this.imageDelay)
    }
  }

  /*
   * Update current date for exhibition
   */
  private updateDate(): void {
    const currentDate = new Date();
    this.date = this.datePipe.transform(currentDate, 'dd \'de\' MMMM \'de\' yyyy', this.locale);
    this.time = this.datePipe.transform(currentDate, 'HH\'h\'mm\'min\'', this.locale)
    const nextDate: string = currentDate.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    if (this.currentDate && nextDate !== this.currentDate){
      this.currentDate = nextDate;
      this.base64 = '';
      this.peak = 0;
      this.donutChartData = [];
      this.lineChartData = [];
      this.loadInitialData()
    } else if (!this.currentDate){
      this.currentDate = nextDate;
    }
  }


  /** Gets the data from a specified minute since the start of the day from backend.
   * Also adds the data point to the graph and retrieves its corresponding image.
   * 
   * @param minute 
   */
  private updateVisualizationSection(minute: number){
    var minutes = minute;
    if (!minute)
      minutes = 0;
    const totalSeconds = minutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = Math.floor(remainingSeconds % 60);
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    const timeString: string = `${formattedHours}-${formattedMins}-${formattedSecs}`;
    this.imageService.getImageInfo(this.camera, this.currentDate!, timeString).subscribe( (imageDTO) => {
      this.lineChartData = [...this.lineChartData, {x: imageDTO.x,
                                                    y: imageDTO.y}] // Updates graph data points
      if (this.auto)
        this.variableService.setClickedPointData({x: imageDTO.x,
                                                  y: imageDTO.y});
      if(imageDTO.y > this.peak){
        this.peak = imageDTO.y; // Updates current peak if amount of vehicles is greater than peak
      }
    })
  }

  /**
   * Fetches the initial data for the selected camera
   */
  loadInitialData(): void {
    if (this.imageTimeout){
      clearTimeout(this.imageTimeout);
      this.imageTimeout = null; // Clear timeout to avoid multiple timeouts
    }
    if (this.imageDelay){
      clearInterval(this.imageDelay);
      this.imageDelay = null; // Clear delay to avoid multiple concurrent delays
    }
    this.imageService.getDataPoints(this.camera, this.currentDate!).subscribe(
      (newDataPoints: DataPoint[]) => {
        this.lineChartData = newDataPoints.filter(item => {
          const minute = item.x % this.multiple;
          return minute === 0;
        }); // Filters data using the selected interval for data points
        this.variableService.setClickedPointData(this.getHighestX(this.lineChartData));
        if (this.variableService.getClickedPointData() != null) 
          this.loadCurrentImage(this.variableService.getClickedPointData()!.x);
        this.peak = this.getHighestY(newDataPoints)
      },
      (error) => {
        console.error('Error fetching initial data:', error);
      }
    );
    const date = new Date();
    var delay = (this.multiple * 60 - (date.getMinutes() % this.multiple) * 60) - date.getSeconds() + 30; // Delay until a time multiple of the interval selected
    const dateStart = new Date(date.getTime() + 1000 * delay); // Corresponding time of the start time
    if(delay > (this.multiple * 60)) delay = delay - (this.multiple * 60);
    this.imageTimeout = setTimeout(() => {
      clearTimeout(this.imageTimeout)
      this.imageTimeout = null; // Timeout cleared
      var currentHighest = (dateStart.getHours() * 60 + dateStart.getMinutes()) % 1440;
      this.updateVisualizationSection(currentHighest);
      this.imageDelay = setInterval(() => {
      currentHighest = (currentHighest + this.multiple) % 1440;
      this.updateVisualizationSection(currentHighest);
      }, this.multiple * 1000 * 60); // Repeat every *interval* minutes
    }, delay * 1000); // Wait until nearest minute multiple of the interval chosen + 30s
  }

  loadCurrentImage(minutes?: number): void {
    var minute: number | undefined = minutes;
    
    if (this.currentDataPoint){
      minute = this.currentDataPoint!.x;
    } else {
      if (!minute){
        return;
      }
    }

    const totalSeconds = minute! * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = Math.floor(remainingSeconds % 60);
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    const timeString: string = `${formattedHours}-${formattedMins}-${formattedSecs}`;
    this.imageService.getFullImage(this.camera, this.currentDate!, timeString).subscribe(
      (dto: ImageFullDTO) => {
        this.totalVehicles = dto.detections.length
        var list: number[] = [0,0,0,0];
        this.base64 = 'data:image/jpeg;base64,' + dto.image;
        dto.detections.forEach((detection, index) => {
          list[this.classdict[detection["label"]] as number] += 1
        })
        this.donutChartData = list // Update donut data with the current image data
      },
      (error) => {
        console.error('Error fetching current data:', error);
      }
    );
  }

  private getHighestX(dataPoints: DataPoint[]): DataPoint | null {
    if (!dataPoints || dataPoints.length === 0) {
      return null; 
    }
    return dataPoints.reduce((maxPoint, point) => {
      return point.x > maxPoint.x ? point : maxPoint;
    }, dataPoints[0]);
  }

  private getHighestY(dataPoints: DataPoint[]): number {
    if (!dataPoints || dataPoints.length === 0) {
      return -Infinity; // 
    }
    return dataPoints.reduce((max, point) => {
      return Math.max(max, point.y);
    }, -Infinity);
  }
}