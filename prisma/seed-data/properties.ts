import {
  ApprovalStatus,
  FurnishingStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "../../src/generated/prisma/enums";

export interface ISeedProperty {
  key: string;
  agent: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  bookingFee: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  division: string;
  city: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  furnishing: FurnishingStatus;
  yearBuilt?: number;
  floor?: number;
  parkingSpaces: number;
  status: PropertyStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  createdDaysAgo: number;
  views: number;
  retail?: boolean;
}

const { APARTMENT, HOUSE, LAND, COMMERCIAL } = PropertyType;
const { SALE, RENT } = PropertyPurpose;
const { AVAILABLE, PENDING, SOLD, RENTED } = PropertyStatus;
const { APPROVED, PENDING: IN_REVIEW, REJECTED } = ApprovalStatus;
const { FURNISHED, SEMI_FURNISHED, UNFURNISHED } = FurnishingStatus;

export const PROPERTIES: ISeedProperty[] = [
  // ---------------- Demo agent: Gulshan / Banani / Baridhara / Bashundhara ----------------
  {
    key: "gulshan-lake-apartment",
    agent: "demo",
    title: "Lake-view 3 bed apartment on Gulshan 2 Road 53",
    description:
      "South-facing 3 bedroom apartment on the 7th floor overlooking Gulshan Lake. The 2,600 sq ft layout has a large living and dining area, a fitted kitchen with a separate maid's kitchen, two balconies and a servant room. The building has a full-time manager, 100% generator backup and two lifts, and it is a five-minute walk to Gulshan 2 circle.",
    type: APARTMENT, purpose: SALE, price: 52000000, bookingFee: 200000, areaSqft: 2600,
    bedrooms: 3, bathrooms: 4, division: "Dhaka", city: "Dhaka", area: "Gulshan",
    address: "House 14, Road 53, Gulshan 2, Dhaka 1212", latitude: 23.7956, longitude: 90.4141,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "CCTV", "Car Parking", "Lake View", "Servant Room", "Intercom"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2021, floor: 7, parkingSpaces: 2,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 340, views: 1840,
  },
  {
    key: "banani-furnished-rent",
    agent: "demo",
    title: "Fully furnished 3 bed apartment for rent in Banani",
    description:
      "Move-in ready 3 bedroom apartment in a quiet lane of Banani Block E, popular with expatriate families. It comes with air-conditioning in every room, a modern kitchen with appliances, curtains, sofas and dining furniture. Rent includes the service charge, and the building has a rooftop gym and a community hall.",
    type: APARTMENT, purpose: RENT, price: 145000, bookingFee: 20000, areaSqft: 2200,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Banani",
    address: "House 41, Road 11, Block E, Banani, Dhaka 1213", latitude: 23.7937, longitude: 90.4043,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Air Conditioning", "Gym", "Community Hall", "Fiber Internet", "Car Parking"],
    furnishing: FURNISHED, yearBuilt: 2019, floor: 5, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 300, views: 1520,
  },
  {
    key: "baridhara-duplex",
    agent: "demo",
    title: "6 bed duplex house in Baridhara Diplomatic Zone",
    description:
      "Rare standalone duplex on a 10 katha plot in Baridhara's diplomatic zone, a short walk from Baridhara Lake and several embassies. The ground floor has formal living and dining rooms, a study and a guest suite. Upstairs there are five bedrooms and a family lounge opening onto a covered terrace. There is a private lawn, parking for four cars and separate staff quarters.",
    type: HOUSE, purpose: SALE, price: 285000000, bookingFee: 500000, areaSqft: 7200,
    bedrooms: 6, bathrooms: 7, division: "Dhaka", city: "Dhaka", area: "Baridhara",
    address: "House 7, Road 4, Baridhara Diplomatic Zone, Dhaka 1212", latitude: 23.8020, longitude: 90.4210,
    amenities: ["Generator Backup", "24/7 Security", "CCTV", "Car Parking", "Servant Room", "Balcony", "Rooftop Garden", "Air Conditioning"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2014, parkingSpaces: 4,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 280, views: 2310,
  },
  {
    key: "bashundhara-3bed-sale",
    agent: "demo",
    title: "Ready 3 bed flat near North South University, Bashundhara",
    description:
      "Brand-new 1,850 sq ft apartment in Block G, Bashundhara R/A, a few minutes from North South University and Evercare Hospital. It has three bedrooms with attached baths, a wide drawing room and a south-east balcony. The flat is handed over with full RAJUK approval and the registration documents are ready.",
    type: APARTMENT, purpose: SALE, price: 19500000, bookingFee: 100000, areaSqft: 1850,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Bashundhara R/A",
    address: "Plot 312, Road 9, Block G, Bashundhara R/A, Dhaka 1229", latitude: 23.8193, longitude: 90.4526,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Car Parking", "Gas Connection", "Fire Safety"],
    furnishing: UNFURNISHED, yearBuilt: 2025, floor: 4, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 120, views: 760,
  },
  {
    key: "gulshan-avenue-office",
    agent: "demo",
    title: "Grade-A office floor for rent on Gulshan Avenue",
    description:
      "A 4,200 sq ft open-plan office floor in a glass-fronted commercial tower on Gulshan Avenue. It has central air-conditioning, raised flooring, dual power lines with 100% generator backup and a fiber backbone from two ISPs. The space suits a regional head office, and there are dedicated parking slots and a reception lobby.",
    type: COMMERCIAL, purpose: RENT, price: 630000, bookingFee: 25000, areaSqft: 4200,
    bedrooms: 0, bathrooms: 4, division: "Dhaka", city: "Dhaka", area: "Gulshan",
    address: "Level 9, 115 Gulshan Avenue, Gulshan 2, Dhaka 1212", latitude: 23.7925, longitude: 90.4078,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "CCTV", "Car Parking", "Air Conditioning", "Fiber Internet", "Fire Safety"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2018, floor: 9, parkingSpaces: 4,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 210, views: 640,
  },
  {
    key: "gulshan1-house-rent",
    agent: "demo",
    title: "Standalone 5 bed house with garden for rent in Gulshan 1",
    description:
      "A two-storey family house on a 7 katha plot in Gulshan 1, with a lawn and covered car porch. There are five bedrooms, a family living room, a formal drawing room and a large kitchen. The house suits embassy staff or a corporate guest house, and it is close to Gulshan 1 DCC Market and the international schools.",
    type: HOUSE, purpose: RENT, price: 600000, bookingFee: 25000, areaSqft: 5200,
    bedrooms: 5, bathrooms: 6, division: "Dhaka", city: "Dhaka", area: "Gulshan",
    address: "House 22, Road 27, Gulshan 1, Dhaka 1212", latitude: 23.7808, longitude: 90.4161,
    amenities: ["Generator Backup", "24/7 Security", "Car Parking", "Servant Room", "Air Conditioning", "Balcony", "Water Reservoir"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2012, parkingSpaces: 3,
    status: RENTED, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 330, views: 1290,
  },
  {
    key: "bashundhara-plot",
    agent: "demo",
    title: "3 katha residential plot in Bashundhara Block I",
    description:
      "A south-facing 3 katha plot on a 30-foot road in Block I, Bashundhara R/A, ready for an immediate building plan. The land has clear title with up-to-date mutation, khajna receipts and the Bashundhara allotment letter. Gas and electricity lines run along the road.",
    type: LAND, purpose: SALE, price: 24000000, bookingFee: 150000, areaSqft: 2160,
    bedrooms: 0, bathrooms: 0, division: "Dhaka", city: "Dhaka", area: "Bashundhara R/A",
    address: "Plot 1187, Road 14, Block I, Bashundhara R/A, Dhaka 1229", latitude: 23.8241, longitude: 90.4489,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: SOLD, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 310, views: 980,
  },
  {
    key: "banani-penthouse",
    agent: "demo",
    title: "Penthouse with private rooftop terrace in Banani",
    description:
      "Top-floor 4 bedroom penthouse with a 900 sq ft private rooftop terrace and an open view across Banani and Gulshan Lake. It has double-height ceilings in the living area, an Italian-style kitchen, a home office and a jacuzzi bathroom in the master suite. It is offered fully furnished.",
    type: APARTMENT, purpose: SALE, price: 89000000, bookingFee: 300000, areaSqft: 4100,
    bedrooms: 4, bathrooms: 5, division: "Dhaka", city: "Dhaka", area: "Banani",
    address: "House 68, Road 17, Banani, Dhaka 1213", latitude: 23.7905, longitude: 90.4005,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "CCTV", "Rooftop Garden", "Air Conditioning", "Lake View", "Car Parking", "Intercom"],
    furnishing: FURNISHED, yearBuilt: 2023, floor: 12, parkingSpaces: 2,
    status: AVAILABLE, approvalStatus: IN_REVIEW, isFeatured: false, createdDaysAgo: 3, views: 0,
  },
  {
    key: "baridhara-studio",
    agent: "demo",
    title: "Serviced studio apartment near Baridhara J Block",
    description:
      "A compact serviced studio for short-term business travellers, with a queen bed, a work desk and a kitchenette. Weekly housekeeping is included.",
    type: APARTMENT, purpose: RENT, price: 65000, bookingFee: 10000, areaSqft: 650,
    bedrooms: 1, bathrooms: 1, division: "Dhaka", city: "Dhaka", area: "Baridhara",
    address: "Road 12, Baridhara J Block, Dhaka 1212", latitude: 23.8064, longitude: 90.4257,
    amenities: ["Lift", "Air Conditioning", "Fiber Internet"],
    furnishing: FURNISHED, yearBuilt: 2016, floor: 3, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: REJECTED,
    rejectionReason: "Please add photos of the actual unit and the building's trade licence for serviced apartments.",
    isFeatured: false, createdDaysAgo: 12, views: 0,
  },

  // ---------------- Shirin: Dhanmondi / Lalmatia / Mohammadpur / Mirpur DOHS ----------------
  {
    key: "dhanmondi-lake-apartment",
    agent: "shirin",
    title: "Family apartment near Dhanmondi Lake, Road 8A",
    description:
      "A well-kept 3 bedroom apartment two minutes from Dhanmondi Lake and Rabindra Sarobar. The 2,100 sq ft unit has a long drawing-dining hall, three balconies and a separate prayer room. The building is fifteen years old with a strong owners' association, reliable water supply and a full generator.",
    type: APARTMENT, purpose: SALE, price: 28000000, bookingFee: 100000, areaSqft: 2100,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Dhanmondi",
    address: "House 52, Road 8A, Dhanmondi, Dhaka 1209", latitude: 23.7465, longitude: 90.3760,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Car Parking", "Gas Connection", "Prayer Room", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2010, floor: 6, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 290, views: 1430,
  },
  {
    key: "dhanmondi-rent-3bed",
    agent: "shirin",
    title: "3 bed flat for rent on Satmasjid Road, Dhanmondi",
    description:
      "A bright 1,700 sq ft family flat on Satmasjid Road, close to Abahani Field and several English-medium schools. It has three bedrooms, two baths and a guest toilet, with a gas line, an IPS connection and a dedicated car park.",
    type: APARTMENT, purpose: RENT, price: 55000, bookingFee: 10000, areaSqft: 1700,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Dhanmondi",
    address: "House 19, Satmasjid Road, Dhanmondi, Dhaka 1209", latitude: 23.7489, longitude: 90.3719,
    amenities: ["Lift", "Generator Backup", "Car Parking", "Gas Connection", "Intercom"],
    furnishing: UNFURNISHED, yearBuilt: 2012, floor: 4, parkingSpaces: 1,
    status: RENTED, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 270, views: 1105,
  },
  {
    key: "lalmatia-2bed",
    agent: "shirin",
    title: "Cosy 2 bed apartment in Lalmatia Block D",
    description:
      "A 1,150 sq ft apartment on a tree-lined street in Lalmatia, ideal for a young couple or a small family. There are two bedrooms, an open living-dining space and a sunny south balcony. Lalmatia Mohila College and Asad Gate bus stops are close by.",
    type: APARTMENT, purpose: SALE, price: 12500000, bookingFee: 50000, areaSqft: 1150,
    bedrooms: 2, bathrooms: 2, division: "Dhaka", city: "Dhaka", area: "Lalmatia",
    address: "House 6/11, Block D, Lalmatia, Dhaka 1207", latitude: 23.7550, longitude: 90.3687,
    amenities: ["Lift", "Generator Backup", "Gas Connection", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2015, floor: 3, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 150, views: 540,
  },
  {
    key: "mohammadpur-rent-2bed",
    agent: "shirin",
    title: "Affordable 2 bed flat for rent in Mohammadpur Housing",
    description:
      "A budget-friendly 1,000 sq ft flat in Mohammadpur Housing Estate with two bedrooms, a dining space and a kitchen with gas. Walking distance to Town Hall market and Mohammadpur bus stand.",
    type: APARTMENT, purpose: RENT, price: 22000, bookingFee: 5000, areaSqft: 1000,
    bedrooms: 2, bathrooms: 2, division: "Dhaka", city: "Dhaka", area: "Mohammadpur",
    address: "Road 3, Mohammadpur Housing Estate, Dhaka 1207", latitude: 23.7662, longitude: 90.3589,
    amenities: ["Gas Connection", "Water Reservoir", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2008, floor: 2, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 60, views: 410,
  },
  {
    key: "mirpur-dohs-apartment",
    agent: "shirin",
    title: "Corner apartment in Mirpur DOHS with park view",
    description:
      "An 1,800 sq ft corner unit facing the central park of Mirpur DOHS, in a secure, well-planned cantonment-adjacent neighbourhood. Three bedrooms, a family lounge, two balconies and a reserved parking bay. The area has a supermarket and a mosque, and a school is within walking distance.",
    type: APARTMENT, purpose: SALE, price: 21000000, bookingFee: 100000, areaSqft: 1800,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Mirpur DOHS",
    address: "House 412, Avenue 5, Mirpur DOHS, Dhaka 1216", latitude: 23.8366, longitude: 90.3695,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "CCTV", "Car Parking", "Kids Play Area", "Gas Connection"],
    furnishing: UNFURNISHED, yearBuilt: 2018, floor: 5, parkingSpaces: 1,
    status: SOLD, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 250, views: 1210,
  },
  {
    key: "dhanmondi-retail",
    agent: "shirin",
    title: "Ground-floor retail space on Dhanmondi 27",
    description:
      "A 1,100 sq ft street-facing retail unit with a 22-foot glass frontage on busy Dhanmondi Road 27. It suits a café, pharmacy or fashion brand. The space has a mezzanine storage area, a separate washroom and on-street visibility from both directions.",
    type: COMMERCIAL, purpose: RENT, price: 210000, bookingFee: 25000, areaSqft: 1100,
    bedrooms: 0, bathrooms: 1, division: "Dhaka", city: "Dhaka", area: "Dhanmondi",
    address: "Holding 74, Road 27 (Old), Dhanmondi, Dhaka 1209", latitude: 23.7553, longitude: 90.3741,
    amenities: ["Generator Backup", "CCTV", "Fire Safety"],
    furnishing: UNFURNISHED, yearBuilt: 2013, floor: 0, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 95, views: 380, retail: true,
  },

  // ---------------- Rakib: Chattogram ----------------
  {
    key: "khulshi-hill-apartment",
    agent: "rakib",
    title: "Hill-view 3 bed apartment in South Khulshi",
    description:
      "A 1,750 sq ft apartment on a gentle hill in South Khulshi with views of the green slopes and the port city skyline. There are three bedrooms, a large drawing room and a wraparound balcony. The building has a lift, a generator and a guarded entrance, and it is close to Chittagong Club and Khulshi Town Centre.",
    type: APARTMENT, purpose: SALE, price: 14000000, bookingFee: 75000, areaSqft: 1750,
    bedrooms: 3, bathrooms: 3, division: "Chattogram", city: "Chattogram", area: "Khulshi",
    address: "Road 2, South Khulshi R/A, Chattogram 4225", latitude: 22.3604, longitude: 91.8094,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Car Parking", "Gas Connection", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2017, floor: 6, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 260, views: 990,
  },
  {
    key: "nasirabad-rent",
    agent: "rakib",
    title: "3 bed family flat for rent in Nasirabad Housing",
    description:
      "A spacious 1,600 sq ft rental in Nasirabad Housing Society, a quiet residential pocket near GEC Circle. It has three bedrooms, a family dining area and a balcony. Gas, water and IPS are all in place, and the flat is suitable for families working at the port or in the EPZ.",
    type: APARTMENT, purpose: RENT, price: 38000, bookingFee: 8000, areaSqft: 1600,
    bedrooms: 3, bathrooms: 2, division: "Chattogram", city: "Chattogram", area: "Nasirabad",
    address: "Road 1, Nasirabad Housing Society, Chattogram 4209", latitude: 22.3660, longitude: 91.8240,
    amenities: ["Lift", "Generator Backup", "Gas Connection", "Car Parking"],
    furnishing: UNFURNISHED, yearBuilt: 2014, floor: 3, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 200, views: 620,
  },
  {
    key: "agrabad-office",
    agent: "rakib",
    title: "Office space for sale in Agrabad commercial area",
    description:
      "A 3,800 sq ft office floor in Agrabad, Chattogram's banking and shipping district, a short drive from the port and Bangladesh Bank's regional office. It has been partitioned into eight cabins, a conference room and an open workstation area, with central AC and two lifts.",
    type: COMMERCIAL, purpose: SALE, price: 38000000, bookingFee: 150000, areaSqft: 3800,
    bedrooms: 0, bathrooms: 3, division: "Chattogram", city: "Chattogram", area: "Agrabad",
    address: "Level 6, Sheikh Mujib Road, Agrabad C/A, Chattogram 4100", latitude: 22.3264, longitude: 91.8114,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Air Conditioning", "Fire Safety", "CCTV"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2011, floor: 6, parkingSpaces: 2,
    status: PENDING, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 230, views: 870,
  },
  {
    key: "gec-2bed-rent",
    agent: "rakib",
    title: "Furnished 2 bed apartment near GEC Circle",
    description:
      "A furnished 1,100 sq ft apartment within walking distance of GEC Circle and Central Plaza, ideal for a professional on a one-year posting. Beds, sofa, dining set, fridge and AC in the master bedroom are included.",
    type: APARTMENT, purpose: RENT, price: 32000, bookingFee: 8000, areaSqft: 1100,
    bedrooms: 2, bathrooms: 2, division: "Chattogram", city: "Chattogram", area: "GEC",
    address: "O.R. Nizam Road, GEC, Chattogram 4000", latitude: 22.3595, longitude: 91.8217,
    amenities: ["Lift", "Generator Backup", "Air Conditioning", "Fiber Internet"],
    furnishing: FURNISHED, yearBuilt: 2016, floor: 8, parkingSpaces: 0,
    status: RENTED, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 180, views: 700,
  },
  {
    key: "khulshi-duplex",
    agent: "rakib",
    title: "Hillside duplex house with garden in Khulshi",
    description:
      "A rare 4 bedroom duplex on a 6 katha hillside plot in Khulshi, with a terraced garden, a covered parking porch and a rooftop that looks out over the city. It has been renovated with new wiring, plumbing and a modern kitchen.",
    type: HOUSE, purpose: SALE, price: 65000000, bookingFee: 200000, areaSqft: 4300,
    bedrooms: 4, bathrooms: 5, division: "Chattogram", city: "Chattogram", area: "Khulshi",
    address: "Road 5, North Khulshi, Chattogram 4225", latitude: 22.3651, longitude: 91.8055,
    amenities: ["Generator Backup", "24/7 Security", "Car Parking", "Rooftop Garden", "Water Reservoir", "Balcony"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2009, parkingSpaces: 2,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 45, views: 310,
  },

  // ---------------- Mahbub: Uttara / Purbachal / Gazipur / Savar ----------------
  {
    key: "uttara-duplex-rent",
    agent: "mahbub",
    title: "Family duplex house with garden in Uttara Sector 4",
    description:
      "A two-storey duplex on a 5 katha plot in a quiet lane of Uttara Sector 4, with a private garden, a rooftop terrace and a double garage. There are five bedrooms including a ground-floor guest room. It is close to the Uttara metro station and Rajlakshmi.",
    type: HOUSE, purpose: RENT, price: 220000, bookingFee: 20000, areaSqft: 3800,
    bedrooms: 5, bathrooms: 4, division: "Dhaka", city: "Dhaka", area: "Uttara",
    address: "House 18, Road 12, Sector 4, Uttara, Dhaka 1230", latitude: 23.8650, longitude: 90.3990,
    amenities: ["Car Parking", "Gas Connection", "Rooftop Garden", "Generator Backup", "Water Reservoir"],
    furnishing: UNFURNISHED, yearBuilt: 2011, parkingSpaces: 2,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 240, views: 1180,
  },
  {
    key: "uttara-3bed-sale",
    agent: "mahbub",
    title: "3 bed apartment in Uttara Sector 13 near Metro",
    description:
      "A 1,650 sq ft apartment five minutes from the Uttara Center metro station, with three bedrooms, a dining hall and two balconies. The building has a lift, a generator, CCTV and a rooftop prayer space. Monthly service charge is 3,500 BDT.",
    type: APARTMENT, purpose: SALE, price: 14500000, bookingFee: 75000, areaSqft: 1650,
    bedrooms: 3, bathrooms: 3, division: "Dhaka", city: "Dhaka", area: "Uttara",
    address: "House 27, Road 16, Sector 13, Uttara, Dhaka 1230", latitude: 23.8759, longitude: 90.3795,
    amenities: ["Lift", "Generator Backup", "CCTV", "Car Parking", "Gas Connection", "Prayer Room"],
    furnishing: UNFURNISHED, yearBuilt: 2020, floor: 5, parkingSpaces: 1,
    status: SOLD, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 220, views: 1340,
  },
  {
    key: "uttara-2bed-rent",
    agent: "mahbub",
    title: "Budget 2 bed flat for rent in Uttara Sector 10",
    description:
      "A neat 950 sq ft flat for a small family, with two bedrooms, an attached and a common bath, and a kitchen with gas. It is close to Uttara Sector 10 market and the Airport Road bus stops.",
    type: APARTMENT, purpose: RENT, price: 28000, bookingFee: 5000, areaSqft: 950,
    bedrooms: 2, bathrooms: 2, division: "Dhaka", city: "Dhaka", area: "Uttara",
    address: "Road 7, Sector 10, Uttara, Dhaka 1230", latitude: 23.8722, longitude: 90.3889,
    amenities: ["Gas Connection", "Water Reservoir", "Lift"],
    furnishing: UNFURNISHED, yearBuilt: 2013, floor: 3, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 30, views: 220,
  },
  {
    key: "purbachal-plot",
    agent: "mahbub",
    title: "5 katha RAJUK plot in Purbachal New Town Sector 16",
    description:
      "A 5 katha RAJUK-allotted plot in Purbachal New Town Sector 16, on a 40-foot road near the planned central park. Allotment, possession and mutation documents are complete, and the plot is ready for design approval. A good long-term investment as the Purbachal expressway and metro line progress.",
    type: LAND, purpose: SALE, price: 15000000, bookingFee: 100000, areaSqft: 3600,
    bedrooms: 0, bathrooms: 0, division: "Dhaka", city: "Dhaka", area: "Purbachal",
    address: "Plot 112, Road 207, Sector 16, Purbachal New Town, Dhaka", latitude: 23.8433, longitude: 90.5130,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 190, views: 1450,
  },
  {
    key: "purbachal-villa",
    agent: "mahbub",
    title: "Modern villa with pool in Purbachal Sector 2",
    description:
      "A contemporary 4 bedroom villa on a 7 katha corner plot in Purbachal Sector 2, with a private swimming pool, a landscaped garden and floor-to-ceiling windows. Solar panels on the roof supply the outdoor lighting and pool pump. It suits a family that wants space and greenery within 30 minutes of Gulshan.",
    type: HOUSE, purpose: SALE, price: 48000000, bookingFee: 200000, areaSqft: 4800,
    bedrooms: 4, bathrooms: 5, division: "Dhaka", city: "Dhaka", area: "Purbachal",
    address: "Plot 45, Road 103, Sector 2, Purbachal New Town, Dhaka", latitude: 23.8312, longitude: 90.4972,
    amenities: ["Swimming Pool", "Generator Backup", "24/7 Security", "CCTV", "Car Parking", "Air Conditioning", "Balcony"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2024, parkingSpaces: 3,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 80, views: 690,
  },
  {
    key: "gazipur-land",
    agent: "mahbub",
    title: "10 katha land near Board Bazar, Gazipur",
    description:
      "A 10 katha plot with clean title, 400 metres from the Dhaka–Mymensingh highway at Board Bazar. Suitable for a residential building or a small warehouse. The land is raised above flood level and has an electricity line at the boundary.",
    type: LAND, purpose: SALE, price: 8000000, bookingFee: 50000, areaSqft: 7200,
    bedrooms: 0, bathrooms: 0, division: "Dhaka", city: "Gazipur", area: "Board Bazar",
    address: "Kalameshwar, Board Bazar, Gazipur 1704", latitude: 23.9470, longitude: 90.3800,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 140, views: 450,
  },
  {
    key: "savar-land",
    agent: "mahbub",
    title: "8 katha residential plot in Savar near Jahangirnagar University",
    description:
      "A level 8 katha plot in a developing residential project near Jahangirnagar University, Savar, on a 25-foot internal road. The project has a boundary wall, a mosque and a gatehouse. The documents include the registered deed, mutation and the latest DCR.",
    type: LAND, purpose: SALE, price: 6400000, bookingFee: 50000, areaSqft: 5760,
    bedrooms: 0, bathrooms: 0, division: "Dhaka", city: "Savar", area: "Jahangirnagar",
    address: "Islampur, Savar, Dhaka 1342", latitude: 23.8583, longitude: 90.2667,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: IN_REVIEW, isFeatured: false, createdDaysAgo: 2, views: 0,
  },

  // ---------------- Farzana: Sylhet ----------------
  {
    key: "sylhet-duplex",
    agent: "farzana",
    title: "Duplex house in Sylhet Uposhohor Block D",
    description:
      "A 4 bedroom duplex on a 4 katha plot in Uposhohor, Sylhet's most sought-after residential area. It has a marble-floored drawing room, a family lounge upstairs, a roof garden and a car porch. It is popular with UK-based families who want a home ready for their visits.",
    type: HOUSE, purpose: SALE, price: 32000000, bookingFee: 150000, areaSqft: 3600,
    bedrooms: 4, bathrooms: 4, division: "Sylhet", city: "Sylhet", area: "Uposhohor",
    address: "House 23, Road 8, Block D, Uposhohor, Sylhet 3100", latitude: 24.8890, longitude: 91.8800,
    amenities: ["Generator Backup", "Car Parking", "Gas Connection", "Rooftop Garden", "CCTV", "Water Reservoir"],
    furnishing: SEMI_FURNISHED, yearBuilt: 2016, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 230, views: 1060,
  },
  {
    key: "sylhet-rent-3bed",
    agent: "farzana",
    title: "3 bed apartment for rent near Zindabazar, Sylhet",
    description:
      "A 1,450 sq ft apartment in a new building a short rickshaw ride from Zindabazar and Bondor Bazar. It has three bedrooms, a dining space and a balcony facing the hills, plus a lift and a generator.",
    type: APARTMENT, purpose: RENT, price: 25000, bookingFee: 5000, areaSqft: 1450,
    bedrooms: 3, bathrooms: 2, division: "Sylhet", city: "Sylhet", area: "Zindabazar",
    address: "Chowhatta Road, Zindabazar, Sylhet 3100", latitude: 24.8960, longitude: 91.8687,
    amenities: ["Lift", "Generator Backup", "Gas Connection", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2021, floor: 4, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 110, views: 470,
  },
  {
    key: "sylhet-shibganj-land",
    agent: "farzana",
    title: "6 katha land in Shibganj, Sylhet",
    description:
      "A 6 katha residential plot in Shibganj with road access on two sides, close to Sylhet Cadet College Road. The papers are clear and include the khatian, mutation and the latest tax receipt. It is a good choice for a family home or a small apartment project.",
    type: LAND, purpose: SALE, price: 7200000, bookingFee: 50000, areaSqft: 4320,
    bedrooms: 0, bathrooms: 0, division: "Sylhet", city: "Sylhet", area: "Shibganj",
    address: "Shibganj Main Road, Sylhet 3100", latitude: 24.9010, longitude: 91.8900,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: SOLD, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 200, views: 520,
  },
  {
    key: "sylhet-shop",
    agent: "farzana",
    title: "Shop for sale in a Zindabazar shopping complex",
    description:
      "A 650 sq ft ground-floor shop inside a busy shopping complex in Zindabazar, currently let to a fabric retailer on a monthly rent of 45,000 BDT. A ready income property for an investor.",
    type: COMMERCIAL, purpose: SALE, price: 8500000, bookingFee: 50000, areaSqft: 650,
    bedrooms: 0, bathrooms: 0, division: "Sylhet", city: "Sylhet", area: "Zindabazar",
    address: "Ground floor, Al-Hamra Shopping City, Zindabazar, Sylhet", latitude: 24.8957, longitude: 91.8702,
    amenities: ["CCTV", "Generator Backup", "Fire Safety"],
    furnishing: UNFURNISHED, yearBuilt: 2006, floor: 0, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 70, views: 260, retail: true,
  },

  // ---------------- Imran: Cox's Bazar ----------------
  {
    key: "coxsbazar-sea-apartment",
    agent: "imran",
    title: "Sea-view 2 bed apartment in Kolatoli, Cox's Bazar",
    description:
      "A 1,250 sq ft furnished apartment in Kolatoli with a direct view of the Bay of Bengal from the living room and master bedroom. It is three minutes on foot to Sugandha and Kolatoli beach points. Owners can join the building's holiday-rental programme for passive income.",
    type: APARTMENT, purpose: SALE, price: 16500000, bookingFee: 75000, areaSqft: 1250,
    bedrooms: 2, bathrooms: 2, division: "Chattogram", city: "Cox's Bazar", area: "Kolatoli",
    address: "Hotel-Motel Zone, Kolatoli Road, Cox's Bazar 4700", latitude: 21.4220, longitude: 91.9800,
    amenities: ["Lift", "Generator Backup", "24/7 Security", "Air Conditioning", "Balcony", "Swimming Pool"],
    furnishing: FURNISHED, yearBuilt: 2022, floor: 9, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: true, createdDaysAgo: 170, views: 1620,
  },
  {
    key: "inani-villa-rent",
    agent: "imran",
    title: "Beachside holiday villa for monthly rent at Inani",
    description:
      "A 3 bedroom villa off the Marine Drive at Inani, set among palms with a private pool and a short path to a quiet stretch of beach. It is fully furnished, with staff quarters and a caretaker. Available on monthly rent for families or company retreats.",
    type: HOUSE, purpose: RENT, price: 180000, bookingFee: 25000, areaSqft: 2900,
    bedrooms: 3, bathrooms: 3, division: "Chattogram", city: "Cox's Bazar", area: "Inani",
    address: "Marine Drive, Inani, Ukhia, Cox's Bazar", latitude: 21.2300, longitude: 92.0450,
    amenities: ["Swimming Pool", "Generator Backup", "Air Conditioning", "Car Parking", "24/7 Security"],
    furnishing: FURNISHED, yearBuilt: 2020, parkingSpaces: 2,
    status: RENTED, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 160, views: 940,
  },
  {
    key: "coxsbazar-land",
    agent: "imran",
    title: "4 katha land near Kolatoli for a hotel project",
    description:
      "A 4 katha plot inside the hotel-motel zone, two lanes back from Kolatoli beach road, with clear documents and an approved land-use certificate for tourism projects. It suits a boutique hotel or a serviced apartment building.",
    type: LAND, purpose: SALE, price: 16000000, bookingFee: 100000, areaSqft: 2880,
    bedrooms: 0, bathrooms: 0, division: "Chattogram", city: "Cox's Bazar", area: "Kolatoli",
    address: "Road 3, Hotel-Motel Zone, Kolatoli, Cox's Bazar 4700", latitude: 21.4198, longitude: 91.9822,
    amenities: [], furnishing: UNFURNISHED, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 100, views: 580,
  },

  // ---------------- Nadia: Rajshahi / Khulna / Mymensingh / Narayanganj ----------------
  {
    key: "rajshahi-house",
    agent: "nadia",
    title: "Single-storey family house in Rajshahi Uposhohor",
    description:
      "A 3 bedroom single-storey house on a 4 katha plot in Uposhohor, Rajshahi, with a front garden, mango and guava trees and space to add another floor. It is close to Rajshahi University and the Padma riverside walkway.",
    type: HOUSE, purpose: SALE, price: 16000000, bookingFee: 75000, areaSqft: 2200,
    bedrooms: 3, bathrooms: 2, division: "Rajshahi", city: "Rajshahi", area: "Uposhohor",
    address: "Sector 3, Uposhohor, Rajshahi 6203", latitude: 24.3745, longitude: 88.6280,
    amenities: ["Car Parking", "Gas Connection", "Water Reservoir"],
    furnishing: UNFURNISHED, yearBuilt: 2005, parkingSpaces: 1,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 180, views: 530,
  },
  {
    key: "rajshahi-rent",
    agent: "nadia",
    title: "2 bed flat for rent near Rajshahi University",
    description:
      "A 900 sq ft flat for faculty members or a small family, 10 minutes from Rajshahi University's main gate. It has two bedrooms, a dining area and a kitchen with a gas line, and the area is quiet and safe.",
    type: APARTMENT, purpose: RENT, price: 15000, bookingFee: 3000, areaSqft: 900,
    bedrooms: 2, bathrooms: 1, division: "Rajshahi", city: "Rajshahi", area: "Binodpur",
    address: "Binodpur Bazar Road, Rajshahi 6206", latitude: 24.3636, longitude: 88.6400,
    amenities: ["Gas Connection", "Water Reservoir"],
    furnishing: UNFURNISHED, yearBuilt: 2012, floor: 2, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 50, views: 190,
  },
  {
    key: "khulna-house",
    agent: "nadia",
    title: "Two-storey house in Sonadanga Residential Area, Khulna",
    description:
      "A solid two-storey house with five bedrooms across both floors, on a 3.5 katha plot in Sonadanga R/A. The ground floor can be let separately for monthly income. It is close to the Sonadanga bus terminal and Khulna Medical College.",
    type: HOUSE, purpose: SALE, price: 12500000, bookingFee: 75000, areaSqft: 2800,
    bedrooms: 5, bathrooms: 3, division: "Khulna", city: "Khulna", area: "Sonadanga",
    address: "Road 4, Sonadanga R/A, Khulna 9100", latitude: 22.8150, longitude: 89.5450,
    amenities: ["Car Parking", "Gas Connection", "Water Reservoir", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2003, parkingSpaces: 1,
    status: PENDING, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 150, views: 610,
  },
  {
    key: "mymensingh-house",
    agent: "nadia",
    title: "3 bed house near the Brahmaputra in Ganginarpar, Mymensingh",
    description:
      "A neat single-storey 3 bedroom house a short walk from the Brahmaputra riverside park and Ganginarpar market. It has a tiled roof, a covered verandah and a small courtyard, and it is a good first home or retirement home.",
    type: HOUSE, purpose: SALE, price: 8500000, bookingFee: 50000, areaSqft: 1600,
    bedrooms: 3, bathrooms: 2, division: "Mymensingh", city: "Mymensingh", area: "Ganginarpar",
    address: "Ganginarpar, Mymensingh 2200", latitude: 24.7540, longitude: 90.4070,
    amenities: ["Water Reservoir", "Balcony"],
    furnishing: UNFURNISHED, yearBuilt: 2008, parkingSpaces: 0,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 90, views: 340,
  },
  {
    key: "narayanganj-warehouse",
    agent: "nadia",
    title: "Warehouse with loading bay near Chashara, Narayanganj",
    description:
      "A 9,000 sq ft warehouse with a 28-foot clear height, two loading bays and a covered truck yard, 2 km from Chashara and the Dhaka–Narayanganj link road. It has a 3-phase power connection and a fire hydrant line, and it suits garment accessories or FMCG distribution.",
    type: COMMERCIAL, purpose: RENT, price: 360000, bookingFee: 25000, areaSqft: 9000,
    bedrooms: 0, bathrooms: 2, division: "Dhaka", city: "Narayanganj", area: "Chashara",
    address: "Pagla Road, Chashara, Narayanganj 1400", latitude: 23.6238, longitude: 90.4990,
    amenities: ["24/7 Security", "CCTV", "Fire Safety", "Car Parking"],
    furnishing: UNFURNISHED, yearBuilt: 2015, floor: 0, parkingSpaces: 6,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 75, views: 280,
  },
  {
    key: "tejgaon-showroom",
    agent: "nadia",
    title: "Corner showroom space on Tejgaon Link Road",
    description:
      "A 3,000 sq ft double-height corner showroom on Tejgaon–Gulshan Link Road, with glass on two sides and signage rights on the façade. It is ideal for a car, furniture or electronics brand, with a back office, a washroom and parking in front.",
    type: COMMERCIAL, purpose: RENT, price: 360000, bookingFee: 25000, areaSqft: 3000,
    bedrooms: 0, bathrooms: 2, division: "Dhaka", city: "Dhaka", area: "Tejgaon",
    address: "Holding 212, Tejgaon–Gulshan Link Road, Dhaka 1208", latitude: 23.7639, longitude: 90.3925,
    amenities: ["Generator Backup", "CCTV", "Fire Safety", "Car Parking", "Air Conditioning"],
    furnishing: UNFURNISHED, yearBuilt: 2017, floor: 0, parkingSpaces: 4,
    status: AVAILABLE, approvalStatus: APPROVED, isFeatured: false, createdDaysAgo: 35, views: 200, retail: true,
  },
];
