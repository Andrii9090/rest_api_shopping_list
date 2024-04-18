import path from "path";

export default {
    production: true,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    baseUrl: 'https://liston.ovh/api',
    imagePath: path.resolve(process.cwd(), 'uploads', 'images'),
}

 