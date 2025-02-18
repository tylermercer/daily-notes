import unsplash from "./unsplash";

export default async function getUnsplashPhoto(id: string) {
    return await unsplash.photos
        .get({ photoId: id })
        .then((result) => {
            if (result.errors) {
                throw new Error(result.errors.join(", "));
            } else {
                return result.response;
            }
        });
}