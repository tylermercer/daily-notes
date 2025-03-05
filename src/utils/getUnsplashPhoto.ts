import {getFileSystemStringCache } from "lib/cache/StringCache";
import type { Full } from "unsplash-js/dist/methods/photos/types";
import unsplash from "./unsplash";
import { generateCacheKey } from "lib/cache/generateCacheKey";

const cache = getFileSystemStringCache('unsplash', './.cache/')

export default async function getUnsplashPhoto(unsplashUrl: string): Promise<Full> {
    const id =  unsplashUrl.slice(-11);
    return JSON.parse(await cache.getOrCreate(await generateCacheKey({ id }), async () => {
        const result = await unsplash.photos
            .get({ photoId: id })
            .then((result) => {
                if (result.errors) {
                    throw new Error(result.errors.join(", "));
                } else {
                    return result.response;
                }
            });
        return JSON.stringify(result);
    }));
}
