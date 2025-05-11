import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { VariablesService } from '../variables.service';

/**
 * Interface to help with chart creation
 */
interface DataPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnChanges, OnInit {
  @Input() data: DataPoint[] = [];

  public lineChartData: ChartData<'line'> = {
    labels: [], 
    datasets: [
      {
        data: [],
        label: 'Número de veículos',
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        borderColor: '#673ab7',
        backgroundColor: 'rgba(103,58,183,0.3)',
        pointBackgroundColor: '#673ab7',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(103,58,183,0.8)',
      }
    ]
  };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const clickedElement = elements[0];
        const index = clickedElement.index;
        const datasetIndex = clickedElement.datasetIndex;

        const clickedDataPoint = chart.data.datasets[datasetIndex].data[index] as DataPoint;
        this.service.setClickedPointData(clickedDataPoint); // Update selected point when clicking a point
      } else {
        console.log('No data point clicked.');
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Horário'
        },
        ticks: {
          stepSize: 10,
          callback: function(value: number | string) {
            if (typeof(value) == 'number'){
              const hour = Math.floor(value / 60);
              const minute = value % 60;
              const formattedHour = String(hour).padStart(2, '0');
              const formattedMinute = String(minute).padStart(2, '0');
              return `${formattedHour}:${formattedMinute}`;
            }
            return value;
          }
        },
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: ''
        },
        min: 0 // No negative number of vehicles
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y !== null ? context.parsed.y : 'N/A';
            return `${label}: ${value}`;
          },
          title: (context) => {
            const value = context[0].parsed.x;
            const hour = Math.floor(value / 60);
              const minute = value % 60;
              const formattedHour = String(hour).padStart(2, '0');
              const formattedMinute = String(minute).padStart(2, '0');
              return `${formattedHour}:${formattedMinute}`;
          }
        }
      } 
    }
  };
  public lineChartType: ChartType = 'line';

  constructor(private service: VariablesService) { }
  
  ngOnInit(): void {
    this.updateChart()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (this.data && this.data.length > 0) {
      this.lineChartData.datasets[0].data = [...this.data];
      this.lineChartData.labels = Array.from({ length: this.data.length }, (_, i) => i);
    } else {
      this.lineChartData.datasets[0].data = [];
      this.lineChartData.labels = [];
    }
  }
}
