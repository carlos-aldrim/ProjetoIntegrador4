import multer from "multer";
import path from "path";

export const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "uploads"),
    filename(req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${unique}-${file.originalname}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Arquivo não é uma imagem"));
    }
    cb(null, true);
  },
});
