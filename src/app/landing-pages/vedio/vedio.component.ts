import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoData, VideoPart } from '../../shared/interfaces/video-data.model';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { CommonModule } from '@angular/common';
import { EncryptedPayload, ValidatedPayload } from '../../shared/interfaces/data.model';

@Component({
  selector: 'app-vedio',
  imports: [CommonModule],
  templateUrl: './vedio.component.html',
  styleUrls: ['./vedio.component.scss'],
})
export class VedioComponent implements OnInit {
  validatedPayload: ValidatedPayload | null = null; // The decrypted and validated payload
  encryptedPayload: EncryptedPayload | null = null; // The encrypted payload
  videoData: VideoData | null = null; // Holds the video data after decryption
  currentHtmlContent: string | null = null; // The HTML content displayed in the floating container
  valid: boolean = false; // Indicates whether the data is valid
  errorMessage: string | null = null; // Stores any error messages

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    private route: ActivatedRoute,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    // Retrieve and decrypt data from the URL
    this.route.queryParams.subscribe({
      next: (params) => this.handleDecryption(params['data']),
      error: (error) => this.handleError('Failed to retrieve query parameters.', error),
    });
  }

  private handleDecryption(encryptedData: string | undefined): void {
    if (!encryptedData) {
      this.setErrorMessage('No data provided in the URL.');
      return;
    }

    try {
      this.validatedPayload = this.encryptionService.decryptData(encryptedData);

      if (!this.validatedPayload) {
        this.setErrorMessage('Failed to validate the decrypted payload.');
        return;
      }

      this.valid = this.validatedPayload.valid;

      if (this.valid) {
        if (this.validatedPayload.data && 'videoUrl' in this.validatedPayload.data) {
          this.encryptedPayload = this.validatedPayload.data;
          this.videoData = this.encryptedPayload.data as VideoData;
        } else {
          this.setErrorMessage('Decrypted data is not valid for a video.');
        }
      } else {
        this.setErrorMessage('The data is no longer valid.');
      }
    } catch (error) {
      this.handleError('Error decrypting data.', error);
    }
  }

  private setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.valid = false;
    this.videoData = null;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.setErrorMessage(message);
  }

  onTimeUpdate(currentTime: number): void {
    if (!this.videoData || !this.videoData.jsonData) return;

    // Find the current part based on the video time
    const currentPart: VideoPart | undefined = this.videoData.jsonData.find(
      (part) => currentTime >= part.startTime && currentTime <= part.endTime
    );

    // Load and display the HTML content for the current part
    if (currentPart) {
      this.loadHtmlContent(currentPart.htmlFileUrl);
    }
  }

  private loadHtmlContent(htmlFileUrl: string): void {
    if (this.currentHtmlContent !== htmlFileUrl) {
      fetch(htmlFileUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load HTML file: ${response.statusText}`);
          }
          return response.text();
        })
        .then((html) => {
          this.currentHtmlContent = html;
        })
        .catch((error) => {
          console.error('Error loading HTML content:', error);
          this.currentHtmlContent = '<p>Error loading content.</p>';
        });
    }
  }
}
