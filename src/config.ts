import path from "path";

export default {
    production: true,
    port: process.env['PORT'] ? Number(process.env['PORT']) : 3000,
    baseUrl: 'https://liston.ovh/api',
    imagePath: process.env.IMAGE_PATH || path.resolve(process.cwd(), 'uploads', 'images'),
}

 