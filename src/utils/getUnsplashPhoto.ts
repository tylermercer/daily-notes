import { generateCacheKey, getCache } from "lib/cache/BufferCache";
import type { Full } from "unsplash-js/dist/methods/photos/types";
import unsplash from "./unsplash";

const cache = getCache('unsplash', './.cache/')

export default async function getUnsplashPhoto(id: string): Promise<Full> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const resultAsBuffer = await cache.getOrCreate(await generateCacheKey({ id }), async () => {
        const result = await unsplash.photos
            .get({ photoId: id })
            .then((result) => {
                if (result.errors) {
                    throw new Error(result.errors.join(", "));
                } else {
                    return result.response;
                }
            });
        const asArray = encoder.encode(JSON.stringify(result));
        return Buffer.from(asArray.buffer);
    });

    return JSON.parse(decoder.decode(resultAsBuffer));
}