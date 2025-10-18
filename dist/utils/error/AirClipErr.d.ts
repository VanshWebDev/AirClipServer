/**
 * Custom Error Class to handle application-specific errors.
 * Extends the built-in JavaScript `Error` class.
 */
export declare class AirClipErr extends Error {
    status: number;
    forFrontend: boolean;
    /**
     * Creates an instance of VarsnaErr.
     *
     * @param ErrObj - An object containing error details.
     * @param ErrObj.status - The HTTP status code representing the error type (e.g., 404 for Not Found).
     * @param ErrObj.message - The error message providing more details about the error.
     * @param ErrObj.forFrontend - True if you want to send error message to the frontend.
     */
    constructor(ErrObj: {
        status: number;
        message: string;
        forFrontend: boolean;
    });
}
//# sourceMappingURL=AirClipErr.d.ts.map