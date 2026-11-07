export type MockAccountRole = "SCHOOL_ADMIN" | "LGU_OFFICER";

export interface MockAccount {
  id: string;
  role: MockAccountRole;
  roleLabel: string;
  name: string;
  title: string;
  email: string;
  division: string;
  station: string;
  location: string;
  schoolName?: string;
  clearanceLevel: string;
  sessionProtocol: string;
  initials: string;
  badgeText: string;
}

export const MOCK_ACCOUNTS: Record<MockAccountRole, MockAccount> = {
  SCHOOL_ADMIN: {
    id: "mock-school-admin",
    role: "SCHOOL_ADMIN",
    roleLabel: "School Admin",
    name: "Mr. Anton Lulu",
    title: "School Principal",
    email: "anton.lulu@ua.edu.ph",
    division: "City of San Fernando",
    station: "University of the Assumption (UA)",
    location: "City of San Fernando, Pampanga",
    schoolName: "University of the Assumption",
    clearanceLevel: "Level 3 • Campus Sentinel & Student Welfare Desk",
    sessionProtocol: "Zero-PII Isolation (RA 10173)",
    initials: "AL",
    badgeText: "UA CAMPUS",
  },
  LGU_OFFICER: {
    id: "mock-lgu-officer",
    role: "LGU_OFFICER",
    roleLabel: "LGU Officer",
    name: "Dr. Katrina Mae Gomez, MD",
    title: "City Health Officer & Risk Coordinator",
    email: "k.gomez@cityofsanfernando.gov.ph",
    division: "City of San Fernando LGU",
    station: "Municipal Risk & Health Telemetry Command",
    location: "City of San Fernando City Hall",
    schoolName: "Multi-School Division Mesh",
    clearanceLevel: "Level 4 • Full Municipal Triage & Heatmap Telemetry",
    sessionProtocol: "Zero-PII Isolation (RA 10173)",
    initials: "KG",
    badgeText: "LGU COMMAND",
  },
};

export const DEFAULT_MOCK_ROLE: MockAccountRole = "SCHOOL_ADMIN";
