import {
  BookingStatus,
  ContactStatus,
  InquiryStatus,
  PaymentStatus,
  ViewingStatus,
} from "../../src/generated/prisma/enums";

/**
 * Activity between buyers and listings. Keys refer to USERS / PROPERTIES.
 * daysAgo > 0 is in the past; inDays is in the future (relative to the seed run).
 */

// Each deal = confirmed booking + successful bKash payment (drives revenue charts).
export const DEALS: { property: string; user: string; paidDaysAgo: number; trxID: string }[] = [
  { property: "gulshan1-house-rent", user: "kamrul", paidDaysAgo: 300, trxID: "BKA3K9T1QZ" },
  { property: "bashundhara-plot", user: "ayesha", paidDaysAgo: 280, trxID: "BKB7M2W8LP" },
  { property: "dhanmondi-rent-3bed", user: "demo", paidDaysAgo: 240, trxID: "BKC1R5Y6NV" },
  { property: "mirpur-dohs-apartment", user: "sabrina", paidDaysAgo: 200, trxID: "BKD8F3H2XA" },
  { property: "uttara-3bed-sale", user: "tahmid", paidDaysAgo: 170, trxID: "BKE4J7K9MS" },
  { property: "gec-2bed-rent", user: "jannat", paidDaysAgo: 140, trxID: "BKF2Q6T3RD" },
  { property: "sylhet-shibganj-land", user: "mehedi", paidDaysAgo: 110, trxID: "BKG9W1Z5CE" },
  { property: "inani-villa-rent", user: "demo", paidDaysAgo: 80, trxID: "BKH5B8N4UF" },
  { property: "agrabad-office", user: "shafiq", paidDaysAgo: 45, trxID: "BKJ3V7X2GH" },
  { property: "khulna-house", user: "riya", paidDaysAgo: 20, trxID: "BKK6L4P9TJ" },
];

// Bookings that never got paid (for status variety in tables).
export const UNPAID_BOOKINGS: {
  property: string;
  user: string;
  daysAgo: number;
  paymentStatus: PaymentStatus;
}[] = [
  { property: "uttara-duplex-rent", user: "lamia", daysAgo: 60, paymentStatus: PaymentStatus.FAILED },
  { property: "banani-furnished-rent", user: "demo", daysAgo: 25, paymentStatus: PaymentStatus.CANCELLED },
  { property: "purbachal-plot", user: "zahid", daysAgo: 9, paymentStatus: PaymentStatus.FAILED },
];

export const BOOKING_CANCELLED = BookingStatus.CANCELLED;

export const VIEWINGS: {
  property: string;
  user: string;
  status: ViewingStatus;
  daysAgo?: number;
  inDays?: number;
  hour: number;
  message?: string;
  agentNote?: string;
  cancelReason?: string;
  cancelledBy?: "user" | "agent";
}[] = [
  // Completed viewings before each deal
  { property: "gulshan1-house-rent", user: "kamrul", status: ViewingStatus.COMPLETED, daysAgo: 308, hour: 11 },
  { property: "bashundhara-plot", user: "ayesha", status: ViewingStatus.COMPLETED, daysAgo: 287, hour: 10 },
  { property: "dhanmondi-rent-3bed", user: "demo", status: ViewingStatus.COMPLETED, daysAgo: 246, hour: 17, message: "Can we see it after office hours?" },
  { property: "mirpur-dohs-apartment", user: "sabrina", status: ViewingStatus.COMPLETED, daysAgo: 208, hour: 16 },
  { property: "uttara-3bed-sale", user: "tahmid", status: ViewingStatus.COMPLETED, daysAgo: 176, hour: 11 },
  { property: "gec-2bed-rent", user: "jannat", status: ViewingStatus.COMPLETED, daysAgo: 146, hour: 15 },
  { property: "sylhet-shibganj-land", user: "mehedi", status: ViewingStatus.COMPLETED, daysAgo: 118, hour: 10 },
  { property: "inani-villa-rent", user: "demo", status: ViewingStatus.COMPLETED, daysAgo: 86, hour: 12 },
  { property: "agrabad-office", user: "shafiq", status: ViewingStatus.COMPLETED, daysAgo: 52, hour: 14 },
  { property: "khulna-house", user: "riya", status: ViewingStatus.COMPLETED, daysAgo: 27, hour: 11 },
  { property: "purbachal-plot", user: "kamrul", status: ViewingStatus.COMPLETED, daysAgo: 60, hour: 9 },
  { property: "rajshahi-house", user: "riya", status: ViewingStatus.COMPLETED, daysAgo: 70, hour: 16 },
  // Demo user: one of every state
  { property: "gulshan-lake-apartment", user: "demo", status: ViewingStatus.APPROVED, inDays: 3, hour: 17, message: "My husband and I would like to see it together after 5 pm.", agentNote: "Confirmed. Please call me from the gate and the guard will let you in." },
  { property: "dhanmondi-lake-apartment", user: "demo", status: ViewingStatus.PENDING, inDays: 5, hour: 11, message: "Is the owner available to meet on a weekday morning?" },
  { property: "baridhara-duplex", user: "demo", status: ViewingStatus.RESCHEDULED, inDays: 7, hour: 15, agentNote: "The current tenant leaves on Thursday, so I moved the visit to the weekend." },
  { property: "khulshi-hill-apartment", user: "demo", status: ViewingStatus.CANCELLED, daysAgo: 20, hour: 12, cancelReason: "I will not be travelling to Chattogram this month.", cancelledBy: "user" },
  // Requests waiting on the demo agent
  { property: "banani-furnished-rent", user: "ayesha", status: ViewingStatus.PENDING, inDays: 2, hour: 18, message: "We are relocating from Singapore next month and want to see it before signing." },
  { property: "bashundhara-3bed-sale", user: "zahid", status: ViewingStatus.PENDING, inDays: 4, hour: 10 },
  { property: "gulshan-avenue-office", user: "proma", status: ViewingStatus.APPROVED, inDays: 6, hour: 11, agentNote: "The building manager will show you the floor and the fire exits." },
  { property: "baridhara-duplex", user: "arif", status: ViewingStatus.PENDING, inDays: 3, hour: 16 },
  { property: "gulshan-lake-apartment", user: "lamia", status: ViewingStatus.REJECTED, daysAgo: 30, hour: 9, agentNote: "The owner is abroad that week, so please pick a date after the 15th." },
  // Other agents
  { property: "sylhet-duplex", user: "sabrina", status: ViewingStatus.APPROVED, inDays: 4, hour: 11 },
  { property: "coxsbazar-sea-apartment", user: "mehedi", status: ViewingStatus.PENDING, inDays: 9, hour: 12 },
  { property: "uttara-duplex-rent", user: "lamia", status: ViewingStatus.COMPLETED, daysAgo: 64, hour: 17 },
];

export const INQUIRIES: {
  property: string;
  user: string;
  status: InquiryStatus;
  daysAgo: number;
  subject: string;
  message: string;
  replies?: { from: "user" | "agent"; message: string; hoursLater: number }[];
}[] = [
  {
    property: "gulshan-lake-apartment", user: "demo", status: InquiryStatus.IN_PROGRESS, daysAgo: 6,
    subject: "Is the price negotiable for a cash buyer?",
    message: "Assalamu alaikum. We are very interested in the lake-view flat. If we pay the full amount within 60 days, is there any room to negotiate on the price? Also, how much is the monthly service charge?",
    replies: [
      { from: "agent", message: "Walaikum assalam. The owner is open to a small discount for a quick cash deal, around 2%. The service charge is 12,000 BDT per month, which covers the generator, lift and guards.", hoursLater: 3 },
      { from: "user", message: "Thank you. Could you also share the RAJUK approval and the land deed copy before our visit?", hoursLater: 20 },
      { from: "agent", message: "Of course. I will bring copies of the approval, deed and mutation papers to the viewing on Saturday.", hoursLater: 26 },
    ],
  },
  {
    property: "baridhara-duplex", user: "demo", status: InquiryStatus.NEW, daysAgo: 1,
    subject: "Does the house have a backup water supply?",
    message: "Hello, does the Baridhara duplex have its own deep tube well or a water reservoir? We had shortages in our last home and want to be sure before visiting.",
  },
  {
    property: "dhanmondi-lake-apartment", user: "demo", status: InquiryStatus.RESOLVED, daysAgo: 40,
    subject: "Which schools are nearby?",
    message: "We have two children in primary school. Which English-medium schools are within ten minutes of this apartment?",
    replies: [
      { from: "agent", message: "Sunbeams, Scholastica's Dhanmondi branch and Maple Leaf are all within 10 minutes by car. Many families in the building use the same school van.", hoursLater: 5 },
      { from: "user", message: "Very helpful, thank you!", hoursLater: 9 },
    ],
  },
  {
    property: "coxsbazar-sea-apartment", user: "demo", status: InquiryStatus.CLOSED, daysAgo: 95,
    subject: "Holiday rental income",
    message: "If we buy this apartment, how many nights a year is it usually rented through the building's programme, and what share does the owner receive?",
    replies: [
      { from: "agent", message: "Last year similar units were booked around 160 nights. The owner receives 60% of the room revenue after cleaning costs.", hoursLater: 30 },
    ],
  },
  {
    property: "banani-furnished-rent", user: "ayesha", status: InquiryStatus.NEW, daysAgo: 2,
    subject: "Pets allowed?",
    message: "We have a small indoor cat. Does the building allow pets, and is a one-year lease possible instead of two years?",
  },
  {
    property: "bashundhara-3bed-sale", user: "zahid", status: InquiryStatus.NEW, daysAgo: 3,
    subject: "Bank loan for this flat",
    message: "I plan to buy with a home loan from a commercial bank. Will the developer support the bank's valuation and documentation process?",
  },
  {
    property: "gulshan-avenue-office", user: "proma", status: InquiryStatus.IN_PROGRESS, daysAgo: 8,
    subject: "Office fit-out allowance",
    message: "We are a 40-person software company. Would the landlord give a rent-free period for our interior fit-out, and is the floor ready for a server room?",
    replies: [
      { from: "agent", message: "The landlord can offer two months rent-free on a three-year lease. There is a dedicated room with a separate AC line that previous tenants used as a server room.", hoursLater: 4 },
    ],
  },
  {
    property: "baridhara-duplex", user: "arif", status: InquiryStatus.NEW, daysAgo: 1,
    subject: "Interested for an embassy residence",
    message: "I am arranging housing for a diplomatic mission. Can the owner sign a lease directly with the embassy instead of selling?",
  },
  {
    property: "gulshan-lake-apartment", user: "tahmid", status: InquiryStatus.RESOLVED, daysAgo: 150,
    subject: "Parking spaces",
    message: "Does the apartment come with two dedicated parking spaces, or is the second one shared?",
    replies: [{ from: "agent", message: "Both parking spaces are dedicated and registered with the flat.", hoursLater: 2 }],
  },
  {
    property: "gulshan1-house-rent", user: "kamrul", status: InquiryStatus.CLOSED, daysAgo: 312,
    subject: "Guest house use",
    message: "Our company wants to use the house as a guest house for visiting engineers. Is that allowed under the lease?",
    replies: [{ from: "agent", message: "Yes, the owner is fine with corporate guest house use as long as the company signs the lease.", hoursLater: 6 }],
  },
  {
    property: "sylhet-duplex", user: "sabrina", status: InquiryStatus.IN_PROGRESS, daysAgo: 12,
    subject: "Buying from the UK",
    message: "My parents live in Sylhet but I am based in London. Can the sale be completed with a power of attorney?",
    replies: [{ from: "agent", message: "Yes. Many of my clients buy this way. The power of attorney must be attested by the Bangladesh High Commission in London.", hoursLater: 12 }],
  },
  {
    property: "coxsbazar-land", user: "mehedi", status: InquiryStatus.NEW, daysAgo: 4,
    subject: "Height limit for a hotel",
    message: "What is the maximum number of floors allowed on this plot under the current Cox's Bazar development rules?",
  },
  {
    property: "khulna-house", user: "riya", status: InquiryStatus.RESOLVED, daysAgo: 30,
    subject: "Ground floor tenant",
    message: "Is the ground floor currently rented? If so, until when?",
    replies: [{ from: "agent", message: "Yes, until the end of December. The tenant pays 18,000 BDT a month and is happy to leave on notice.", hoursLater: 8 }],
  },
  {
    property: "uttara-duplex-rent", user: "lamia", status: InquiryStatus.CLOSED, daysAgo: 68,
    subject: "Rent negotiation",
    message: "Would the owner accept 200,000 BDT per month for a two-year lease?",
    replies: [{ from: "agent", message: "The owner can accept 210,000 BDT for two years, but not lower.", hoursLater: 10 }],
  },
  {
    property: "agrabad-office", user: "shafiq", status: InquiryStatus.RESOLVED, daysAgo: 58,
    subject: "Floor load capacity",
    message: "We plan to keep shipping archives on site. What is the floor load capacity?",
    replies: [{ from: "agent", message: "The structural drawings rate the floor at 100 lb per sq ft. I will share the engineer's certificate.", hoursLater: 7 }],
  },
  {
    property: "nasirabad-rent", user: "jannat", status: InquiryStatus.NEW, daysAgo: 5,
    subject: "Available from next month?",
    message: "Is the flat available from the 1st of next month? We are a family of four.",
  },
  {
    property: "purbachal-villa", user: "zahid", status: InquiryStatus.IN_PROGRESS, daysAgo: 15,
    subject: "Pool maintenance cost",
    message: "Roughly how much does pool maintenance cost each month, and does the seller have a maintenance contract?",
    replies: [{ from: "agent", message: "The seller pays around 9,000 BDT a month to a local pool service, and the contract can be transferred.", hoursLater: 18 }],
  },
];

export const PROPERTY_REVIEWS: { property: string; user: string; rating: number; comment: string; daysAgo: number }[] = [
  { property: "gulshan1-house-rent", user: "kamrul", rating: 5, daysAgo: 290, comment: "The house was exactly as shown in the photos. The garden is well kept and the generator handled every load-shedding without trouble. Our visiting engineers loved staying here." },
  { property: "bashundhara-plot", user: "ayesha", rating: 5, daysAgo: 270, comment: "Clean documents and a fair price. The plot is on a wide road and the area is developing fast. The registration was finished in under a month." },
  { property: "dhanmondi-rent-3bed", user: "demo", rating: 4, daysAgo: 230, comment: "A bright, well-ventilated flat close to the kids' school. The water supply is reliable. One star off because the lift is a little slow at peak hours." },
  { property: "mirpur-dohs-apartment", user: "sabrina", rating: 5, daysAgo: 190, comment: "Mirpur DOHS is quiet and safe, and this corner flat gets light all day. The park view from the balcony is the best part." },
  { property: "uttara-3bed-sale", user: "tahmid", rating: 4, daysAgo: 160, comment: "Great location for the metro, and my commute to Motijheel is now 35 minutes. The building is solid, though the parking ramp is narrow." },
  { property: "gec-2bed-rent", user: "jannat", rating: 4, daysAgo: 130, comment: "A convenient, furnished flat that is walking distance to everything at GEC. Good for a one-year posting." },
  { property: "sylhet-shibganj-land", user: "mehedi", rating: 5, daysAgo: 100, comment: "The papers were perfectly in order and the plot has road access on two sides, as promised. A very smooth purchase." },
  { property: "inani-villa-rent", user: "demo", rating: 5, daysAgo: 70, comment: "A peaceful villa with a lovely pool and the beach a few steps away. The caretaker was very helpful. Our family retreat was perfect." },
  { property: "agrabad-office", user: "shafiq", rating: 4, daysAgo: 35, comment: "A practical office floor in the heart of Agrabad, with good lifts and parking. Some partitions need updating, which we will do ourselves." },
  { property: "rajshahi-house", user: "riya", rating: 4, daysAgo: 65, comment: "A charming house with mature fruit trees and a big front yard. It needs some repainting, but the structure is sound." },
  { property: "purbachal-plot", user: "kamrul", rating: 4, daysAgo: 55, comment: "A good plot in a planned sector. The access road is still being finished, but the location has a lot of potential." },
  { property: "gulshan-lake-apartment", user: "tahmid", rating: 5, daysAgo: 145, comment: "One of the best lake views in Gulshan. The building management is professional and the common areas are spotless." },
];

export const AGENT_REVIEWS: { agent: string; user: string; rating: number; comment: string; daysAgo: number }[] = [
  { agent: "demo", user: "kamrul", rating: 5, daysAgo: 295, comment: "Tanvir found us a corporate guest house in Gulshan within a week and negotiated a fair rent with the owner. He was responsive at every step." },
  { agent: "demo", user: "ayesha", rating: 5, daysAgo: 275, comment: "He was honest about which plots had document issues and steered us towards a clean one. That saved us months of trouble." },
  { agent: "demo", user: "tahmid", rating: 4, daysAgo: 148, comment: "Very knowledgeable about Gulshan buildings and quick to share documents. Viewings were always on time." },
  { agent: "shirin", user: "demo", rating: 5, daysAgo: 235, comment: "Shirin apa knows Dhanmondi inside out, from schools and markets to which buildings have good water. She made our move stress-free." },
  { agent: "shirin", user: "sabrina", rating: 5, daysAgo: 195, comment: "Professional and patient. She showed us six flats before we found the right one and never pushed us." },
  { agent: "rakib", user: "jannat", rating: 4, daysAgo: 135, comment: "He helped me find a furnished flat in Chattogram before my joining date and handled the lease paperwork with the owner." },
  { agent: "rakib", user: "shafiq", rating: 5, daysAgo: 40, comment: "Excellent support for our office purchase in Agrabad. He coordinated the structural certificate and the bank valuation for us." },
  { agent: "farzana", user: "mehedi", rating: 5, daysAgo: 105, comment: "As a buyer living in Dubai, I needed someone I could trust. Farzana sent video walkthroughs and checked every document before I paid." },
  { agent: "imran", user: "demo", rating: 5, daysAgo: 75, comment: "Imran arranged a beautiful villa for our family holiday at short notice and was available on the phone throughout our stay." },
  { agent: "nadia", user: "riya", rating: 4, daysAgo: 22, comment: "She was very clear about the costs, from registration fees to repairs, and found us a house within our budget in Khulna." },
  { agent: "mahbub", user: "kamrul", rating: 4, daysAgo: 58, comment: "Mahbub bhai explained the RAJUK allotment process clearly and arranged a site visit to Purbachal the same week." },
  { agent: "mahbub", user: "tahmid", rating: 5, daysAgo: 165, comment: "He found us a flat right next to the metro and handled the developer and the bank loan paperwork smoothly." },
  { agent: "mahbub", user: "lamia", rating: 3, daysAgo: 55, comment: "He was helpful during the viewing, but the owner did not move on price and our booking payment failed. It took a while to get a reply about the next steps." },
];

// Saved listings: user key -> property keys
export const FAVORITES: Record<string, string[]> = {
  demo: ["gulshan-lake-apartment", "baridhara-duplex", "khulshi-hill-apartment", "coxsbazar-sea-apartment", "purbachal-villa", "sylhet-duplex"],
  ayesha: ["banani-furnished-rent", "gulshan-lake-apartment", "dhanmondi-lake-apartment"],
  kamrul: ["purbachal-plot", "gazipur-land", "purbachal-villa"],
  sabrina: ["sylhet-duplex", "mirpur-dohs-apartment"],
  tahmid: ["uttara-duplex-rent", "gulshan-lake-apartment"],
  jannat: ["nasirabad-rent", "khulshi-hill-apartment", "khulshi-duplex"],
  mehedi: ["coxsbazar-land", "coxsbazar-sea-apartment", "sylhet-shop"],
  riya: ["rajshahi-house", "mymensingh-house"],
  shafiq: ["agrabad-office", "tejgaon-showroom"],
  lamia: ["uttara-duplex-rent", "banani-furnished-rent", "lalmatia-2bed"],
  zahid: ["bashundhara-3bed-sale", "purbachal-villa", "purbachal-plot"],
  proma: ["gulshan-avenue-office", "dhanmondi-retail"],
  arif: ["baridhara-duplex"],
};

export const CONTACT_MESSAGES: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  daysAgo: number;
}[] = [
  { name: "Rumana Akter", email: "rumana.akter@example.com", phone: "01811223344", subject: "Listing my flat in Mirpur DOHS", message: "I would like to list my 1,450 sq ft flat in Mirpur DOHS for sale. Could one of your agents call me to discuss the valuation?", status: ContactStatus.NEW, daysAgo: 1 },
  { name: "Hasibul Karim", email: "hasibul.karim@example.net", subject: "Becoming an agent on EstateHub", message: "I run a small agency in Narayanganj with three agents. What documents do we need to get verified on EstateHub?", status: ContactStatus.NEW, daysAgo: 3 },
  { name: "Sharmin Nahar", email: "sharmin.nahar@example.org", phone: "01933445566", subject: "Refund for cancelled booking", message: "My booking for an Uttara flat was cancelled by the owner. When will the booking fee be refunded to my bKash account?", status: ContactStatus.READ, daysAgo: 9 },
  { name: "Daniel Roberts", email: "daniel.roberts@example.com", subject: "Corporate housing for expatriate staff", message: "Our company is moving five expatriate engineers to Dhaka in March. Can you suggest furnished apartments in Gulshan or Banani with flexible leases?", status: ContactStatus.RESOLVED, daysAgo: 21 },
  { name: "Mosharraf Hossain", email: "mosharraf.h@example.net", phone: "01722113344", subject: "Wrong location on a listing", message: "The map pin for one of the Khulshi listings seems to be in Nasirabad. Please check it so buyers are not confused.", status: ContactStatus.RESOLVED, daysAgo: 34 },
  { name: "Tasnim Ara", email: "tasnim.ara@example.com", subject: "Feedback on the search filters", message: "It would be great to filter by distance to a metro station. Otherwise the search is very easy to use. Thank you!", status: ContactStatus.READ, daysAgo: 48 },
];

export const NEWSLETTER_EMAILS: { email: string; daysAgo: number }[] = [
  { email: "investor.bd@example.com", daysAgo: 320 },
  { email: "nri.homebuyer@example.net", daysAgo: 270 },
  { email: "rahim.properties@example.org", daysAgo: 230 },
  { email: "dhaka.renter@example.com", daysAgo: 180 },
  { email: "first.home.2026@example.com", daysAgo: 140 },
  { email: "ctg.office.hunt@example.net", daysAgo: 100 },
  { email: "sylhet.family@example.org", daysAgo: 70 },
  { email: "plot.watch@example.com", daysAgo: 40 },
  { email: "coxs.holiday@example.net", daysAgo: 12 },
  { email: "green.living@example.org", daysAgo: 4 },
];
