import { AppError } from "../utils/app-error.js";

/**
 * Middleware for validating request data using Zod schemas
 * @param {Object} schema - Zod schema for validation
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body against schema
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into a more readable format
      const errorMessages = result.error.errors.map((error) => ({
        path: error.path.join("."),
        message: error.message,
      }));

      return next(new AppError("Validation error", 400, errorMessages));
    }

    // Replace req.body with validated data
    req.body = result.data;
    return next();
  } catch (error) {
    return next(new AppError("Validation error", 400, error));
  }
};
