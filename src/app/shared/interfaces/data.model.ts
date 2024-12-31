import { VideoData } from "./video-data.model";

export interface Metadata {
    creationDate: string;   // ISO 8601 format (e.g., "2024-12-30T12:00:00Z")
    validityDays: number;   // Number of days the data is valid
}

export interface EncryptedPayload {
    metadata: Metadata;     // Metadata for validity and creation details
    data: VideoData | null; // Actual data payload (e.g., video or other)
}
