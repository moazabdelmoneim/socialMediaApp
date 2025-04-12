import multer from "multer";

export const uploadCloud = (fileValidation = []) => {
    const storage = multer.diskStorage({});

    function fileFilter(req, file, cb) {
        if (fileValidation.length > 0 && !fileValidation.includes(file.mimetype)) {
            return cb(new Error("Invalid file format", { cause: 400 }), false);
        }
        cb(null, true);
    }

    return multer({ storage, fileFilter });
};
