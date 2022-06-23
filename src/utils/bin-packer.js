import { BP3D } from "binpackingjs"
import { productLineItem } from "./formatters"

const splitItem = (item) => {
  const multiItem = []
  for (let i = 0; i < item.quantity; i++) {
    multiItem[i] = productLineItem(item)
  }
  return multiItem
}

// bin packing FFD
export const binPacker = async (lineItems, parcels) => {
  const { Item, Bin, Packer } = BP3D

  const items = lineItems
    .flatMap((item) => {
      if (item.quantity > 1) {
        return splitItem(item)
      }
      return productLineItem(item)
    })
    .map(
      (item) =>
        new Item(
          item.product_title,
          item.width,
          item.height,
          item.length,
          item.weight
        )
    )

  const bins = parcels
    .map((box) => {
      box.dim_weight = box.length * box.width * box.height
      return box
    })
    .sort((a, b) => a.dim_weight - b.dim_weight)
    .map(
      (box) =>
        new Bin(box.object_id, box.width, box.height, box.length, box.weight)
    )

  const fitParcels = []
  bins.forEach((bin, i) => {
    const packer = new Packer()
    packer.addBin(bin)

    items.forEach((item) => {
      packer.addItem(item)
    })

    packer.pack()

    if (packer.items.length === 0 && packer.unfitItems.length === 0) {
      fitParcels.push(packer.bins[0].name)
    }
  })

  return fitParcels
}
