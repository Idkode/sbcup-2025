import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VariablesService } from '../variables.service';

/**
 * Simple component to deal with changing the selected interval between points
 */
@Component({
  selector: 'app-settings',
  imports: [SidebarComponent, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  multiple: number = 5;
  options: number[] = [5, 10, 20, 30]; // Interval options between data points

  constructor(private variableService: VariablesService){}

  updateMultiple(){
    this.variableService.setSelectedMultiple(Number(this.multiple));
  }

}
