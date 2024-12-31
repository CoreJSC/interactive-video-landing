import { Component } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { routes } from './app.routes';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'interactive-video-landing';
  appRoutes: Routes = [];

  constructor(private router: Router) {
    this.appRoutes = routes.filter(route => route.path);
  }
}
