// moj error handler generalni koji extendira ugrađeniu Express Error klasu
class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // ovo dodaje message prop iz ORIGINALNE Error klase... ona sadrzi message
    this.code = errorCode; // ovdje zaljepim MOJ dodatni prop ... u ovom slucaju error kod (npr 404)
  }
}

module.exports = HttpError;
