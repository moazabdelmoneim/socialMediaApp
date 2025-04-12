import path from "node:path"
import * as cloudinary from 'cloudinary';
import * as dotenv from 'dotenv'
dotenv.config({path:path.resolve('./src/config/.env.dev')})
// Configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    secure: true,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary.v2

