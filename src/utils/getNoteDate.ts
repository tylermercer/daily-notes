import { type CollectionEntry } from "astro:content";

export default function getNoteDate(entry: CollectionEntry<'notes'>) {
    return new Date(entry.id+'T12:00:00');
}
