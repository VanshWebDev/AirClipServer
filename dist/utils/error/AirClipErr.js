/**
 * Custom Error Class to handle application-specific errors.
 * Extends the built-in JavaScript `Error` class.
 */
export class AirClipErr extends Error {
    status;
    forFrontend;
    /**
     * Creates an instance of VarsnaErr.
     *
     * @param ErrObj - An object containing error details.
     * @param ErrObj.status - The HTTP status code representing the error type (e.g., 404 for Not Found).
     * @param ErrObj.message - The error message providing more details about the error.
     * @param ErrObj.forFrontend - True if you want to send error message to the frontend.
     */
    constructor(ErrObj) {
        const { status, message, forFrontend } = ErrObj;
        super();
        this.status = status;
        this.message = message;
        this.forFrontend = forFrontend;
    }
}
//# sourceMappingURL=AirClipErr.js.map