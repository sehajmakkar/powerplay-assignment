const { v4: uuidv4 } = require("uuid");
const { Event, Reservation } = require("../models");

const EVENT_ID = "node-meetup-2025";
const MAX_RETRIES = 3;

/**
 * Reserve seats with optimistic concurrency control (OCC)
 * POST /reservations
 */
const reserveSeats = async (req, res) => {
  try {
    const { partnerId, seats } = req.body;

    // Validation
    if (
      !partnerId ||
      typeof partnerId !== "string" ||
      partnerId.trim() === ""
    ) {
      return res.status(400).json({ error: "partnerId is required" });
    }

    if (seats === undefined || seats === null) {
      return res.status(400).json({ error: "seats is required" });
    }

    if (!Number.isInteger(seats)) {
      return res.status(400).json({ error: "seats must be an integer" });
    }

    if (seats <= 0 || seats > 10) {
      return res.status(400).json({ error: "seats must be between 1 and 10" });
    }

    // Retry Logic
    let retries = 0;
    let reserved = false;
    let reservation = null;

    while (retries < MAX_RETRIES && !reserved) {
      const event = await Event.findOne({ eventId: EVENT_ID });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.availableSeats < seats) {
        return res.status(409).json({ error: "Not enough seats left" });
      }

      // Version Check -> OCC
      const updatedEvent = await Event.findOneAndUpdate(
        {
          eventId: EVENT_ID,
          availableSeats: { $gte: seats },
          version: event.version,
        },
        {
          $inc: {
            availableSeats: -seats,
            version: 1,
          },
        },
        { new: true }
      );

      if (updatedEvent) {
        reservation = await Reservation.create({
          reservationId: uuidv4(),
          eventId: EVENT_ID,
          partnerId: partnerId.trim(),
          seats,
          status: "confirmed",
        });
        reserved = true;
      } else {
        // retry
        retries++;
      }
    }

    if (!reserved) {
      return res.status(409).json({ error: "Not enough seats left" });
    }

    return res.status(201).json({
      reservationId: reservation.reservationId,
      seats: reservation.seats,
      status: reservation.status,
    });
  } catch (error) {
    console.error("Error reserving seats:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Cancel a reservation and return seats to the pool
 * DELETE /reservations/:reservationId
 */
const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({ reservationId });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      return res.status(404).json({ error: "Reservation already cancelled" });
    }

    // Return seats
    let retries = 0;
    let updated = false;

    while (retries < MAX_RETRIES && !updated) {
      const event = await Event.findOne({ eventId: reservation.eventId });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const updatedEvent = await Event.findOneAndUpdate(
        {
          eventId: reservation.eventId,
          version: event.version,
        },
        {
          $inc: {
            availableSeats: reservation.seats,
            version: 1,
          },
        },
        { new: true }
      );

      if (updatedEvent) {
        updated = true;
      } else {
        retries++;
      }
    }

    if (!updated) {
      return res.status(500).json({ error: "Failed to cancel reservation" });
    }

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(204).send();
  } catch (error) {
    console.error("Error cancelling reservation:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get event summary with reservation count
 * GET /reservations
 */
const getEventSummary = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: EVENT_ID });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const reservationCount = await Reservation.countDocuments({
      eventId: EVENT_ID,
      status: "confirmed",
    });

    return res.status(200).json({
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount,
      version: event.version,
    });
  } catch (error) {
    console.error("Error getting event summary:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  reserveSeats,
  cancelReservation,
  getEventSummary,
};
