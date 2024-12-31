import { Routes } from '@angular/router';
import { DynamicEncryptionComponent } from './dynamic-encryption/dynamic-encryption.component';
import { VedioComponent } from './landing-pages/vedio/vedio.component';

export const routes: Routes = [
    { path: 'vedio', component: VedioComponent },
    { path: 'encrypt', component: DynamicEncryptionComponent },
];