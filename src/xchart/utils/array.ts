export const chunkify =  <T = any>(arr: T[], sliceSize: number = 2): [Array<T>] => {
  const result: [T[]] = [[]];
  
  for (let i = 0; i < arr.length; i+=sliceSize) {
    const slice = [...arr].splice(i, sliceSize);
    result.push(slice);
  }

  return result;
}

export const stepForEach = <T = any>(arr: T[], sliceSize: number, fun: (it: Array<T>) => void) => {
  for (let i = 0; i < arr.length; i+= sliceSize) {
    const slice = [...arr].splice(i, sliceSize);
    fun(slice);
  }
}
