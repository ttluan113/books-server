'use strict';

const statusCodes = require('./statusCodes');

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = statusCodes.CONFLICT, status = statusCodes.CONFLICT) {
        super(message, statusCodes.CONFLICT);
    }
}
class UnauthorizedError extends ErrorResponse {
    constructor(message = statusCodes.UNAUTHORIZED, status = statusCodes.UNAUTHORIZED) {
        super(message, statusCodes.UNAUTHORIZED);
    }
}

module.exports = {
    ErrorResponse,
    ConflictRequestError,
    UnauthorizedError,
};
