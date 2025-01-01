import { Component } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { routes } from '../app.routes';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  title = 'interactive-video-landing';
  appRoutes: Routes = [];

  constructor(private router: Router) {
    this.appRoutes = routes.filter(route => route.path);
  }
}
