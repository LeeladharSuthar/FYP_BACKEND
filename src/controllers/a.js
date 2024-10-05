import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const newUser = asyncHandler(async (req, res, next) => {

    return res.status(200).json(new ApiResponse(200, {}, true, `Welcome ${user.name}`))
})


export { newUser };

