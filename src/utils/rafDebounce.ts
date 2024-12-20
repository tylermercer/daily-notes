export const rafDebounce = (fn: (...params: any[]) => void) => {
    let frame: number;
    return (...params: any[]) => {
        if (frame) {
            cancelAnimationFrame(frame);
        }
        frame = requestAnimationFrame(() => {
            fn(...params);
        });
    };
};