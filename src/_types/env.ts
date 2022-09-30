declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: string
        PORT: string
        MONGODB_URI: string
        APP_SECRET: string
        GOOGLE_AUTH_API_KEY: string
        APP_NAME: string
    }
}


