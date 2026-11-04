export class BookingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "BookingError";
    this.status = status;
  }
}
