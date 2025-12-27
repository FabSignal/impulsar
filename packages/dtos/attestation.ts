/**
 * Attestation DTO converters (API ↔ Runtime)
 */
import type { AttestationDocument } from '@impulsar/contracts';

/**
 * Attestation with Date objects (internal runtime)
 */
export interface AttestationDocumentRuntime {
  period: string;
  navPrevious: number;
  navNew: number;
  yieldPercentage: number;
  totalAum: number;
  reportHash: string;
  signatures: {
    custodian: string;
    auditor: string;
  };
  attestedAt: Date;
}

/**
 * Converts AttestationDocument DTO to runtime format
 */
export const deserializeAttestation = (dto: AttestationDocument): AttestationDocumentRuntime => ({
  ...dto,
  attestedAt: new Date(dto.attestedAt),
});

/**
 * Converts AttestationDocumentRuntime to AttestationDocument DTO
 */
export const serializeAttestation = (runtime: AttestationDocumentRuntime): AttestationDocument => ({
  ...runtime,
  attestedAt: runtime.attestedAt.toISOString(),
});