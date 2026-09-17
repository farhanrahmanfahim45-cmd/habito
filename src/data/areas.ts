export interface Area {
  id: string;
  name: string;
  district: string;
  geography: "urban" | "suburban" | "rural";
  latitude: number;
  longitude: number;
  note: string;
}

export const AREAS: Area[] = [
  { id: "mirpur", name: "Mirpur", district: "Dhaka", geography: "urban", latitude: 23.8069, longitude: 90.3687, note: "Dense and well connected" },
  { id: "mohammadpur", name: "Mohammadpur", district: "Dhaka", geography: "urban", latitude: 23.759, longitude: 90.3595, note: "Established residential" },
  { id: "uttara", name: "Uttara", district: "Dhaka", geography: "urban", latitude: 23.87, longitude: 90.399, note: "Planned sectors, metro access" },
  { id: "badda", name: "Badda", district: "Dhaka", geography: "urban", latitude: 23.7806, longitude: 90.4264, note: "Central-east, working renters" },
  { id: "bashundhara", name: "Bashundhara R/A", district: "Dhaka", geography: "urban", latitude: 23.82, longitude: 90.4265, note: "University corridor" },
  { id: "rampura", name: "Rampura", district: "Dhaka", geography: "urban", latitude: 23.761, longitude: 90.418, note: "Mixed residential" },
  { id: "kuril", name: "Kuril", district: "Dhaka", geography: "urban", latitude: 23.8223, longitude: 90.4198, note: "Close to the expressway" },
  { id: "khilkhet", name: "Khilkhet", district: "Dhaka", geography: "urban", latitude: 23.8293, longitude: 90.4189, note: "Airport side, mixed use" },
  { id: "kallyanpur", name: "Kallyanpur", district: "Dhaka", geography: "urban", latitude: 23.779, longitude: 90.3597, note: "Affordable, transport-rich" },
  { id: "jatrabari", name: "Jatrabari", district: "Dhaka", geography: "urban", latitude: 23.7104, longitude: 90.4335, note: "South Dhaka, lower rents" },
  { id: "savar", name: "Savar", district: "Dhaka", geography: "suburban", latitude: 23.8583, longitude: 90.2667, note: "Outer belt, budget housing" },
  { id: "tongi", name: "Tongi", district: "Gazipur", geography: "suburban", latitude: 23.8917, longitude: 90.4058, note: "Industrial employment base" },
  { id: "keraniganj", name: "Keraniganj", district: "Dhaka", geography: "suburban", latitude: 23.69, longitude: 90.39, note: "Across the river" },
  { id: "narayanganj", name: "Narayanganj", district: "Narayanganj", geography: "suburban", latitude: 23.6238, longitude: 90.5, note: "Separate city, commuter base" },
  { id: "manikganj", name: "Manikganj", district: "Manikganj", geography: "rural", latitude: 23.8617, longitude: 90.0003, note: "Farmland and homesteads" },
  { id: "munshiganj", name: "Munshiganj", district: "Munshiganj", geography: "rural", latitude: 23.5422, longitude: 90.5305, note: "Ponds, crops, village homes" },
  { id: "sonargaon", name: "Sonargaon", district: "Narayanganj", geography: "rural", latitude: 23.6486, longitude: 90.6006, note: "Historic, rural mixed use" },
];

export const areaByName = (name: string) => AREAS.find((a) => a.name === name);

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180);
  return 2 * R * Math.asin(Math.sqrt(h));
}
