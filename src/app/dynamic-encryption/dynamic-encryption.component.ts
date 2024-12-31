import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncryptionService } from '../services/encryption/encryption.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-encryption',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dynamic-encryption.component.html',
  styleUrls: ['./dynamic-encryption.component.scss'],
})
export class DynamicEncryptionComponent {
  encryptionForm: FormGroup; // Form group for dynamic data input
  encryptedData: string[] = []; // List of encrypted results for the dropdown

  constructor(
    private fb: FormBuilder,
    private encryptionService: EncryptionService
  ) {
    // Initialize the form
    this.encryptionForm = this.fb.group({
      type: ['video', Validators.required], // Default to "video"
      videoUrl: ['', Validators.required],
      jsonData: ['', Validators.required], // JSON data input
      validityDays: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    if (this.encryptionForm.valid) {
      const formData = this.encryptionForm.value;

      // Parse JSON data input
      let parsedJsonData;
      try {
        parsedJsonData = JSON.parse(formData.jsonData);
      } catch (error) {
        alert('Invalid JSON format for "jsonData". Please check your input.');
        return;
      }

      // Create payload
      const payload = {
        type: formData.type,
        videoUrl: formData.videoUrl,
        jsonData: parsedJsonData,
      };

      // Encrypt data
      const encrypted = this.encryptionService.encryptData(payload, formData.validityDays);
      this.encryptedData.push(encrypted); // Add to dropdown list
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
