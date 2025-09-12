export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error'
        this.isOperational = true //custom error true else error not captured by middleware

        Error.captureStackTrace(this, this.constructor)
    }
}
