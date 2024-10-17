import { Router } from "express"
import { registerUser, loginUser, logoutUser, getCurrentUser, updatePassword, resetPassword, deleteProfile } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(upload.single("avatar"), registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/profile").get(verifyJWT, getCurrentUser)
router.route("/profile").delete(verifyJWT, deleteProfile)

router.route("/updatePassword").post(verifyJWT, updatePassword)
router.route("/resetPassword").post(verifyJWT, resetPassword)

export default router