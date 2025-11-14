import unsplashIds from "../assets/unsplash-ids.json";

const idsByYear: Map<string, string[]> = new Map([
    // Use a fixed order for 2025 to ensure consistency
    ['2025', unsplashIds],
]);

const millisecondsPerDay = 1000 * 60 * 60 * 24;

export function getUnsplashIdForDate(date: Date): string {
    const year = date.getFullYear().toString();

    const beginningOfYear = new Date(`${year}-01-01T00:00:00Z`).getTime();

    const ids = idsByYear.get(year);
    if (ids) {
        console.log("Using existing IDs for year:", year);
        const index = Math.floor((date.getTime() - beginningOfYear) / millisecondsPerDay) % ids.length;
        console.log("Assigned ID for date", date.toISOString().split('T')[0], " at index", index, ":", ids[index]);
        return ids[index];
    }
    else {
        // Shuffle the IDs for this year and store them for the rest of the build
        console.log("Shuffling IDs for year:", year);
        const shuffledIds = [...unsplashIds];
        for (let i = shuffledIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        idsByYear.set(year, shuffledIds);
        const index = Math.floor((date.getTime() - beginningOfYear) / millisecondsPerDay) % shuffledIds.length;
        const id = shuffledIds[index];
        console.log("Assigned ID for date", date.toISOString().split('T')[0], " at index", index, ":", id);
        return shuffledIds[date.getTime() / 86400000 % shuffledIds.length];
    }
}