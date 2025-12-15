/// <reference types="vite/client" />
/// <reference types="vitest" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type { HydrogenEnv } from '@shopify/hydrogen';

declare global {
    interface Env extends HydrogenEnv {
        // Add your custom environment variables here
        MONGODB_DATA_API_URL: string;
        MONGODB_DATA_API_KEY: string;
        MONGODB_CLUSTER_NAME: string;
        MONGODB_DATABASE: string;
        ANALYTICS_ENABLED?: string;
    }
}
