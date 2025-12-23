const { Event } = require("../models");

const seedEvent = {
  eventId: "node-meetup-2025",
  name: "Node.js Meet-up",
  totalSeats: 500,
  availableSeats: 500,
  version: 0,
};

const seedDatabase = async () => {
  try {
    // Check if event already exists
    const existingEvent = await Event.findOne({ eventId: seedEvent.eventId });

    if (existingEvent) {
      console.log(
        `Event "${seedEvent.eventId}" already exists. Skipping seed.`
      );
      return existingEvent;
    }

    // Create the event
    const event = await Event.create(seedEvent);
    console.log(`Database seeded with event: ${event.eventId}`);
    return event;
  } catch (error) {
    console.error("Error seeding database:", error.message);
    throw error;
  }
};

module.exports = seedDatabase;
