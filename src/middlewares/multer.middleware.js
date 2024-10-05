import multer from "multer"
import path from "path"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + Date.now() + ext);
    }
})

export const upload = multer({ storage: storage })