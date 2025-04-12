import path from "node:path";
import fs from "node:fs";
import multer from "multer";

export const fileValidationTypes = {
    image: ['image/jpg', 'image/jpeg', 'image/png']
};

export const uploadDiskFile = (customPath = "general", fileValidation = []) => {
    const basePath = `uploads/${customPath}`;
    const fullPath = path.resolve(`./src/${basePath}`);

    // Ensure the upload directory exists
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({ 
        destination: (req, file, cb) => {
            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            file.finalPath = `${basePath}/${uniqueSuffix}-${file.originalname}`;
            console.log(file.finalPath);

            cb(null, `${uniqueSuffix}-${file.originalname}`);
        }
    });

    function fileFilter(req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error("Invalid file format"), false);
    }

    return multer({ storage, fileFilter });
};
