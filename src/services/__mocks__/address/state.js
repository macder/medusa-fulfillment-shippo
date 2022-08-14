export const addressState = (key) =>
  ({
    empty: {
      is_empty: true,
    },
    complete: {
      is_empty: false,
    },
  }[key])
