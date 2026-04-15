export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  source?: string;
}

export interface AIStory {
  id: string;
  title: string;
  period: string;
  year?: number;
  summary: string;
  highlights: string[];
  stats?: Record<string, string | number>;
}

export const demoEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Graduated from College",
    date: "2024-05-18",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80",
    description: "Walked across the stage after four years of late nights, breakthroughs, and friendships that will last a lifetime.",
    category: "education",
    source: "manual",
  },
  {
    id: "2",
    title: "Road Trip to Big Sur",
    date: "2024-06-10",
    endDate: "2024-06-14",
    location: "Big Sur, CA",
    latitude: 36.2704,
    longitude: -121.8081,
    imageUrl: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80",
    description: "Drove Highway 1 with windows down and playlist on shuffle. McWay Falls at sunset was the highlight.",
    category: "travel",
    source: "photos",
  },
  {
    id: "3",
    title: "Started First Full-Time Job",
    date: "2024-07-15",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80",
    description: "First day at the office. Imposter syndrome lasted exactly until my first code review came back clean.",
    category: "career",
    source: "calendar",
  },
  {
    id: "4",
    title: "Ran First Half Marathon",
    date: "2024-10-12",
    location: "Portland, OR",
    latitude: 45.5152,
    longitude: -122.6784,
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
    description: "Crossed the finish line in 1:52. The crowd, the rain, the last hill — all of it worth every 5am training run.",
    category: "achievement",
    source: "manual",
  },
  {
    id: "5",
    title: "Friendsgiving in the Mountains",
    date: "2024-11-23",
    location: "Lake Tahoe, CA",
    latitude: 39.0968,
    longitude: -120.0324,
    imageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80",
    description: "Cabin with eight friends, too much food, and a fireplace that never went out. No phones, no plans, just presence.",
    category: "life",
    source: "photos",
  },
  {
    id: "6",
    title: "New Year in Tokyo",
    date: "2025-01-01",
    endDate: "2025-01-08",
    location: "Tokyo, Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    description: "Rang in the new year at Meiji Shrine with thousands of strangers who felt like neighbors for one night.",
    category: "travel",
    source: "photos",
  },
  {
    id: "7",
    title: "Promoted to Senior Engineer",
    date: "2025-03-15",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    description: "Nine months in and they handed me the keys to a new team. Terrifying. Thrilling. Time to build.",
    category: "career",
    source: "calendar",
  },
  {
    id: "8",
    title: "Adopted a Dog",
    date: "2025-04-20",
    location: "San Francisco, CA",
    latitude: 37.7694,
    longitude: -122.4862,
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    description: "Met Biscuit at the shelter and knew immediately. Our morning walks through Golden Gate Park are the best part of every day.",
    category: "life",
    source: "manual",
  },
  {
    id: "9",
    title: "Backpacking in Patagonia",
    date: "2025-06-01",
    endDate: "2025-06-08",
    location: "Torres del Paine, Chile",
    latitude: -50.9423,
    longitude: -73.4068,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    description: "Five days on the W Trek. Glaciers, guanacos, and the kind of silence you can only find at the edge of the world.",
    category: "travel",
    source: "photos",
  },
  {
    id: "10",
    title: "Shipped Major Product Launch",
    date: "2025-08-15",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    description: "Months of building, weeks of testing, and one unforgettable launch day. The metrics dashboard never looked so good.",
    category: "achievement",
    source: "calendar",
  },
  {
    id: "11",
    title: "Moved to New Apartment",
    date: "2025-10-01",
    location: "San Francisco, CA",
    latitude: 37.7849,
    longitude: -122.4094,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    description: "Top floor, north-facing windows, views of the bridge on clear mornings. Finally a place that feels like home.",
    category: "life",
    source: "manual",
  },
  {
    id: "12",
    title: "Rang in 2026 at Home",
    date: "2026-01-01",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80",
    description: "Quiet New Year this time. Cooked dinner, opened a good bottle, and looked back at two years that changed everything.",
    category: "life",
    source: "manual",
  },
  {
    id: "13",
    title: "Keynote at Tech Conference",
    date: "2026-02-20",
    location: "Austin, TX",
    latitude: 30.2672,
    longitude: -97.7431,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    description: "Spoke to 2,000 people about building resilient systems. Hands shaking at the start, standing ovation at the end.",
    category: "achievement",
    source: "calendar",
  },
  {
    id: "14",
    title: "Cherry Blossoms in Kyoto",
    date: "2026-03-28",
    endDate: "2026-04-03",
    location: "Kyoto, Japan",
    latitude: 35.0116,
    longitude: 135.7681,
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    description: "Timed it perfectly. The Philosopher's Path was a tunnel of pink. Sat under a tree for two hours doing absolutely nothing.",
    category: "travel",
    source: "photos",
  },
  {
    id: "15",
    title: "Started a Side Project",
    date: "2026-04-05",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    description: "An idea that kept me up at night finally made it into code. No users yet, but the prototype works and the vision is clear.",
    category: "career",
    source: "manual",
  },
  {
    id: "16",
    title: "Weekend in Yosemite",
    date: "2026-04-12",
    endDate: "2026-04-14",
    location: "Yosemite, CA",
    latitude: 37.8651,
    longitude: -119.5383,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Half Dome at sunrise. Mist Trail in the afternoon. Stars that reminded me why I moved to California.",
    category: "travel",
    source: "photos",
  },
];

export const demoYearSummaries: Record<string, string> = {
  "2026": "2026 was the year you stepped onto bigger stages — a keynote, a return to Japan, and a side project that refused to stay in your notebook. The momentum is unmistakable.",
  "2025": "2025 was the year of leveling up. A promotion, a product launch, Patagonia, Tokyo, and a shelter dog who changed your mornings forever.",
  "2024": "2024 was the year it all began — graduation, a cross-country road trip, your first real job, and the quiet realization that adulthood suits you just fine.",
};

export const demoStories: AIStory[] = [
  {
    id: "s1",
    title: "Your 2026",
    period: "2026",
    year: 2026,
    summary: "2026 started with quiet confidence and erupted into momentum. You gave your first keynote, returned to Japan for cherry blossom season, and started building something new. Four months in, and the year is already one for the books.",
    highlights: [
      "Delivered keynote at major tech conference",
      "Returned to Japan for cherry blossoms in Kyoto",
      "Started an ambitious side project",
      "Weekend adventures in Yosemite",
    ],
    stats: {
      "Events": 5,
      "Cities Visited": 4,
      "Photos Captured": 312,
      "Most Active Month": "March",
      "Primary Location": "San Francisco, CA",
    },
  },
  {
    id: "s2",
    title: "Your 2025",
    period: "2025",
    year: 2025,
    summary: "2025 was the year of leveling up. A promotion, a major product launch, and adventures that spanned hemispheres — from Tokyo shrines to Patagonian glaciers. You adopted Biscuit, found a new home, and settled into a life that finally feels like yours.",
    highlights: [
      "Promoted to Senior Engineer",
      "Shipped a major product to thousands of users",
      "Backpacked the W Trek in Patagonia",
      "Adopted Biscuit from the shelter",
      "Celebrated New Year in Tokyo",
    ],
    stats: {
      "Events": 6,
      "Cities Visited": 4,
      "Photos Captured": 847,
      "Most Active Month": "June",
      "Primary Location": "San Francisco, CA",
    },
  },
  {
    id: "s3",
    title: "Your Post-Grad Journey",
    period: "2024 — 2026",
    summary: "From cap and gown to keynote stage in under two years. You graduated, moved to San Francisco, earned a promotion, traveled three continents, and started building something of your own. These are the years you'll look back on as the ones that set the trajectory.",
    highlights: [
      "Graduated and started career in San Francisco",
      "Promoted within nine months",
      "Traveled to Japan, Chile, and across the American West",
      "Built and shipped products used by thousands",
      "Found home, community, and a dog named Biscuit",
    ],
    stats: {
      "Total Events": 16,
      "Cities Visited": 9,
      "Total Photos": 2184,
      "Countries": 3,
      "States Visited": 5,
    },
  },
];

export const insightStats = {
  totalEvents: 16,
  totalPhotos: 2184,
  citiesVisited: 9,
  mostActiveYear: 2025,
  mostVisitedCity: "San Francisco, CA",
  topCategory: "Travel",
  yearWithMostEvents: 2025,
  longestActiveRun: "16 events",
  categories: [
    { name: "Travel", count: 5, color: "rgba(255,255,255,0.8)" },
    { name: "Life", count: 4, color: "rgba(255,255,255,0.7)" },
    { name: "Career", count: 3, color: "rgba(255,255,255,0.6)" },
    { name: "Achievement", count: 3, color: "rgba(255,255,255,0.9)" },
    { name: "Education", count: 1, color: "rgba(255,255,255,0.5)" },
  ],
  yearlyEvents: [
    { year: 2024, count: 5 },
    { year: 2025, count: 6 },
    { year: 2026, count: 5 },
  ],
  cityVisits: [
    { city: "San Francisco, CA", count: 6 },
    { city: "Tokyo, Japan", count: 1 },
    { city: "Kyoto, Japan", count: 1 },
    { city: "Torres del Paine, Chile", count: 1 },
    { city: "Boulder, CO", count: 1 },
    { city: "Big Sur, CA", count: 1 },
    { city: "Portland, OR", count: 1 },
    { city: "Lake Tahoe, CA", count: 1 },
    { city: "Austin, TX", count: 1 },
    { city: "Yosemite, CA", count: 1 },
  ],
};

// Re-export from utils for backwards compatibility
export { getEventsByYear } from "@/lib/utils";
