import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { color } from 'chart.js/helpers';
import type { Scriptable } from 'chart.js';
import ChartDataLabels from "chartjs-plugin-datalabels";

@Component({
  selector: 'app-donut',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './donut.component.html',
  styleUrl: './donut.component.scss'
})
export class DonutComponent implements OnChanges{
  @Input() currentData: number[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentData'] && !changes['currentData'].isFirstChange())
      this.updateChart();
  }

  public donutDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [
    { data: [],
      backgroundColor: ['#594da3', '#ceb5fd', '#ad88f1', '#d8caf4'],
      // spacing: 0
    }
  ];

  public pieChartPlugins = [ChartDataLabels];

  public options: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    layout: {
      padding: 25
    },
    plugins: {
      legend:{
        display: true,
        position: 'right'
      },
      datalabels: {
        formatter: (value: number, ctx) => {
          if (ctx.chart.data.datasets[0].data){
            const datapoints = ctx.chart.data.datasets[0].data as number[];
            const total: number = datapoints.reduce((total, datapoint) => total + (datapoint || 0), 0);
            const percentage = ((value / total) * 100).toFixed(0) + '%';
            if (percentage != '0%' && percentage != "NaN%")
              return percentage;
          }
          return '';
        },
        color: '#000', // Percentage text color
        backgroundColor: 'transparent',
        textAlign: 'center',
        anchor: 'end',
        align: 'start',
        clip: false,
        offset: -27,
        font: {
          weight: 200,
          size: 10
        }
      }
    }
  };

  /**
   * Update chart data
   */
  private updateChart(): void {
    if (this.currentData && this.currentData.length > 0) {
      this.donutDatasets[0].data = this.currentData
    } else {
      this.donutDatasets[0].data = [];
    }
    this.chart?.update()
   }
}
