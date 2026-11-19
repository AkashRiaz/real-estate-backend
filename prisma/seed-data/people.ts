/**
 * Seed accounts. Demo accounts (one per role) come from .env (DEMO_*).
 * Every other seeded account uses SEED_PASSWORD below.
 * Emails use RFC 2606 reserved domains so no real inbox ever receives mail.
 */
export const SEED_PASSWORD = "Estate@2026";

export interface ISeedAgent {
  key: string;
  name: string;
  email: string;
  phone: string;
  agencyName: string;
  licenseNumber: string;
  bio: string;
  experienceYears: number;
  serviceAreas: string[];
  isVerified: boolean;
  joinedDaysAgo: number;
}

export interface ISeedUser {
  key: string;
  name: string;
  email: string;
  phone: string;
  joinedDaysAgo: number;
}

// "demo" is filled from .env at runtime (DEMO_AGENT_*).
export const AGENTS: ISeedAgent[] = [
  {
    key: "demo",
    name: "",
    email: "",
    phone: "01711223344",
    agencyName: "Hasan Properties Ltd.",
    licenseNumber: "REHAB-DHK-2019-0412",
    bio: "Residential specialist for Gulshan, Banani, Baridhara and Bashundhara. Over nine years I have helped more than 300 families and expatriate professionals buy and rent apartments in north Dhaka, handling everything from price negotiation to RAJUK document checks.",
    experienceYears: 9,
    serviceAreas: ["Gulshan", "Banani", "Baridhara", "Bashundhara R/A"],
    isVerified: true,
    joinedDaysAgo: 360,
  },
  {
    key: "shirin",
    name: "Shirin Akter",
    email: "shirin.akter@akterhomes.example.com",
    phone: "01819456721",
    agencyName: "Akter Homes & Realty",
    licenseNumber: "REHAB-DHK-2016-0198",
    bio: "Born and raised in Dhanmondi, I focus on family apartments in Dhanmondi, Lalmatia and Mohammadpur. I know which buildings have reliable generators, good school access and honest developers.",
    experienceYears: 12,
    serviceAreas: ["Dhanmondi", "Lalmatia", "Mohammadpur", "Mirpur DOHS"],
    isVerified: true,
    joinedDaysAgo: 352,
  },
  {
    key: "rakib",
    name: "Rakibul Islam",
    email: "rakibul@portcityproperties.example.com",
    phone: "01913887254",
    agencyName: "Port City Properties",
    licenseNumber: "REHAB-CTG-2018-0077",
    bio: "Chattogram property consultant covering Khulshi, Nasirabad, GEC and Agrabad. I work with port and garment-sector professionals looking for apartments, offices and long-term rentals in the city.",
    experienceYears: 8,
    serviceAreas: ["Khulshi", "Nasirabad", "GEC", "Agrabad"],
    isVerified: true,
    joinedDaysAgo: 340,
  },
  {
    key: "mahbub",
    name: "Mahbub Alam",
    email: "mahbub.alam@uttararealty.example.com",
    phone: "01552678903",
    agencyName: "Uttara Realty Hub",
    licenseNumber: "REHAB-DHK-2020-0533",
    bio: "Plots and family homes in Uttara, Purbachal and Gazipur. I help buyers check land records, mutation papers and RAJUK plot allotments before any money changes hands.",
    experienceYears: 6,
    serviceAreas: ["Uttara", "Purbachal", "Gazipur", "Savar"],
    isVerified: true,
    joinedDaysAgo: 320,
  },
  {
    key: "farzana",
    name: "Farzana Chowdhury",
    email: "farzana@sylhetgreenestates.example.com",
    phone: "01717904562",
    agencyName: "Sylhet Green Estates",
    licenseNumber: "REHAB-SYL-2017-0041",
    bio: "Sylhet-based agent working with returning expatriates from the UK and the Middle East who want homes, duplexes and land around Uposhohor, Zindabazar and Shibganj.",
    experienceYears: 10,
    serviceAreas: ["Uposhohor", "Zindabazar", "Shibganj"],
    isVerified: true,
    joinedDaysAgo: 300,
  },
  {
    key: "imran",
    name: "Imran Hossain",
    email: "imran@coastallivingbd.example.com",
    phone: "01821556019",
    agencyName: "Coastal Living BD",
    licenseNumber: "REHAB-CXB-2021-0012",
    bio: "Holiday homes, sea-view apartments and land along Kolatoli and the Marine Drive in Cox's Bazar. I also manage short and long-term rentals for owners who live abroad.",
    experienceYears: 5,
    serviceAreas: ["Kolatoli", "Inani", "Sugandha"],
    isVerified: false,
    joinedDaysAgo: 250,
  },
  {
    key: "nadia",
    name: "Nadia Rahman",
    email: "nadia@northernhomes.example.com",
    phone: "01611348275",
    agencyName: "Northern Homes",
    licenseNumber: "REHAB-RAJ-2019-0063",
    bio: "Affordable family houses and apartments in Rajshahi, Khulna and Mymensingh. Many of my clients are first-time buyers and government officers on transfer.",
    experienceYears: 7,
    serviceAreas: ["Uposhohor (Rajshahi)", "Sonadanga", "Ganginarpar"],
    isVerified: true,
    joinedDaysAgo: 210,
  },
];

// "demo" is filled from .env at runtime (DEMO_USER_*).
export const USERS: ISeedUser[] = [
  { key: "demo", name: "", email: "", phone: "01912345678", joinedDaysAgo: 330 },
  { key: "ayesha", name: "Ayesha Siddiqua", email: "ayesha.siddiqua@example.com", phone: "01712908345", joinedDaysAgo: 345 },
  { key: "kamrul", name: "Kamrul Hasan", email: "kamrul.hasan@example.com", phone: "01815234590", joinedDaysAgo: 330 },
  { key: "sabrina", name: "Sabrina Haque", email: "sabrina.haque@example.net", phone: "01914560238", joinedDaysAgo: 300 },
  { key: "tahmid", name: "Tahmid Rahman", email: "tahmid.rahman@example.com", phone: "01558432109", joinedDaysAgo: 280 },
  { key: "jannat", name: "Jannatul Ferdous", email: "jannatul.ferdous@example.org", phone: "01677120934", joinedDaysAgo: 250 },
  { key: "mehedi", name: "Mehedi Hasan", email: "mehedi.hasan@example.com", phone: "01733098721", joinedDaysAgo: 220 },
  { key: "riya", name: "Riya Das", email: "riya.das@example.net", phone: "01822345671", joinedDaysAgo: 190 },
  { key: "shafiq", name: "Shafiqul Islam", email: "shafiqul.islam@example.com", phone: "01911223398", joinedDaysAgo: 160 },
  { key: "lamia", name: "Lamia Akter", email: "lamia.akter@example.org", phone: "01521987654", joinedDaysAgo: 120 },
  { key: "zahid", name: "Zahid Hossain", email: "zahid.hossain@example.com", phone: "01788665544", joinedDaysAgo: 75 },
  { key: "proma", name: "Proma Saha", email: "proma.saha@example.net", phone: "01633221100", joinedDaysAgo: 40 },
  { key: "arif", name: "Arif Chowdhury", email: "arif.chowdhury@example.com", phone: "01944556677", joinedDaysAgo: 15 },
];
