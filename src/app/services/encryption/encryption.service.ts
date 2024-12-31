import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../shared/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private secretKey = CryptoJS.enc.Base64.parse(environment.secretKey); // Parse Base64 key

  // Encrypt data with metadata
  encryptData(data: object, validityDays: number): string {
    const payload = {
      creationDate: new Date().toISOString(),
      validityDays,
      data,
    };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), this.secretKey).toString();
    return encodeURIComponent(encrypted); // URL-safe encoding
  }

  // Decrypt data and validate
  decryptData(encryptedData: string): { valid: boolean; data: any } {
    const decoded = decodeURIComponent(encryptedData);
    const bytes = CryptoJS.AES.decrypt(decoded, this.secretKey);
    const jsonString = bytes.toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(jsonString);

    // Validate data
    const creationDate = new Date(payload.creationDate);
    const expirationDate = new Date(creationDate);
    expirationDate.setDate(expirationDate.getDate() + payload.validityDays);
    const now = new Date();

    const valid = now <= expirationDate;

    return { valid, data: payload.data };
  }
}
