export type Geography = "urban" | "suburban" | "rural";

export interface Area {
  id: string;
  name: string;
  /** Dhaka, Gazipur, Chattogram — what sits above the area. */
  district: string;
  /** The group a picker shows it under. */
  region: string;
  geography: Geography;
  /**
   * Approximate centre, used only to rank how far a listing is from a chosen
   * area. Accurate enough to order results, not a survey coordinate.
   */
  latitude: number;
  longitude: number;
  /** Well-known neighbourhoods inside it, for search and listing forms. */
  neighborhoods?: string[];
}

/**
 * Geography for Habito.
 *
 * Dhaka is covered at thana level — the 50 Dhaka Metropolitan Police thanas —
 * because that is how people here say where they live, and because "Dhaka" as
 * one option makes search useless in the city that matters most. Everywhere
 * else is coarser: a metro area for the divisional cities, a district
 * elsewhere, which is the right grain until there is supply there.
 *
 * Thana list from Bangladesh Police (dmp.gov.bd), 2026.
 */
export const AREAS: Area[] = [
  // ── Dhaka Metropolitan Police thanas ──────────────────────────────────
  { id: "adabor", name: "Adabor", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7695, longitude: 90.3566, neighborhoods: ["Adabor", "Shyamoli", "Ring Road"] },
  { id: "airport", name: "Airport", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8513, longitude: 90.4086, neighborhoods: ["Kurmitola", "Airport Road"] },
  { id: "badda", name: "Badda", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7806, longitude: 90.4264, neighborhoods: ["Middle Badda", "North Badda", "Merul Badda", "Uttar Badda"] },
  { id: "banani", name: "Banani", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7937, longitude: 90.4066, neighborhoods: ["Banani", "Banani DOHS", "Chairman Bari"] },
  { id: "bangshal", name: "Bangshal", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7182, longitude: 90.4053, neighborhoods: ["Bangshal", "English Road", "Nawabpur"] },
  { id: "bhashantek", name: "Bhashantek", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8157, longitude: 90.3934, neighborhoods: ["Bhashantek", "Damalkot"] },
  { id: "cantonment", name: "Cantonment", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8223, longitude: 90.3956, neighborhoods: ["Manikdi", "Matikata", "MES"] },
  { id: "chackbazar", name: "Chackbazar", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7189, longitude: 90.3954, neighborhoods: ["Chawkbazar", "Bakshibazar"] },
  { id: "dakshinkhan", name: "Dakshinkhan", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8748, longitude: 90.4157, neighborhoods: ["Dakshinkhan", "Ashkona", "Faydabad"] },
  { id: "darussalam", name: "Darus-Salam", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7859, longitude: 90.3554, neighborhoods: ["Darussalam", "Technical", "Gabtoli"] },
  { id: "demra", name: "Demra", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7104, longitude: 90.4903, neighborhoods: ["Demra", "Matuail", "Sarulia"] },
  { id: "dhanmondi", name: "Dhanmondi", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7461, longitude: 90.3742, neighborhoods: ["Dhanmondi", "Jigatola", "Shukrabad"] },
  { id: "gandaria", name: "Gandaria", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7053, longitude: 90.4243, neighborhoods: ["Gandaria", "Dholairpar"] },
  { id: "gulshan", name: "Gulshan", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7925, longitude: 90.4144, neighborhoods: ["Gulshan 1", "Gulshan 2", "Niketan"] },
  { id: "hatirjheel", name: "Hatirjheel", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7566, longitude: 90.4062, neighborhoods: ["Hatirjheel", "Ulon", "Madhubag"] },
  { id: "hazaribagh", name: "Hazaribagh", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7377, longitude: 90.3661, neighborhoods: ["Hazaribagh", "Rayerbazar"] },
  { id: "jatrabari", name: "Jatrabari", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7104, longitude: 90.4335, neighborhoods: ["Jatrabari", "Konapara", "Shanir Akhra"] },
  { id: "kadamtoli", name: "Kadamtoli", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.6947, longitude: 90.4438, neighborhoods: ["Kadamtoli", "Dania"] },
  { id: "kafrul", name: "Kafrul", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7942, longitude: 90.3829, neighborhoods: ["Kafrul", "Ibrahimpur", "West Kafrul"] },
  { id: "kalabagan", name: "Kalabagan", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7503, longitude: 90.3823, neighborhoods: ["Kalabagan", "Green Road"] },
  { id: "kamrangirchar", name: "Kamrangirchar", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7139, longitude: 90.3805, neighborhoods: ["Kamrangirchar", "Ashrafabad"] },
  { id: "khilgaon", name: "Khilgaon", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7501, longitude: 90.4256, neighborhoods: ["Khilgaon", "Taltola", "Goran"] },
  { id: "khilkhet", name: "Khilkhet", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8293, longitude: 90.4189, neighborhoods: ["Khilkhet", "Nikunja 1", "Nikunja 2"] },
  { id: "kotwali", name: "Kotwali", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7104, longitude: 90.4074, neighborhoods: ["Kotwali", "Sadarghat", "Islampur"] },
  { id: "lalbagh", name: "Lalbagh", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7189, longitude: 90.3879, neighborhoods: ["Lalbagh", "Azimpur", "Nawabganj"] },
  { id: "mirpur", name: "Mirpur Model", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8069, longitude: 90.3687, neighborhoods: ["Mirpur 1", "Mirpur 2", "Mirpur 10", "Kazipara", "Shewrapara"] },
  { id: "mohammadpur", name: "Mohammadpur", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.759, longitude: 90.3595, neighborhoods: ["Tajmahal Road", "Katasur", "Nurjahan Road", "Bosila"] },
  { id: "motijheel", name: "Motijheel", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.733, longitude: 90.4172, neighborhoods: ["Motijheel", "Arambagh", "Fakirapool"] },
  { id: "mugda", name: "Mugda", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7375, longitude: 90.4318, neighborhoods: ["Mugdapara", "Manda"] },
  { id: "newmarket", name: "New Market", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7339, longitude: 90.3845, neighborhoods: ["New Market", "Nilkhet", "Elephant Road"] },
  { id: "pallabi", name: "Pallabi", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8223, longitude: 90.3654, neighborhoods: ["Mirpur 11", "Mirpur 12", "Pallabi"] },
  { id: "paltan", name: "Paltan", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7346, longitude: 90.4132, neighborhoods: ["Paltan", "Bijoynagar", "Naya Paltan"] },
  { id: "ramna", name: "Ramna", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7389, longitude: 90.3959, neighborhoods: ["Ramna", "Shantinagar", "Eskaton"] },
  { id: "rampura", name: "Rampura", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.761, longitude: 90.418, neighborhoods: ["West Rampura", "Banasree", "Ulon"] },
  { id: "rupnagar", name: "Rupnagar", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8241, longitude: 90.3556, neighborhoods: ["Rupnagar", "Duaripara"] },
  { id: "sabujbagh", name: "Sabujbagh", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7405, longitude: 90.434, neighborhoods: ["Sabujbagh", "Basabo", "Madertek"] },
  { id: "shahali", name: "Shah Ali", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8, longitude: 90.3569, neighborhoods: ["Mirpur 1", "Gudaraghat"] },
  { id: "shahbagh", name: "Shahbagh", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7383, longitude: 90.3956, neighborhoods: ["Shahbagh", "Hatirpool"] },
  { id: "shahjahanpur", name: "Shahjahanpur", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7395, longitude: 90.42, neighborhoods: ["Shahjahanpur", "Khilgaon Railgate"] },
  { id: "sherebangla", name: "Sher-e-Bangla Nagar", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7778, longitude: 90.3776, neighborhoods: ["Agargaon", "Shyamoli"] },
  { id: "shyampur", name: "Shyampur", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.6928, longitude: 90.4344, neighborhoods: ["Shyampur", "Jurain", "Postagola"] },
  { id: "sutrapur", name: "Sutrapur", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7068, longitude: 90.419, neighborhoods: ["Sutrapur", "Narinda", "Wari"] },
  { id: "tejgaon", name: "Tejgaon", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7639, longitude: 90.3934, neighborhoods: ["Tejgaon", "Farmgate", "Nakhalpara"] },
  { id: "tejgaon-ind", name: "Tejgaon Industrial", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.77, longitude: 90.402, neighborhoods: ["Tejgaon I/A", "Mohakhali"] },
  { id: "turag", name: "Turag", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8703, longitude: 90.3763, neighborhoods: ["Turag", "Kamarpara", "Diabari"] },
  { id: "uttarkhan", name: "Uttar Khan", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8817, longitude: 90.4085, neighborhoods: ["Uttarkhan", "Mazar Road"] },
  { id: "uttara-east", name: "Uttara East", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.87, longitude: 90.402, neighborhoods: ["Sector 3", "Sector 4", "Sector 7", "Sector 9"] },
  { id: "uttara-west", name: "Uttara West", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.8759, longitude: 90.3795, neighborhoods: ["Sector 10", "Sector 11", "Sector 13", "Sector 14"] },
  { id: "vatara", name: "Vatara", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.81, longitude: 90.4265, neighborhoods: ["Bashundhara Block A", "Block C", "Block D", "Block G", "Kuril", "Nadda"] },
  { id: "wari", name: "Wari", district: "Dhaka", region: "Dhaka Metro", geography: "urban", latitude: 23.7182, longitude: 90.4218, neighborhoods: ["Wari", "Rankin Street", "Tipu Sultan Road"] },

  // ── Greater Dhaka ─────────────────────────────────────────────────────
  { id: "savar", name: "Savar", district: "Dhaka", region: "Greater Dhaka", geography: "suburban", latitude: 23.8583, longitude: 90.2667, neighborhoods: ["Bank Colony", "Radio Colony", "Genda", "Hemayetpur"] },
  { id: "ashulia", name: "Ashulia", district: "Dhaka", region: "Greater Dhaka", geography: "suburban", latitude: 23.9167, longitude: 90.3167, neighborhoods: ["Jamgora", "Baipail", "Nishchintapur"] },
  { id: "keraniganj", name: "Keraniganj", district: "Dhaka", region: "Greater Dhaka", geography: "suburban", latitude: 23.69, longitude: 90.39, neighborhoods: ["Zinzira", "Aganagar", "Kalindi"] },
  { id: "tongi", name: "Tongi", district: "Gazipur", region: "Greater Dhaka", geography: "suburban", latitude: 23.8917, longitude: 90.4058, neighborhoods: ["Cherag Ali", "Station Road", "Gazipura"] },
  { id: "gazipur", name: "Gazipur Sadar", district: "Gazipur", region: "Greater Dhaka", geography: "suburban", latitude: 23.9999, longitude: 90.4203, neighborhoods: ["Joydebpur", "Chandana", "Board Bazar"] },
  { id: "narayanganj", name: "Narayanganj", district: "Narayanganj", region: "Greater Dhaka", geography: "suburban", latitude: 23.6238, longitude: 90.5, neighborhoods: ["Chashara", "Fatullah", "Siddhirganj"] },
  { id: "sonargaon", name: "Sonargaon", district: "Narayanganj", region: "Greater Dhaka", geography: "rural", latitude: 23.6486, longitude: 90.6006, neighborhoods: ["Baidyer Bazar", "Panam", "Mograpara"] },
  { id: "munshiganj", name: "Munshiganj", district: "Munshiganj", region: "Greater Dhaka", geography: "rural", latitude: 23.5422, longitude: 90.5305, neighborhoods: ["Sirajdikhan", "Tongibari", "Sadar"] },
  { id: "manikganj", name: "Manikganj", district: "Manikganj", region: "Greater Dhaka", geography: "rural", latitude: 23.8617, longitude: 90.0003, neighborhoods: ["Saturia", "Ghior", "Sadar"] },
  { id: "narsingdi", name: "Narsingdi", district: "Narsingdi", region: "Greater Dhaka", geography: "rural", latitude: 23.9226, longitude: 90.715, neighborhoods: ["Madhabdi", "Palash", "Sadar"] },

  // ── Other divisions ───────────────────────────────────────────────────
  { id: "ctg-kotwali", name: "Chattogram — Kotwali", district: "Chattogram", region: "Chattogram", geography: "urban", latitude: 22.335, longitude: 91.8325, neighborhoods: ["Anderkilla", "Jamalkhan", "Chawkbazar"] },
  { id: "ctg-panchlaish", name: "Chattogram — Panchlaish", district: "Chattogram", region: "Chattogram", geography: "urban", latitude: 22.361, longitude: 91.829, neighborhoods: ["Panchlaish", "Nasirabad", "Mehedibag"] },
  { id: "ctg-khulshi", name: "Chattogram — Khulshi", district: "Chattogram", region: "Chattogram", geography: "urban", latitude: 22.36, longitude: 91.81, neighborhoods: ["Khulshi", "Zakir Hossain Road"] },
  { id: "ctg-agrabad", name: "Chattogram — Agrabad", district: "Chattogram", region: "Chattogram", geography: "urban", latitude: 22.3269, longitude: 91.8123, neighborhoods: ["Agrabad", "Halishahar"] },
  { id: "cumilla", name: "Cumilla", district: "Cumilla", region: "Chattogram", geography: "urban", latitude: 23.4607, longitude: 91.1809, neighborhoods: ["Kandirpar", "Jhautola"] },
  { id: "coxsbazar", name: "Cox's Bazar", district: "Cox's Bazar", region: "Chattogram", geography: "urban", latitude: 21.4272, longitude: 92.0058, neighborhoods: ["Kolatoli", "Laboni"] },
  { id: "sylhet", name: "Sylhet City", district: "Sylhet", region: "Sylhet", geography: "urban", latitude: 24.8949, longitude: 91.8687, neighborhoods: ["Zindabazar", "Amberkhana", "Subid Bazar", "Uposhohor"] },
  { id: "khulna", name: "Khulna City", district: "Khulna", region: "Khulna", geography: "urban", latitude: 22.8456, longitude: 89.5403, neighborhoods: ["Sonadanga", "Khalishpur", "Boyra"] },
  { id: "rajshahi", name: "Rajshahi City", district: "Rajshahi", region: "Rajshahi", geography: "urban", latitude: 24.3745, longitude: 88.6042, neighborhoods: ["Shaheb Bazar", "Uposhohor", "Motihar"] },
  { id: "barishal", name: "Barishal City", district: "Barishal", region: "Barishal", geography: "urban", latitude: 22.701, longitude: 90.3535, neighborhoods: ["Band Road", "Nathullabad", "Rupatoli"] },
  { id: "rangpur", name: "Rangpur City", district: "Rangpur", region: "Rangpur", geography: "urban", latitude: 25.7439, longitude: 89.2752, neighborhoods: ["Dhap", "Jahaj Company", "Shalbon"] },
  { id: "mymensingh", name: "Mymensingh City", district: "Mymensingh", region: "Mymensingh", geography: "urban", latitude: 24.7471, longitude: 90.4203, neighborhoods: ["Ganginar Par", "Chorpara", "Maskanda"] },
];

/** Grouped for a picker, in the order a Bangladeshi user expects. */
export const REGION_ORDER = [
  "Dhaka Metro",
  "Greater Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
] as const;

export const areaByName = (name: string) => AREAS.find((a) => a.name === name);
export const areaById = (id: string) => AREAS.find((a) => a.id === id);

export function areasByRegion(): Array<{ region: string; areas: Area[] }> {
  return REGION_ORDER.map((region) => ({
    region: region as string,
    areas: AREAS.filter((a) => a.region === region),
  })).filter((group) => group.areas.length > 0);
}

/** Matches an area by its own name, its district, or a neighbourhood in it. */
export function searchAreas(query: string): Area[] {
  const q = query.trim().toLowerCase();
  if (!q) return AREAS;

  return AREAS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q) ||
      (a.neighborhoods ?? []).some((n) => n.toLowerCase().includes(q)),
  );
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Areas nearest a given one, for the "nothing perfect yet" fallback. */
export function nearestAreas(name: string, limit = 5): Area[] {
  const origin = areaByName(name);
  if (!origin) return [];

  return AREAS.filter((a) => a.id !== origin.id)
    .map((a) => ({ area: a, km: haversineKm(origin.latitude, origin.longitude, a.latitude, a.longitude) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, limit)
    .map((x) => x.area);
}
