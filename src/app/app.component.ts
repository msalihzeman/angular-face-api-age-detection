import { Component } from '@angular/core';
import { FaceDetectionComponent } from './face-detection/face-detection.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FaceDetectionComponent],
  template: '<app-face-detection></app-face-detection>'
})
export class AppComponent { }
