const validateReservation = (req, res, next) => {
  const { partnerId, seats } = req.body;
  const errors = [];

  // Validate partnerId
  if (!partnerId) {
    errors.push("partnerId is required");
  } else if (typeof partnerId !== "string") {
    errors.push("partnerId must be a string");
  } else if (partnerId.trim() === "") {
    errors.push("partnerId cannot be empty");
  }

  // Validate seats
  if (seats === undefined || seats === null) {
    errors.push("seats is required");
  } else if (!Number.isInteger(seats)) {
    errors.push("seats must be an integer");
  } else if (seats <= 0) {
    errors.push("seats must be greater than 0");
  } else if (seats > 10) {
    errors.push("seats cannot exceed 10 per request");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: errors.length === 1 ? errors[0] : "Validation failed",
      details: errors.length > 1 ? errors : undefined,
    });
  }

  req.body.partnerId = partnerId.trim();

  next();
};

module.exports = validateReservation;
