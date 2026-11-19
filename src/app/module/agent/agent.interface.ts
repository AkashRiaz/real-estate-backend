export interface IUpdateMyAgentProfilePayload {
  agencyName?: string;
  licenseNumber?: string | null;
  bio?: string | null;
  experienceYears?: number;
  serviceAreas?: string[];
}

export interface IVerifyAgentPayload {
  isVerified: boolean;
}
