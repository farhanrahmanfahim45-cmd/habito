/**
 * Generates src/data/seed.json — Habito's synthetic seed dataset.
 * Run: node scripts/generate-habito-data.mjs
 *
 * Produces owners → properties → spaces, so one building can hold flats,
 * a shop, a godown and a garage. Nothing here is real.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const AREAS = [
  { name: "Mirpur", district: "Dhaka", geo: "urban", lat: 23.8069, lng: 90.3687, idx: 0.85, hoods: ["Mirpur 1", "Mirpur 10", "Mirpur 11", "Kazipara", "Shewrapara"] },
  { name: "Mohammadpur", district: "Dhaka", geo: "urban", lat: 23.759, lng: 90.3595, idx: 0.9, hoods: ["Tajmahal Road", "Shyamoli", "Adabor"] },
  { name: "Uttara", district: "Dhaka", geo: "urban", lat: 23.87, lng: 90.399, idx: 1.15, hoods: ["Sector 3", "Sector 7", "Sector 10"] },
  { name: "Badda", district: "Dhaka", geo: "urban", lat: 23.7806, lng: 90.4264, idx: 0.88, hoods: ["Middle Badda", "North Badda", "Merul Badda"] },
  { name: "Bashundhara R/A", district: "Dhaka", geo: "urban", lat: 23.82, lng: 90.4265, idx: 1.25, hoods: ["Block A", "Block C", "Block D"] },
  { name: "Rampura", district: "Dhaka", geo: "urban", lat: 23.761, lng: 90.418, idx: 0.86, hoods: ["West Rampura", "Banasree"] },
  { name: "Kuril", district: "Dhaka", geo: "urban", lat: 23.8223, lng: 90.4198, idx: 1.0, hoods: ["Kuril Bishwa Road", "Nadda"] },
  { name: "Khilkhet", district: "Dhaka", geo: "urban", lat: 23.8293, lng: 90.4189, idx: 0.92, hoods: ["Khilkhet Bazar", "Nikunja"] },
  { name: "Kallyanpur", district: "Dhaka", geo: "urban", lat: 23.779, lng: 90.3597, idx: 0.82, hoods: ["Kallyanpur", "Darussalam"] },
  { name: "Jatrabari", district: "Dhaka", geo: "urban", lat: 23.7104, lng: 90.4335, idx: 0.7, hoods: ["Jatrabari", "Konapara"] },
  { name: "Savar", district: "Dhaka", geo: "suburban", lat: 23.8583, lng: 90.2667, idx: 0.62, hoods: ["Bank Colony", "Radio Colony"] },
  { name: "Tongi", district: "Gazipur", geo: "suburban", lat: 23.8917, lng: 90.4058, idx: 0.65, hoods: ["Cherag Ali", "Station Road"] },
  { name: "Keraniganj", district: "Dhaka", geo: "suburban", lat: 23.69, lng: 90.39, idx: 0.6, hoods: ["Zinzira", "Aganagar"] },
  { name: "Narayanganj", district: "Narayanganj", geo: "suburban", lat: 23.6238, lng: 90.5, idx: 0.66, hoods: ["Chashara", "Fatullah"] },
  { name: "Manikganj", district: "Manikganj", geo: "rural", lat: 23.8617, lng: 90.0003, idx: 0.4, hoods: ["Saturia", "Ghior"] },
  { name: "Munshiganj", district: "Munshiganj", geo: "rural", lat: 23.5422, lng: 90.5305, idx: 0.45, hoods: ["Sirajdikhan", "Tongibari"] },
  { name: "Sonargaon", district: "Narayanganj", geo: "rural", lat: 23.6486, lng: 90.6006, idx: 0.42, hoods: ["Baidyer Bazar", "Panam"] },
];

const FIRST = ["Rafiqul", "Nusrat", "Shahin", "Farhana", "Kamrul", "Jamal", "Sabbir", "Abdul", "Tanvir", "Ruma", "Mizanur", "Sharmin", "Habibur", "Nasrin", "Delwar", "Ayesha", "Sohel", "Rokeya", "Anisur", "Mahmuda", "Faruk", "Shirin", "Jahangir", "Tahmina", "Moinul", "Sultana"];
const LAST = ["Islam", "Jahan", "Alam", "Karim", "Hasan", "Uddin", "Rahman", "Mannan", "Ahmed", "Akter", "Chowdhury", "Begum", "Sarkar", "Haque", "Mia", "Khatun"];
const TONES = ["mint", "sun", "lilac", "coral", "aqua"];

const URBAN_MIX = [
  { type: "apartment", w: 34 },
  { type: "room", w: 14 },
  { type: "shared-room", w: 12 },
  { type: "sublet", w: 8 },
  { type: "shop", w: 10 },
  { type: "office", w: 6 },
  { type: "godown", w: 5 },
  { type: "garage", w: 5 },
  { type: "parking-slot", w: 4 },
  { type: "house", w: 2 },
];
const RURAL_MIX = [
  { type: "tin-shed", w: 26 },
  { type: "homestead", w: 16 },
  { type: "farmland", w: 20 },
  { type: "pond", w: 10 },
  { type: "shop", w: 14 },
  { type: "godown", w: 8 },
  { type: "house", w: 6 },
];

const CATEGORY_OF_TYPE = {
  apartment: "living", room: "living", "shared-room": "living", sublet: "living",
  house: "living", "tin-shed": "living", shop: "business", office: "business",
  godown: "storage", garage: "parking", "parking-slot": "parking",
  farmland: "land", pond: "land", homestead: "land",
};

const IMAGE_POOL = {
  living: ["living-1", "living-2", "living-3", "living-4"],
  business: ["business-1", "business-2", "business-3"],
  storage: ["storage-1", "storage-2"],
  parking: ["parking-1", "parking-2"],
  land: ["land-1", "land-2", "land-3"],
};

let seed = 20260915;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const pick = (a) => a[int(0, a.length - 1)];
const weighted = (a) => { const t = a.reduce((s, x) => s + x.w, 0); let r = rnd() * t; for (const x of a) if ((r -= x.w) <= 0) return x; return a.at(-1); };
const round = (n, to) => Math.round(n / to) * to;
const iso = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
const some = (arr, n) => [...arr].sort(() => rnd() - 0.5).slice(0, n);

function verification(level, id) {
  const owner = level === "full" ? "verified" : level === "partial" ? "identity-submitted" : "unverified";
  const space = level === "full" ? "verified" : level === "partial" ? "reviewed" : rnd() > 0.5 ? "documents-submitted" : "unverified";
  return { demo: true, owner, space, ...(level === "full" ? { checkedOn: iso(-int(2, 120)) } : {}), _id: id };
}

function makeSpace(idx, property, area, type, sequence) {
  const category = CATEGORY_OF_TYPE[type];
  // Sale is real but secondary — land and homes sell, parking and storage rent.
  const SALEABLE = ["farmland", "homestead", "house", "apartment", "shop", "pond"];
  const transaction = SALEABLE.includes(type) && rnd() > 0.82 ? "sale" : "rent";

  const attributes = {};
  let price;
  let name;
  let description;

  const sqft = (lo, hi) => round(int(lo, hi), 10);

  switch (type) {
    case "apartment": {
      const bedrooms = int(1, 4);
      attributes.bedrooms = bedrooms;
      attributes.bathrooms = Math.max(1, Math.min(bedrooms, int(1, 3)));
      attributes.sizeSqft = sqft(420 + bedrooms * 130, 620 + bedrooms * 200);
      attributes.floor = int(1, 9);
      attributes.furnishing = pick(["unfurnished", "unfurnished", "semi-furnished", "furnished"]);
      attributes.kitchen = true;
      attributes.balcony = rnd() > 0.3;
      price =
        transaction === "sale"
          ? round((2200000 + bedrooms * int(900000, 1800000)) * area.idx, 50000)
          : round((8000 + bedrooms * int(3500, 6800)) * area.idx, 500);
      name = `Flat ${int(1, 8)}${pick(["A", "B", "C"])}`;
      description = `${bedrooms} bedroom flat of ${attributes.sizeSqft} sqft on floor ${attributes.floor}.`;
      break;
    }
    case "room":
    case "shared-room": {
      attributes.bedrooms = 1;
      attributes.bathrooms = 1;
      attributes.sizeSqft = sqft(100, 210);
      attributes.floor = int(1, 6);
      attributes.furnishing = pick(["semi-furnished", "furnished", "unfurnished"]);
      price = round(int(type === "shared-room" ? 4000 : 6000, type === "shared-room" ? 8000 : 11500) * area.idx, 500);
      name = `${type === "shared-room" ? "Shared room" : "Room"} ${sequence}`;
      description = `${type === "shared-room" ? "Bed space in a shared flat" : "Single room"} of ${attributes.sizeSqft} sqft.`;
      break;
    }
    case "sublet": {
      attributes.bedrooms = int(1, 2);
      attributes.bathrooms = 1;
      attributes.sizeSqft = sqft(280, 620);
      attributes.floor = int(1, 7);
      attributes.furnishing = "furnished";
      price = round(int(8000, 15000) * area.idx, 500);
      name = `Sublet ${sequence}`;
      description = `Furnished sublet of ${attributes.sizeSqft} sqft inside a family flat.`;
      break;
    }
    case "house":
    case "tin-shed":
    case "homestead": {
      const bedrooms = int(2, 5);
      attributes.bedrooms = bedrooms;
      attributes.bathrooms = int(1, 3);
      attributes.sizeSqft = sqft(type === "tin-shed" ? 400 : 1100, type === "tin-shed" ? 900 : 2200);
      attributes.furnishing = "unfurnished";
      attributes.kitchen = true;
      attributes.roadAccess = rnd() > 0.25;
      attributes.waterSource = rnd() > 0.2;
      price =
        transaction === "sale"
          ? round(int(1800000, 7500000) * area.idx, 50000)
          : round(int(type === "tin-shed" ? 3500 : 16000, type === "tin-shed" ? 9000 : 45000) * area.idx, 500);
      name = type === "tin-shed" ? "Tin-shed house" : type === "homestead" ? "Homestead" : "House";
      description = `${bedrooms} room ${type === "tin-shed" ? "tin-shed home" : "house"} with ${attributes.waterSource ? "a water source" : "shared water access"}.`;
      break;
    }
    case "shop": {
      attributes.sizeSqft = sqft(90, 640);
      attributes.floor = pick([0, 0, 1]);
      attributes.frontageFt = int(8, 26);
      attributes.suitableFor = pick(["Grocery", "Pharmacy", "Restaurant", "Electronics", "Tailoring", "Mobile servicing", "Stationery"]);
      price =
        transaction === "sale"
          ? round(int(2500000, 9000000) * area.idx, 50000)
          : round(int(9000, 42000) * area.idx, 500);
      name = `Shop ${String(sequence).padStart(2, "0")}`;
      description = `${attributes.sizeSqft} sqft shop with ${attributes.frontageFt} ft frontage. Suits ${attributes.suitableFor.toLowerCase()}.`;
      break;
    }
    case "office": {
      attributes.sizeSqft = sqft(300, 2200);
      attributes.floor = int(2, 11);
      attributes.workstations = int(4, 48);
      attributes.meetingRoom = rnd() > 0.4;
      price = round(int(18000, 95000) * area.idx, 1000);
      name = `Office floor ${attributes.floor}`;
      description = `${attributes.sizeSqft} sqft office fitted for about ${attributes.workstations} workstations.`;
      break;
    }
    case "godown": {
      attributes.sizeSqft = sqft(400, 4200);
      attributes.ceilingHeightFt = int(9, 22);
      attributes.loadingAccess = rnd() > 0.25;
      attributes.vehicleAccess = rnd() > 0.2;
      attributes.suitableFor = pick(["Dry goods", "Textiles", "Electronics", "Construction material", "General storage"]);
      price = round(int(12000, 60000) * area.idx, 500);
      name = `Godown ${String(sequence).padStart(2, "0")}`;
      description = `${attributes.sizeSqft} sqft storage with ${attributes.ceilingHeightFt} ft ceiling.`;
      break;
    }
    case "garage": {
      attributes.carSlots = int(1, 4);
      attributes.motorcycleSlots = int(0, 8);
      attributes.covered = rnd() > 0.35;
      attributes.accessHours = pick(["24 hours", "6am – 11pm", "Daytime only"]);
      price = round(int(1500, 6000) * area.idx, 100);
      name = "Garage";
      description = `${attributes.carSlots} car and ${attributes.motorcycleSlots} motorcycle slots, ${attributes.covered ? "covered" : "open"}.`;
      break;
    }
    case "parking-slot": {
      attributes.carSlots = 1;
      attributes.motorcycleSlots = 0;
      attributes.covered = rnd() > 0.5;
      attributes.accessHours = pick(["24 hours", "6am – 11pm"]);
      price = round(int(1200, 4500) * area.idx, 100);
      name = `Parking slot ${sequence}`;
      description = `Single ${attributes.covered ? "covered" : "open"} car slot, access ${attributes.accessHours.toLowerCase()}.`;
      break;
    }
    case "farmland":
    case "pond": {
      attributes.landAreaDecimal = int(8, 220);
      attributes.landUse = type === "pond" ? "Fishery" : pick(["Paddy", "Vegetable", "Mixed crop", "Orchard"]);
      attributes.roadAccess = rnd() > 0.3;
      attributes.waterSource = type === "pond" ? true : rnd() > 0.35;
      attributes.leaseYears = transaction === "rent" ? pick([1, 2, 3, 5]) : undefined;
      price =
        transaction === "sale"
          ? round(attributes.landAreaDecimal * int(18000, 60000), 10000)
          : round(attributes.landAreaDecimal * int(180, 700), 500);
      name = type === "pond" ? "Pond" : "Farmland plot";
      description = `${attributes.landAreaDecimal} decimal of ${attributes.landUse.toLowerCase()} land${attributes.roadAccess ? " with road access" : ""}.`;
      break;
    }
    default:
      price = 10000;
      name = "Space";
      description = "Space.";
  }

  // roughly a quarter of listings withhold part of the cost on purpose
  const rental = transaction === "rent";
  const disclosed = rental && rnd() > 0.24;
  const serviceCharge = disclosed ? round(price * (0.05 + rnd() * 0.08), 100) : null;
  const utilities = disclosed ? pick([700, 900, 1100, 1400]) : null;
  const cost = {
    price,
    serviceCharge,
    utilities,
    securityDeposit: rental && disclosed ? round(price * pick([0.5, 1, 1]), 500) : null,
    advanceMonths: rental ? pick([1, 2, 2, 3]) : null,
    estimatedMonthly: disclosed ? price + serviceCharge + utilities : null,
  };

  const AMEN = {
    living: ["lift", "gas", "generator", "parking", "balcony", "attached-bathroom", "water-reserve", "security", "wifi", "cctv", "rooftop", "furnished"],
    business: ["ac", "shutter", "generator", "parking", "security", "cctv", "lift", "wifi", "electricity"],
    storage: ["loading-access", "electricity", "security", "cctv", "generator", "road-access"],
    parking: ["covered", "security", "cctv", "ev-charging", "electricity"],
    land: ["road-access", "electricity", "water-source", "security"],
  };
  const amenities = some(AMEN[category], int(2, Math.min(6, AMEN[category].length)));

  const updatedDays = Math.floor(Math.pow(rnd(), 2) * 50);
  const availableInDays = int(0, 55);

  let status;
  const roll = rnd();
  if (category === "parking" && attributes.carSlots > 1 && roll > 0.45) status = "partially-available";
  else if (roll > 0.88) status = "occupied";
  else if (roll > 0.83) status = "maintenance";
  else if (availableInDays > 38) status = "available-soon";
  else status = "available";

  let note;
  let totalUnits;
  let availableUnits;
  if (category === "parking") {
    totalUnits = (attributes.carSlots ?? 0) + (attributes.motorcycleSlots ?? 0);
    availableUnits = status === "occupied" ? 0 : Math.max(1, Math.round(totalUnits * (status === "partially-available" ? 0.5 : 1)));
    const cars = Math.min(attributes.carSlots ?? 0, availableUnits);
    const bikes = Math.max(0, availableUnits - cars);
    note = [cars ? `${cars} car slot${cars > 1 ? "s" : ""}` : null, bikes ? `${bikes} motorcycle slot${bikes > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ") + " free";
  } else if (type === "godown" && status === "partially-available") {
    note = `${round(attributes.sizeSqft * 0.6, 50)} sqft of ${attributes.sizeSqft} sqft free`;
  } else if (type === "office") {
    note = `${attributes.workstations} workstations`;
  }

  const vLevel = rnd() > 0.44 ? "full" : rnd() > 0.35 ? "partial" : "minimal";
  const pool = IMAGE_POOL[category];
  const images = Array.from({ length: int(2, 4) }, (_, k) => {
    const file = pick(pool);
    const labels = { living: ["Exterior", "Living area", "Bedroom", "Kitchen"], business: ["Frontage", "Interior", "Floor"], storage: ["Exterior", "Storage floor"], parking: ["Entrance", "Parking area"], land: ["Plot", "Surroundings", "Access road"] };
    const label = labels[category][k % labels[category].length];
    return {
      url: `/photos/${file}.svg`,
      label,
      alt: `Illustrative demo image representing the ${label.toLowerCase()} of ${name} at ${property.name}`,
      demo: true,
    };
  });

  return {
    id: `SP-${String(idx).padStart(4, "0")}`,
    propertyId: property.id,
    name,
    category,
    spaceType: type,
    transaction,
    cost,
    attributes,
    amenities,
    availability: { status, availableFrom: iso(availableInDays), ...(note ? { note } : {}), ...(totalUnits ? { totalUnits, availableUnits } : {}) },
    images,
    description,
    verification: (() => { const v = verification(vLevel); delete v._id; return v; })(),
    lastUpdated: iso(-updatedDays),
    views: int(6, 280),
    inquiryCount: int(0, 32),
    synthetic: true,
  };
}

/* ── Build ────────────────────────────────────────────────────────── */

const owners = [];
const properties = [];
const spaces = [];

const PROPERTY_COUNT = 96;
let spaceIdx = 1;

const BUILDING_WORDS = ["Villa", "Tower", "Bhaban", "Manzil", "Residence", "Heights", "Garden", "House", "Plaza", "Nibash"];

for (let i = 0; i < PROPERTY_COUNT; i++) {
  const area = pick(AREAS);
  const hood = pick(area.hoods);
  const ownerName = `${pick(FIRST)} ${pick(LAST)}`;
  const vLevel = rnd() > 0.45 ? "full" : rnd() > 0.35 ? "partial" : "minimal";

  const owner = {
    id: `OW-${String(i + 1).padStart(3, "0")}`,
    name: ownerName,
    role: rnd() > 0.75 ? "caretaker" : "owner",
    avatarTone: pick(TONES),
    memberSince: iso(-int(90, 700)),
    responseRate: int(62, 99),
    responseTimeHours: int(1, 30),
    verification: vLevel === "full" ? "verified" : vLevel === "partial" ? "identity-submitted" : "unverified",
  };
  owners.push(owner);

  const isRural = area.geo === "rural";
  const property = {
    id: `PR-${String(i + 1).padStart(3, "0")}`,
    name: isRural
      ? `${ownerName.split(" ")[0]} ${pick(["Bari", "Homestead", "Para", "Khamar"])}`
      : `${ownerName.split(" ")[1]} ${pick(BUILDING_WORDS)}`,
    ownerId: owner.id,
    area: area.name,
    neighborhood: hood,
    address: `House ${int(3, 120)}, Road ${int(1, 22)}, ${hood}`,
    district: area.district,
    geography: area.geo,
    latitude: Number((area.lat + (rnd() - 0.5) * 0.016).toFixed(5)),
    longitude: Number((area.lng + (rnd() - 0.5) * 0.016).toFixed(5)),
    nearby: [
      ["University", 0.3, 3.4], ["Bus stop", 0.1, 1.2], ["Hospital", 0.5, 4.0],
      ["Grocery", 0.1, 0.9], ["Metro station", 0.6, 5.0], ["Bazar", 0.2, 2.0],
    ].filter(() => rnd() > 0.35).map(([label, lo, hi]) => ({ label, km: Number((lo + rnd() * (hi - lo)).toFixed(1)) })),
    coverImage: `/photos/${pick(IMAGE_POOL[isRural ? "land" : "living"])}.svg`,
    createdAt: iso(-int(20, 400)),
    synthetic: true,
  };
  properties.push(property);

  // Multi-space buildings are the point of the model, so most properties hold several.
  const spaceCount = isRural ? int(1, 3) : rnd() > 0.45 ? int(2, 6) : 1;
  const mix = isRural ? RURAL_MIX : URBAN_MIX;
  const counters = {};

  for (let s = 0; s < spaceCount; s++) {
    const type = weighted(mix).type;
    counters[type] = (counters[type] ?? 0) + 1;
    spaces.push(makeSpace(spaceIdx++, property, area, type, counters[type]));
  }
}

mkdirSync("src/data", { recursive: true });
writeFileSync(
  "src/data/seed.json",
  JSON.stringify(
    {
      _notice: "SYNTHETIC SEED DATA — generated for the Habito prototype. No real properties, owners, photos or availability.",
      generatedOn: new Date().toISOString().slice(0, 10),
      owners,
      properties,
      spaces,
    },
    null,
    1,
  ),
);

/* The demo owner needs a portfolio worth showing: several properties, and one
   building holding flats, a shop, a godown and a garage at the same time. */
const DEMO_OWNER = owners[0];
DEMO_OWNER.name = "Rahman Chowdhury";
DEMO_OWNER.verification = "verified";
DEMO_OWNER.responseRate = 94;
DEMO_OWNER.responseTimeHours = 3;

const showcase = [
  { area: AREAS.find((a) => a.name === "Mirpur"), name: "Rahman Building", mix: ["apartment", "apartment", "shop", "godown", "garage"] },
  { area: AREAS.find((a) => a.name === "Badda"), name: "Rahman Annex", mix: ["room", "shared-room", "parking-slot"] },
  { area: AREAS.find((a) => a.name === "Manikganj"), name: "Rahman Bari", mix: ["tin-shed", "farmland"] },
];

const demoProperties = [];
const demoSpaces = [];

showcase.forEach((entry, i) => {
  const area = entry.area;
  const hood = area.hoods[0];
  const property = {
    id: `PR-D${i + 1}`,
    name: entry.name,
    ownerId: DEMO_OWNER.id,
    area: area.name,
    neighborhood: hood,
    address: `House ${12 + i * 7}, Road ${3 + i}, ${hood}`,
    district: area.district,
    geography: area.geo,
    latitude: Number((area.lat + (rnd() - 0.5) * 0.01).toFixed(5)),
    longitude: Number((area.lng + (rnd() - 0.5) * 0.01).toFixed(5)),
    nearby: [
      { label: "Bus stop", km: Number((0.2 + rnd() * 0.6).toFixed(1)) },
      { label: "Grocery", km: Number((0.2 + rnd() * 0.5).toFixed(1)) },
      { label: "Hospital", km: Number((0.8 + rnd() * 2).toFixed(1)) },
    ],
    coverImage: `/photos/${area.geo === "rural" ? "land-1" : "living-2"}.svg`,
    createdAt: iso(-int(40, 300)),
    synthetic: true,
  };
  demoProperties.push(property);

  const counters = {};
  entry.mix.forEach((type) => {
    counters[type] = (counters[type] ?? 0) + 1;
    demoSpaces.push(makeSpace(spaceIdx++, property, area, type, counters[type]));
  });
});

// Put the demo portfolio first so it's the one an evaluator lands on.
properties.unshift(...demoProperties);
spaces.unshift(...demoSpaces);

writeFileSync(
  "src/data/seed.json",
  JSON.stringify(
    {
      _notice: "SYNTHETIC SEED DATA — generated for the Habito prototype. No real properties, owners, photos or availability.",
      generatedOn: new Date().toISOString().slice(0, 10),
      owners,
      properties,
      spaces,
    },
    null,
    1,
  ),
);

console.log(`owners ${owners.length} · properties ${properties.length} · spaces ${spaces.length}`);
console.log(`demo owner ${DEMO_OWNER.id} holds ${demoProperties.length} properties and ${demoSpaces.length} spaces`);
