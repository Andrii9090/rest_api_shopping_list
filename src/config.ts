import { config } from "dotenv";
import path from "path";
config()

export default {
    production: true,
    port: process.env['PORT'] ? Number(process.env['PORT']) : 3000, 
    baseUrl: process.env.BASE_URL || 'https://liston.ovh/api',
    imagePath: process.env.IMAGE_PATH || path.resolve(process.cwd(), 'uploads', 'images'),
}

 