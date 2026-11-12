import { ZodError } from 'zod';

/**
 * Higher-order middleware to validate incoming requests with a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} source - Request property to validate (default: 'body')
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.') || source,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed. Please correct the highlighted errors.',
          errors: formattedErrors,
        });
      }

      return next(error);
    }
  };
}

export default validate;
