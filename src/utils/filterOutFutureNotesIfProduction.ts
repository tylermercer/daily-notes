import { type CollectionEntry } from "astro:content";
import isFutureNote from "./isFutureNote";

export default function filterOutFutureNotesIfProduction(entries: CollectionEntry<'notes'>[]): CollectionEntry<'notes'>[] {
    const isProduction = (import.meta.env.MODE === 'production');
    if (!isProduction) return entries;
    return entries.filter(
        (e: CollectionEntry<'notes'>) => !isFutureNote(e)
    );
}
