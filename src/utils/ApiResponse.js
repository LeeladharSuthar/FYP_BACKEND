class ApiResponse {
    public statusCode: number
    public data: {}
    public success: boolean
    public message: string
    constructor(statusCode = 200, data = {}, success = true, message = "") {
        this.statusCode = statusCode
        this.data = data
        this.success = success
        this.message = message
    }
}

export { ApiResponse }