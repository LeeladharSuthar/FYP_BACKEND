class ApiError extends Error{
    
    constructor(message = "Internal Server Error", statusCode = 500, errors = [], stack = "") {
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
    }
}

export { ApiError }