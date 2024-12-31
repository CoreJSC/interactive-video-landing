import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoData, VideoPart } from '../../shared/interfaces/video-data.model';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vedio',
  imports: [CommonModule],
  templateUrl: './vedio.component.html',
  styleUrls: ['./vedio.component.scss'],
})
export class VedioComponent implements OnInit {
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
    this.route.queryParams.subscribe((params) => {
      const encryptedData = params['data'];
      if (encryptedData) {
        try {
          const result = this.encryptionService.decryptData(encryptedData);
          this.valid = result.valid;

          if (this.valid) {
            this.videoData = result.data as VideoData;
          } else {
            this.errorMessage = 'The data is no longer valid.';
          }
        } catch (error) {
          console.error('Error decrypting video data:', error);
          this.errorMessage = 'Error decrypting data.';
          this.videoData = null;
        }
      } else {
        this.errorMessage = 'No data provided in the URL.';
      }
    });
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
