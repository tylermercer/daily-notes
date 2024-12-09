import { type CollectionEntry } from "astro:content";
import getNoteDate from "./getNoteDate";


export default function sortByDate(entries: CollectionEntry<'notes'>[]): CollectionEntry<'notes'>[] {
    return entries.sort(
        (a, b) => getNoteDate(b).getTime() - getNoteDate(a).getTime());
}
