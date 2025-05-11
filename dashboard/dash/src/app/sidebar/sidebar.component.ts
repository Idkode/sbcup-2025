import { Component, OnDestroy, OnInit } from '@angular/core';
import { VariablesService } from '../variables.service';
import { Subscription, filter } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { routes } from '../app.routes';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentScreen: string = '';
  private subscription: Subscription | undefined;

  constructor(public selectedScreenService: VariablesService,
              private router: Router
  ) {
    this.subscription = this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.currentScreen = event.urlAfterRedirects;
      this.selectedScreenService.setSelectedScreen(event.url)
    });
  }

  ngOnInit(): void {
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.selectedScreenService.setSelectedScreen(route);
  }
}
