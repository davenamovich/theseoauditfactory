'use client';

// Shared client-side types + start-audit helper used by views.
export interface StartAuditPayload {
  url: string;
  businessName?: string;
  industry?: string;
  location?: string;
}

export interface StartAuditResponse {
  id?: string;
  shareId?: string;
  cached?: boolean;
  note?: string;
  error?: string;
}
