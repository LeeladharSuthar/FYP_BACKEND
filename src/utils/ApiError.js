class ApiError extends Error {
    public statusCode: number
    public data: string | null
    public successss: boolean
    public errors: string[]
    public message: string
    constructor(message = "Internal Server Error", statusCode = 500, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.successss = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}



export { ApiError }