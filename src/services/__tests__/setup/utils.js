export const propWorker = (obj) => () => {
  const props = { ...obj }
  return {
    set: (key, value) => propWorker({ ...props, [key]: value })(),
    get: (key) => props[key],
    push: (key, value) =>
      Array.isArray(props[key])
        ? propWorker({ ...obj, [key]: [...props[key], value] })()
        : propWorker(props)(),
    release: () => ({ ...props }),
  }
}
