import { ZodError } from "zod";

export const notFound = (req, res, next) => {
    const err = new Error(`Not found: ${req.originalUrl}`);
    err.status = 404;
    next(err);
};

export const errorHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.errors
        });
    }

    const status = err.status || res.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Server error"
    });
};
