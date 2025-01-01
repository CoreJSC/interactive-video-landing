import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../services/encryption/encryption.service';
import { EncryptedPayload, Metadata } from '../shared/interfaces/data.model';
import { VideoData, VideoPart } from '../shared/interfaces/video-data.model';

@Component({
  selector: 'app-dynamic-encryption',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dynamic-encryption.component.html',
  styleUrls: ['./dynamic-encryption.component.scss'],
})
export class DynamicEncryptionComponent implements OnInit {
  dataTypes: string[] = ['Video']; // Extendable for more types
  encryptionForm: FormGroup;
  encryptedData: string = '';

  constructor(private fb: FormBuilder, private encryptionService: EncryptionService) {
    this.encryptionForm = this.fb.group({
      dataType: ['Video', Validators.required], // Data type selection
      metadata: this.fb.group({
        creationDate: [this.getCurrentDateTimeLocal(), Validators.required],
        startAfterDays: [0, [Validators.required, Validators.min(0)]],
        validityDays: [30, [Validators.required, Validators.min(1)]],
      }),
      data: this.fb.group({}), // Placeholder for dynamic data
    });
  }

  ngOnInit(): void {
    this.buildForm();

    // Listen to dataType changes to rebuild the form dynamically
    this.encryptionForm.get('dataType')?.valueChanges.subscribe((type) => {
      this.buildForm();
    });
  }

  // Helper to get current date in 'yyyy-MM-ddTHH:mm' format for datetime-local input
  getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().substring(0, 16);
  }

  buildForm(): void {
    const dataGroup = this.encryptionForm.get('data') as FormGroup;
    dataGroup.reset(); // Clear existing controls

    if (this.encryptionForm.get('dataType')?.value === 'Video') {
      const videoGroup = this.fb.group({
        videoUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
        screenSize: this.fb.group({
          width: [1920, [Validators.required, Validators.min(1)]],
          height: [1080, [Validators.required, Validators.min(1)]],
        }),
        htmlFileUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
        ccFileUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
        jsonData: this.fb.array([this.createVideoPart()]),
      });

      dataGroup.addControl('video', videoGroup);
    }
    // Add more data types here if needed
  }

  createVideoPart(): FormGroup {
    return this.fb.group({
      startTime: [0, [Validators.required, Validators.min(0)]],
      endTime: [10, [Validators.required, Validators.min(1)]],
      htmlFileUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
    });
  }

  get jsonData(): FormArray {
    return (this.encryptionForm.get('data')?.get('video') as FormGroup)?.get('jsonData') as FormArray;
  }

  addVideoPart(): void {
    this.jsonData.push(this.createVideoPart());
  }

  removeVideoPart(index: number): void {
    if (this.jsonData.length > 1) {
      this.jsonData.removeAt(index);
    }
  }

  encrypt(): void {
    if (this.encryptionForm.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    const metadata: Metadata = this.encryptionForm.value.metadata;
    let data: VideoData | null = null;

    if (this.encryptionForm.get('dataType')?.value === 'Video') {
      const videoGroup = this.encryptionForm.get('data')?.get('video') as FormGroup;
      data = {
        videoUrl: videoGroup.value.videoUrl,
        screenSize: videoGroup.value.screenSize,
        htmlFileUrl: videoGroup.value.htmlFileUrl,
        ccFileUrl: videoGroup.value.ccFileUrl,
        jsonData: videoGroup.value.jsonData as VideoPart[],
      };
    }

    const payload: EncryptedPayload = {
      metadata,
      data,
    };

    console.log('Encrypted Payload:', payload);
    this.encryptedData = this.encryptionService.encryptData(payload);
  }
}
