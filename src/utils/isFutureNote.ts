import { type CollectionEntry } from "astro:content";
import getNoteDate from "./getNoteDate";

const now = new Date();

export default function isFutureNote(entry: CollectionEntry<'notes'>): boolean {
    return getNoteDate(entry) > now;
}
