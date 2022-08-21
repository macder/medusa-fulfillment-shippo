export const subStringBefore = (char) => (str) =>
  str.substring(0, str.indexOf(char))

export const idType = subStringBefore("_")
