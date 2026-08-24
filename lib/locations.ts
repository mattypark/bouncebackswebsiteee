/*
  BounceBack bin network — the single source of truth for every state and
  facility with a bin. Consumed by the /locations map and the state explorer.
  coords are [lng, lat] so they drop straight into react-simple-maps.
*/

export interface Location {
  name: string;
  city: string;
  nonprofit: boolean;
  coords: [number, number]; // [lng, lat]
}

export interface StateData {
  fips: string;
  abbr: string;
  name: string;
  coords: [number, number];
  zoomLevel: number;
  locations: Location[];
}

export const LOCATION_DATA: StateData[] = [
  {
    fips: "12",
    abbr: "FL",
    name: "Florida",
    coords: [-81.5, 28.1],
    zoomLevel: 4,
    locations: [
      { name: "South Sea Island", city: "Captiva", nonprofit: false, coords: [-82.19, 26.53] },
      { name: "Eagle Scout Park", city: "Dunedin", nonprofit: false, coords: [-82.77, 28.02] },
      { name: "Verdana Village", city: "Estero", nonprofit: false, coords: [-81.81, 26.44] },
      { name: "Three Oaks Park", city: "Estero", nonprofit: false, coords: [-81.82, 26.42] },
      { name: "Murano", city: "Estero", nonprofit: false, coords: [-81.80, 26.45] },
      { name: "Shadowwood Preserve", city: "Estero", nonprofit: false, coords: [-81.83, 26.43] },
      { name: "Ace Pickleball Club", city: "Fort Myers", nonprofit: false, coords: [-81.87, 26.64] },
      { name: "Brooks Community Park", city: "Fort Myers", nonprofit: false, coords: [-81.86, 26.60] },
      { name: "DNA Pickleball", city: "Fort Myers", nonprofit: false, coords: [-81.88, 26.62] },
      { name: "The Landings", city: "Fort Myers", nonprofit: false, coords: [-81.85, 26.58] },
      { name: "Bay Oaks Community Center", city: "Fort Myers", nonprofit: false, coords: [-81.94, 26.45] },
      { name: "Plantation Recreation Resort", city: "Lady Lake", nonprofit: true, coords: [-81.93, 28.92] },
      { name: "Dink House Pickleball Club", city: "Largo", nonprofit: false, coords: [-82.79, 27.91] },
      { name: "Ace Pickleball Club", city: "Lutz", nonprofit: false, coords: [-82.46, 28.15] },
      { name: "YMCA Marco Island", city: "Marco Island", nonprofit: false, coords: [-81.73, 25.94] },
      { name: "Naples Pickleball Center", city: "Naples", nonprofit: true, coords: [-81.79, 26.14] },
      { name: "Naples Heritage", city: "Naples", nonprofit: true, coords: [-81.77, 26.12] },
      { name: "Valencia Trails", city: "Naples", nonprofit: true, coords: [-81.75, 26.16] },
      { name: "Veterans Park", city: "Naples", nonprofit: true, coords: [-81.80, 26.18] },
      { name: "Tampa Bay Pickleball Club", city: "Oldsmar", nonprofit: false, coords: [-82.67, 28.03] },
      { name: "PicklePlex", city: "Punta Gorda", nonprofit: false, coords: [-82.05, 26.93] },
      { name: "The Dunes", city: "Sanibel", nonprofit: false, coords: [-82.07, 26.44] },
      { name: "Pickleball Shack SRQ", city: "Sarasota", nonprofit: false, coords: [-82.53, 27.34] },
      { name: "Lakehouse Cove", city: "Sarasota", nonprofit: false, coords: [-82.51, 27.30] },
      { name: "Cresswind Lakewood Ranch", city: "Sarasota", nonprofit: false, coords: [-82.41, 27.38] },
      { name: "MP Tennis & Sports", city: "Tampa", nonprofit: false, coords: [-82.46, 27.95] },
      { name: "Northdale Pickle Lounge", city: "Tampa", nonprofit: false, coords: [-82.51, 28.08] },
      { name: "Tampa Pickleball Crew", city: "Tampa", nonprofit: false, coords: [-82.48, 27.98] },
      { name: "Royal Lakes Country Club", city: "Lakewood Ranch", nonprofit: false, coords: [-82.40, 27.35] },
      { name: "Palm Aire Country Club", city: "Sarasota", nonprofit: false, coords: [-82.46, 27.40] },
      { name: "Pelican Landing", city: "Bonita Springs", nonprofit: false, coords: [-81.79, 26.38] },
      { name: "Spanish Wells Golf & Country Club", city: "Bonita Springs", nonprofit: false, coords: [-81.78, 26.34] },
      { name: "Renaissance Center Club at Palmira", city: "Bonita Springs", nonprofit: false, coords: [-81.76, 26.36] },
      { name: "Bradenton Yacht Club", city: "Palmetto", nonprofit: false, coords: [-82.58, 27.52] },
      { name: "Steep Dreams", city: "West Palm Beach", nonprofit: false, coords: [-80.06, 26.77] },
    ],
  },
  {
    fips: "08",
    abbr: "CO",
    name: "Colorado",
    coords: [-105.5, 39.0],
    zoomLevel: 4.5,
    locations: [
      { name: "Club Volo - South Broadway", city: "Denver", nonprofit: false, coords: [-104.99, 39.69] },
    ],
  },
  {
    fips: "06",
    abbr: "CA",
    name: "California",
    coords: [-119.4, 36.8],
    zoomLevel: 3.5,
    locations: [
      { name: "Tri Valley Pickleball Club", city: "Livermore", nonprofit: false, coords: [-121.77, 37.68] },
      { name: "Tri Valley Pickleball Club", city: "San Ramon", nonprofit: false, coords: [-121.98, 37.78] },
      { name: "Tri Valley Pickleball Club", city: "Pleasanton", nonprofit: false, coords: [-121.87, 37.66] },
      { name: "Blackhawk Country Club", city: "Danville", nonprofit: false, coords: [-121.93, 37.81] },
      { name: "Portola Valley Pickleball Club", city: "Portola Valley", nonprofit: false, coords: [-122.23, 37.38] },
      { name: "Paseo Club", city: "Valencia", nonprofit: false, coords: [-118.56, 34.41] },
      { name: "The Best Paddle Compound", city: "Los Angeles", nonprofit: false, coords: [-118.35, 34.05] },
    ],
  },
  {
    fips: "13",
    abbr: "GA",
    name: "Georgia",
    coords: [-83.5, 32.7],
    zoomLevel: 5,
    locations: [
      { name: "Pickleball Clubs (2)", city: "Saint Mary's", nonprofit: true, coords: [-81.55, 30.73] },
      { name: "Wilmington Island", city: "Savannah", nonprofit: true, coords: [-80.97, 32.00] },
      { name: "Lake Mayer", city: "Savannah", nonprofit: true, coords: [-81.06, 32.02] },
      { name: "Tybee YMCA", city: "Tybee Island", nonprofit: true, coords: [-80.85, 32.00] },
    ],
  },
  {
    fips: "47",
    abbr: "TN",
    name: "Tennessee",
    coords: [-86.6, 35.7],
    zoomLevel: 5,
    locations: [
      { name: "The Club at Fairvue Plantation", city: "Gallatin", nonprofit: true, coords: [-86.45, 36.39] },
      { name: "Northfield Church", city: "Gallatin", nonprofit: true, coords: [-86.47, 36.38] },
    ],
  },
  {
    fips: "23",
    abbr: "ME",
    name: "Maine",
    coords: [-69.4, 45.4],
    zoomLevel: 5,
    locations: [
      { name: "The Wicked Pickle", city: "South Portland", nonprofit: true, coords: [-70.28, 43.63] },
      { name: "The Point", city: "South Portland", nonprofit: true, coords: [-70.26, 43.64] },
      { name: "Apex Racket & Fitness", city: "Portland", nonprofit: true, coords: [-70.26, 43.66] },
      { name: "Deering Oaks Park", city: "Portland", nonprofit: true, coords: [-70.27, 43.66] },
      { name: "The Picklr", city: "Westbrook", nonprofit: true, coords: [-70.37, 43.68] },
      { name: "Auburn Public Courts", city: "Auburn", nonprofit: true, coords: [-70.24, 44.10] },
      { name: "Fort Williams Park", city: "Cape Elizabeth", nonprofit: true, coords: [-70.21, 43.62] },
      { name: "Loranger School Courts", city: "Old Orchard Beach", nonprofit: true, coords: [-70.38, 43.52] },
      { name: "Seacoast Pickleball", city: "York", nonprofit: true, coords: [-70.64, 43.16] },
      { name: "Williams Park", city: "Bangor", nonprofit: true, coords: [-68.77, 44.80] },
      { name: "Bounce Pickleball", city: "Biddeford", nonprofit: true, coords: [-70.45, 43.49] },
      { name: "Stearns High School", city: "Millinocket", nonprofit: true, coords: [-68.71, 45.66] },
      { name: "Mattanawcook Jr. High School", city: "Lincoln", nonprofit: true, coords: [-68.51, 45.36] },
      { name: "Messalonskee High School", city: "Oakland", nonprofit: true, coords: [-69.72, 44.54] },
      { name: "South Portland High School", city: "South Portland", nonprofit: true, coords: [-70.30, 43.63] },
      { name: "China Middle School", city: "South China", nonprofit: true, coords: [-69.58, 44.42] },
    ],
  },
  {
    fips: "25",
    abbr: "MA",
    name: "Massachusetts",
    coords: [-71.8, 42.4],
    zoomLevel: 7,
    locations: [
      { name: "Recreation Park @ Pomps Pond", city: "Andover", nonprofit: true, coords: [-71.14, 42.66] },
      { name: "Doherty Gym Courts", city: "Braintree", nonprofit: true, coords: [-71.00, 42.20] },
      { name: "NE Racquet @ Thayer Academy", city: "Braintree", nonprofit: true, coords: [-70.98, 42.21] },
      { name: "Pickles", city: "Hanover", nonprofit: true, coords: [-70.81, 42.11] },
      { name: "Boston Pickle Club", city: "Norwell", nonprofit: true, coords: [-70.79, 42.16] },
      { name: "JCC", city: "Marblehead", nonprofit: true, coords: [-70.86, 42.50] },
      { name: "Seaside Park", city: "Marblehead", nonprofit: true, coords: [-70.85, 42.50] },
      { name: "Veterans Middle School", city: "Marblehead", nonprofit: true, coords: [-70.87, 42.49] },
      { name: "New England Pickleball Club", city: "Middleton", nonprofit: true, coords: [-71.02, 42.60] },
    ],
  },
  {
    fips: "33",
    abbr: "NH",
    name: "New Hampshire",
    coords: [-71.6, 43.8],
    zoomLevel: 6,
    locations: [
      { name: "Foss Field", city: "Wolfeboro", nonprofit: true, coords: [-71.21, 43.58] },
      { name: "Exeter Recreation Park", city: "Exeter", nonprofit: true, coords: [-70.95, 42.98] },
      { name: "Eastman Courts", city: "Grantham", nonprofit: true, coords: [-72.14, 43.49] },
      { name: "Prout Park", city: "Manchester", nonprofit: true, coords: [-71.45, 42.99] },
      { name: "Portsmouth Public Courts", city: "Portsmouth", nonprofit: true, coords: [-70.76, 43.07] },
      { name: "New England Pickleball Club", city: "Rye", nonprofit: true, coords: [-70.77, 43.01] },
      { name: "Pickleball603", city: "East Hampstead", nonprofit: true, coords: [-71.16, 42.87] },
      { name: "Seacoast Pickleball", city: "Newmarket", nonprofit: true, coords: [-70.94, 43.08] },
    ],
  },
  {
    fips: "36",
    abbr: "NY",
    name: "New York",
    coords: [-75.5, 43.0],
    zoomLevel: 4.5,
    locations: [
      { name: "The Pickle Complex", city: "Syosset", nonprofit: false, coords: [-73.50, 40.82] },
    ],
  },
  {
    fips: "19",
    abbr: "IA",
    name: "Iowa",
    coords: [-93.5, 42.0],
    zoomLevel: 5,
    locations: [
      { name: "Polk County Pickleball", city: "Des Moines", nonprofit: false, coords: [-93.6, 41.59] },
    ],
  },
  {
    fips: "40",
    abbr: "OK",
    name: "Oklahoma",
    coords: [-97.5, 35.5],
    zoomLevel: 5,
    locations: [
      { name: "Premier Pickleball Academy", city: "Oklahoma City", nonprofit: false, coords: [-97.49, 35.41] },
    ],
  },
  {
    fips: "26",
    abbr: "MI",
    name: "Michigan",
    coords: [-84.8, 44.3],
    zoomLevel: 4,
    locations: [
      { name: "Northville Pickleball Club", city: "Northville", nonprofit: false, coords: [-83.48, 42.43] },
      { name: "Wall Lake", city: "Delton", nonprofit: false, coords: [-85.42, 42.49] },
    ],
  },
  {
    fips: "17",
    abbr: "IL",
    name: "Illinois",
    coords: [-89.2, 40.0],
    zoomLevel: 4,
    locations: [
      { name: "Quad City Tennis Club", city: "Moline", nonprofit: false, coords: [-90.48, 41.49] },
      { name: "Brick House Pickleball", city: "Lake Forest", nonprofit: false, coords: [-87.84, 42.26] },
      { name: "Pickled! Wheaton", city: "Wheaton", nonprofit: false, coords: [-88.11, 41.88] },
      { name: "Pickled! Frankfort", city: "Frankfort", nonprofit: false, coords: [-87.85, 41.51] },
      { name: "Pickled! Woodridge", city: "Woodridge", nonprofit: false, coords: [-88.00, 41.73] },
      { name: "Pickled! Batavia", city: "Batavia", nonprofit: false, coords: [-88.34, 41.86] },
      { name: "Pickled! GameChangers", city: "Channahon", nonprofit: false, coords: [-88.23, 41.43] },
    ],
  },
];

export const GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const TOTAL_BINS = LOCATION_DATA.reduce(
  (sum, state) => sum + state.locations.length,
  0
);
