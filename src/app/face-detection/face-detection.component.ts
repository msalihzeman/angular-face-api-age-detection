import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-detection',
  templateUrl: './face-detection.component.html',
  styleUrls: ['./face-detection.component.css'],
  standalone: true,
  imports: [NgIf]
})
export class FaceDetectionComponent implements OnInit {
  @ViewChild('video', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  age: number | null = null;
  mood: string | null = null;

  constructor(private ngZone: NgZone) { }

  async ngOnInit() {
    console.log('FaceDetectionComponent initialized');
    try {
      await this.loadModels();
      console.log('Models loaded successfully');
      await this.startVideo();
      console.log('Video started');
      this.detect();
      console.log('Detection started');
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async loadModels() {
    const MODEL_URL = '/assets/models/';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  }

  startVideo() {
    return navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      })
      .catch(err => console.error(err));
  }

  detect() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    this.ngZone.runOutsideAngular(() => {
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video)
          .withFaceExpressions()
          .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        if (resizedDetections.length > 0) {
          const { age, expressions } = resizedDetections[0];

          this.ngZone.run(() => {
            this.age = Math.round(age);
            this.mood = this.getMaxExpression(expressions);
          });
        }
      }, 100);
    });
  }

  getMaxExpression(expressions: faceapi.FaceExpressions): string {
    return Object.entries(expressions).reduce((max, [expression, probability]) =>
      probability > max.probability ? { expression, probability } : max,
      { expression: '', probability: -1 }
    ).expression;
  }
}
