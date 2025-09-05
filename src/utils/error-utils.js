/**
 * Error message mapping for common HTTP status codes
 */
const HTTP_ERROR_MESSAGES = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'You are not authorized. Please log in and try again.',
    403: 'Access denied. You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timeout. Please try again.',
    409: 'Conflict. The resource already exists or has been modified.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Internal server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.',
};

/**
 * Default error messages for different error types
 */
const DEFAULT_MESSAGES = {
    network: 'Network error. Please check your connection and try again.',
    unknown: 'Something went wrong. Please try again.',
    validation: 'Invalid input. Please check your data and try again.',
    timeout: 'Request timed out. Please try again.',
};

/**
 * Extracts error message from various error object types
 * @param {Error|Object|string} error - The error object or message
 * @param {Object} options - Configuration options
 * @param {boolean} options.logError - Whether to log the error for debugging (default: false)
 * @param {string} options.defaultMessage - Custom default message
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error, options = {}) => {
    const { logError = false, defaultMessage } = options;

    // Handle null/undefined input
    if (!error) {
        return defaultMessage || DEFAULT_MESSAGES.unknown;
    }

    // Log error for debugging if enabled
    if (logError) {
        console.error('Error details:', error);
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    // Handle Error instances
    if (error instanceof Error) {
        return error.message || defaultMessage || DEFAULT_MESSAGES.unknown;
    }

    // Handle axios/HTTP errors
    if (error.response) {
        const { status, data } = error.response;

        // Try to get message from response data
        const responseMessage = data?.message || data?.error || data?.detail;

        // Use status-specific message or response message
        const statusMessage = HTTP_ERROR_MESSAGES[status];
        const finalMessage = responseMessage || statusMessage;

        if (finalMessage) {
            return finalMessage;
        }

        // Fallback for unknown status codes
        return `Error ${status}: ${responseMessage || DEFAULT_MESSAGES.unknown}`;
    }

    // Handle network errors (no response received)
    if (error.request) {
        // Check for timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return DEFAULT_MESSAGES.timeout;
        }
        return DEFAULT_MESSAGES.network;
    }

    // Handle validation errors
    if (error.name === 'ValidationError' || error.type === 'validation') {
        return error.message || DEFAULT_MESSAGES.validation;
    }

    // Handle other error objects
    if (typeof error === 'object') {
        return error.message || error.error || error.detail || defaultMessage || DEFAULT_MESSAGES.unknown;
    }

    // Fallback
    return defaultMessage || DEFAULT_MESSAGES.unknown;
};

/**
 * Enhanced error handler that provides more context
 * @param {Error|Object|string} error - The error object or message
 * @param {Object} options - Configuration options
 * @param {boolean} options.logError - Whether to log the error for debugging
 * @param {string} options.context - Additional context for the error
 * @returns {Object} Error information object
 */
export const getErrorInfo = (error, options = {}) => {
    const { logError = false, context } = options;

    const message = getErrorMessage(error, { logError, defaultMessage: options.defaultMessage });

    const errorInfo = {
        message,
        timestamp: new Date().toISOString(),
        context: context || 'Unknown',
    };

    // Add additional error details for debugging
    if (logError && error) {
        errorInfo.originalError = error;
        errorInfo.errorType = error.constructor.name;

        if (error.response) {
            errorInfo.status = error.response.status;
            errorInfo.statusText = error.response.statusText;
            errorInfo.url = error.response.config?.url;
        }
    }

    return errorInfo;
};

/**
 * Creates a standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export const createError = (message, code = 'UNKNOWN_ERROR', details = {}) => ({
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
});

/**
 * Checks if an error is a network error
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
    if (!error) return false;

    return (
        error.request ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('fetch')
    );
};

/**
 * Checks if an error is a timeout error
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if it's a timeout error
 */
export const isTimeoutError = (error) => {
    if (!error) return false;

    return (
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Timeout')
    );
};