export const chunkify = (arr, sliceSize = 2) => {
    const result = [[]];
    for (let i = 0; i < arr.length; i += sliceSize) {
        const slice = [...arr].splice(i, sliceSize);
        result.push(slice);
    }
    return result;
};
export const stepForEach = (arr, sliceSize, fun) => {
    for (let i = 0; i < arr.length; i += sliceSize) {
        const slice = [...arr].splice(i, sliceSize);
        fun(slice);
    }
};
