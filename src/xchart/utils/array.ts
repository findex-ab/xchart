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


export const uniqueBy = <T, KV = string>(arr: T[], key: string | ((item: T) => KV)): T[] => {
  const nextArr: T[] = []

  try {
    const getId = (item: T, k: string | ((item: T) => KV)): any => {
      return typeof k === 'string' ? item[k as keyof T] : k(item)
    }
    for (const item of arr) {
      const id = getId(item, key)
      const count = nextArr.filter((it) => getId(it, key) === id).length
      if (count > 0) continue
      nextArr.push(item)
    }
  } catch (e) {
    console.error('uniqueBy() failed.')
    console.error(e)
  }

  return nextArr
}

export const unique = <T>(arr: T[]): T[] => [...Array.from(new Set(arr))] as T[]

export const removeItemAtIndex = <T = any>(array: T[], index: number): T[] => {
  if (index > -1 && index < array.length) {
    array.splice(index, 1);
  }
  return array;
}

export const isAllSame = <T = any>(arr: T[]): boolean => {
  if (arr.length <= 0) return false;
  return arr.filter(it => it === arr[0]).length >= arr.length;
}
