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
    title: "Started College",
    date: "2022-08-20",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    description: "Began my journey at the University of Colorado Boulder, studying Computer Science. The campus nestled against the Flatirons was breathtaking.",
    category: "education",
    source: "manual",
  },
  {
    id: "2",
    title: "First Hackathon",
    date: "2022-10-15",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    description: "Participated in HackCU and built a real-time collaboration tool. Our team won the 'Most Creative' award.",
    category: "achievement",
    source: "calendar",
  },
  {
    id: "3",
    title: "Winter Break in New York",
    date: "2022-12-18",
    endDate: "2023-01-02",
    location: "New York, NY",
    latitude: 40.7128,
    longitude: -74.006,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    description: "Spent the holidays exploring NYC for the first time. Times Square on New Year's Eve was unforgettable.",
    category: "travel",
    source: "photos",
  },
  {
    id: "4",
    title: "Moved to New Apartment",
    date: "2023-01-15",
    location: "Boulder, CO",
    latitude: 40.0189,
    longitude: -105.2747,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    description: "Found a cozy apartment on Pearl Street with two roommates. Finally had a proper desk setup for coding.",
    category: "life",
    source: "manual",
  },
  {
    id: "5",
    title: "Spring Break in Los Angeles",
    date: "2023-03-12",
    endDate: "2023-03-19",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    imageUrl: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    description: "Road trip to LA with friends. Venice Beach, Griffith Observatory, and amazing food everywhere.",
    category: "travel",
    source: "photos",
  },
  {
    id: "6",
    title: "Started First Internship",
    date: "2023-06-01",
    endDate: "2023-08-15",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80",
    description: "Software engineering internship at a startup in SOMA. Built features used by thousands of users daily.",
    category: "career",
    source: "calendar",
  },
  {
    id: "7",
    title: "Golden Gate Bridge Run",
    date: "2023-07-04",
    location: "San Francisco, CA",
    latitude: 37.8199,
    longitude: -122.4783,
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    description: "Ran across the Golden Gate Bridge on July 4th. The fog cleared just in time for the fireworks.",
    category: "life",
    source: "photos",
  },
  {
    id: "8",
    title: "Sophomore Year Begins",
    date: "2023-08-28",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80",
    description: "Back in Boulder for year two. Declared my major in CS and joined the research lab.",
    category: "education",
    source: "manual",
  },
  {
    id: "9",
    title: "Published First Research Paper",
    date: "2023-11-20",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    description: "Co-authored a paper on natural language processing that was accepted to a workshop at NeurIPS.",
    category: "achievement",
    source: "manual",
  },
  {
    id: "10",
    title: "Ski Trip to Vail",
    date: "2024-01-14",
    endDate: "2024-01-16",
    location: "Vail, CO",
    latitude: 39.6403,
    longitude: -106.3742,
    imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
    description: "First time skiing the back bowls. Perfect powder day on the second run.",
    category: "travel",
    source: "photos",
  },
  {
    id: "11",
    title: "Won Campus Pitch Competition",
    date: "2024-03-08",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    description: "Pitched a study tool and won first place. The $5,000 prize funded our prototype.",
    category: "achievement",
    source: "calendar",
  },
  {
    id: "12",
    title: "Summer Internship at Tech Giant",
    date: "2024-05-20",
    endDate: "2024-08-10",
    location: "Seattle, WA",
    latitude: 47.6062,
    longitude: -122.3321,
    imageUrl: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800&q=80",
    description: "Interned at a major tech company working on cloud infrastructure. Shipped a feature to production in week three.",
    category: "career",
    source: "calendar",
  },
  {
    id: "13",
    title: "Hiked Mount Rainier",
    date: "2024-07-20",
    location: "Mount Rainier, WA",
    latitude: 46.8523,
    longitude: -121.7603,
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    description: "Summited Camp Muir at 10,000 feet. The sunrise above the clouds was the most beautiful thing I've ever seen.",
    category: "travel",
    source: "photos",
  },
  {
    id: "14",
    title: "Conference in Denver",
    date: "2024-09-15",
    endDate: "2024-09-17",
    location: "Denver, CO",
    latitude: 39.7392,
    longitude: -104.9903,
    imageUrl: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800&q=80",
    description: "Attended a major tech conference. Gave my first lightning talk on technology in education.",
    category: "career",
    source: "calendar",
  },
  {
    id: "15",
    title: "Launched Side Project",
    date: "2024-11-01",
    location: "Boulder, CO",
    latitude: 40.015,
    longitude: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    description: "Shipped Chrono v1 — a life timeline app. Hit 500 users in the first week.",
    category: "achievement",
    source: "manual",
  },
  {
    id: "16",
    title: "Accepted Full-Time Offer",
    date: "2024-12-10",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    description: "Accepted a software engineer role starting after graduation. Dreams are becoming reality.",
    category: "career",
    source: "manual",
  },
];

export const demoStories: AIStory[] = [
  {
    id: "s1",
    title: "Your 2024",
    period: "2024",
    year: 2024,
    summary: "2024 was a year of breakthroughs. You completed your second internship at a major tech company in Seattle, summited Mount Rainier, launched your first product, and secured a full-time job offer. You traveled to four cities and captured over 600 photos. This was the year your ambitions became achievements.",
    highlights: [
      "Completed internship at a major tech company",
      "Launched Chrono and reached 500 users",
      "Accepted full-time software engineer offer",
      "Summited Camp Muir on Mount Rainier",
      "Gave first conference lightning talk",
    ],
    stats: {
      "Events": 7,
      "Cities Visited": 4,
      "Photos Captured": 623,
      "Most Active Month": "July",
      "Primary Location": "Boulder, CO",
    },
  },
  {
    id: "s2",
    title: "Your 2023",
    period: "2023",
    year: 2023,
    summary: "2023 was a year of firsts and foundations. You completed your first internship in San Francisco, published your first research paper, and explored both coasts. From running across the Golden Gate Bridge to late nights in the research lab, you pushed your boundaries in every direction.",
    highlights: [
      "First software engineering internship",
      "Published first research paper at NeurIPS workshop",
      "Explored San Francisco and Los Angeles",
      "Joined the research lab",
      "Found your apartment on Pearl Street",
    ],
    stats: {
      "Events": 6,
      "Cities Visited": 4,
      "Photos Captured": 487,
      "Most Active Month": "June",
      "Primary Location": "San Francisco, CA",
    },
  },
  {
    id: "s3",
    title: "Your College Years",
    period: "2022 — 2024",
    summary: "Between 2022 and 2024, you built the foundation for your career and your life. You completed two internships, published research, won competitions, traveled to seven cities, and grew from a nervous freshman into a confident engineer. These years shaped who you are becoming.",
    highlights: [
      "Completed two summer internships",
      "Published research and won pitch competitions",
      "Traveled across the country from coast to coast",
      "Built and launched your own product",
      "Secured a dream job before graduation",
    ],
    stats: {
      "Total Events": 16,
      "Cities Lived In": 3,
      "Total Photos": 1842,
      "Internships": 2,
      "States Visited": 6,
    },
  },
];

export const insightStats = {
  totalEvents: 16,
  totalPhotos: 1842,
  citiesVisited: 7,
  mostActiveYear: 2024,
  mostVisitedCity: "Boulder, CO",
  topCategory: "Travel",
  yearWithMostEvents: 2024,
  longestStreak: "14 days",
  categories: [
    { name: "Travel", count: 5, color: "#8A9098" },
    { name: "Career", count: 4, color: "#C7C2BA" },
    { name: "Achievement", count: 3, color: "#B8B3AB" },
    { name: "Education", count: 2, color: "#9A9590" },
    { name: "Life", count: 2, color: "#8A9A8A" },
  ],
  yearlyEvents: [
    { year: 2022, count: 3 },
    { year: 2023, count: 6 },
    { year: 2024, count: 7 },
  ],
  cityVisits: [
    { city: "Boulder, CO", count: 7 },
    { city: "San Francisco, CA", count: 3 },
    { city: "Denver, CO", count: 1 },
    { city: "Seattle, WA", count: 2 },
    { city: "New York, NY", count: 1 },
    { city: "Los Angeles, CA", count: 1 },
    { city: "Vail, CO", count: 1 },
  ],
};

export function getEventsByYear(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  const grouped: Record<string, TimelineEvent[]> = {};
  for (const event of events) {
    const year = new Date(event.date).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(event);
  }
  // Sort years descending
  const sorted: Record<string, TimelineEvent[]> = {};
  for (const year of Object.keys(grouped).sort((a, b) => Number(b) - Number(a))) {
    sorted[year] = grouped[year].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  return sorted;
}
