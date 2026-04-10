import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@crohna.app" },
    update: {},
    create: {
      email: "demo@crohna.app",
      name: "Demo User",
      preferences: {
        theme: "dark",
        privacy: { showMap: true, showTimeline: true },
      },
    },
  });

  console.log(`Created user: ${user.email}`);

  // Seed sample life events
  const events = [
    {
      title: "Started University",
      date: new Date("2020-09-01"),
      location: "Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589,
      description: "First day at university — new city, new friends, new chapter.",
      category: "education",
    },
    {
      title: "First Apartment",
      date: new Date("2021-06-15"),
      location: "Cambridge, MA",
      latitude: 42.3736,
      longitude: -71.1097,
      description: "Moved into my first apartment with roommates.",
      category: "home",
    },
    {
      title: "Summer Road Trip",
      date: new Date("2021-07-20"),
      endDate: new Date("2021-08-05"),
      location: "Acadia National Park, ME",
      latitude: 44.3386,
      longitude: -68.2733,
      description: "Two-week road trip up the coast. Hiked Cadillac Mountain at sunrise.",
      category: "travel",
    },
    {
      title: "Graduation Day",
      date: new Date("2024-05-18"),
      location: "Boston, MA",
      latitude: 42.3505,
      longitude: -71.1054,
      description: "Four years of hard work. Family flew in for the ceremony.",
      category: "milestone",
    },
    {
      title: "Started First Job",
      date: new Date("2024-07-01"),
      location: "New York, NY",
      latitude: 40.7128,
      longitude: -74.006,
      description: "Software engineer at a startup in Manhattan.",
      category: "career",
    },
    {
      title: "Marathon Finish",
      date: new Date("2024-11-03"),
      location: "New York, NY",
      latitude: 40.7712,
      longitude: -73.9743,
      description: "Finished my first marathon in Central Park. 4:12:33.",
      category: "health",
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: {
        userId_sourceId: {
          userId: user.id,
          sourceId: `seed-${event.title.toLowerCase().replace(/\s+/g, "-")}`,
        },
      },
      update: {},
      create: {
        userId: user.id,
        source: "manual",
        sourceId: `seed-${event.title.toLowerCase().replace(/\s+/g, "-")}`,
        ...event,
      },
    });
  }

  console.log(`Seeded ${events.length} events`);

  // Seed an AI story
  await prisma.aIStory.upsert({
    where: { id: "seed-story-2024" },
    update: {},
    create: {
      id: "seed-story-2024",
      userId: user.id,
      title: "A Year of New Beginnings",
      period: "2024",
      year: 2024,
      summary:
        "2024 was defined by major life transitions — graduating from university, " +
        "starting a career in New York, and pushing physical limits with a first marathon. " +
        "Each milestone built on years of preparation and marked the start of something new.",
      highlights: [
        "Graduated from university after four years",
        "Moved to New York for first software engineering role",
        "Completed first marathon in 4:12:33",
      ],
    },
  });

  console.log("Seeded AI story");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
