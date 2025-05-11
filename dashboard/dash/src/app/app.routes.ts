import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    {path: 'dashboard', component: DashboardComponent},
    {path: 'inicio', redirectTo: "/dashboard"},
    {path: 'configuracoes', component: SettingsComponent},
    {path: 'cidades', redirectTo: "/dashboard"},
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: '**', redirectTo: '/dashboard'}
];
