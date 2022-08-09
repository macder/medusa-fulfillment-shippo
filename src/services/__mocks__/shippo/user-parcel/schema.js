export const userParcelSchema = (props) =>
  Object.freeze({
    object_id: props?.id ?? "upt_93",
    name: props?.name ?? "Small cube box",
    length: props?.length ?? "18",
    width: props?.width ?? "18",
    height: props?.height ?? "15",
    distance_unit: props?.distance_unit ?? "cm",
    weight: props?.weight ?? null,
  })
