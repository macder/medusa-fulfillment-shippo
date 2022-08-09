import { BP3D } from "@macder/binpackingjs"
import { BaseService } from "medusa-interfaces"

class ShippoPackerService extends BaseService {
  #bins = []

  #items = []

  constructor({}) {
    super()
  }

  /**
   *
   * @param {}
   * @return {array.<object>}
   */
  async packBins(bins, items) {
    const { Packer } = BP3D

    this.#setBins(bins)
    this.#setItems(items)

    const fitBins = []

    this.#bins.forEach((bin) => {
      const packer = new Packer()
      packer.addBin(bin)

      this.#items.forEach((item) => {
        packer.addItem(item)
      })

      packer.pack()

      if (packer.items.length === 0 && packer.unfitItems.length === 0) {
        fitBins.push(packer.bins[0])
      }
    })
    return this.#result(fitBins)
  }

  /**
   * @param  {} fitBins
   */
  #result(fitBins) {
    return fitBins.map((bin) => {
      const binItemsVolume = bin.items.map(
        (item) => item.width * item.height * item.depth
      )

      const totalItemVolume = binItemsVolume.reduce((a, b) => a + b, 0)
      const volumeVacant = bin.name.volume - totalItemVolume
      const items = bin.items.map((item) => ({
        title: item.name.title,
        product_id: item.name.product_id,
        variant_id: item.name.variant_id,
        length: item.depth,
        width: item.width,
        height: item.height,
        weight: item.weight,
        volume: this.constructor.calculateVolume(item),
        locus: {
          allowed_rotation: item.allowedRotation,
          rotation_type: item.rotationType,
          position: item.position.map((e) => e),
        },
      }))

      return {
        ...bin.name,
        object_owner: null,
        packer_output: {
          volume: {
            bin: bin.name.volume,
            items: totalItemVolume,
            vacant: volumeVacant,
          },
          items: [...items],
        },
      }
    })
  }

  #setBins(bins) {
    const { Bin } = BP3D

    this.#bins = bins
      .map((bin) => ({
        ...bin,
        volume: this.constructor.calculateVolume(bin),
      }))
      .sort((a, b) => a.volume - b.volume)
      .map(
        (bin) =>
          new Bin({ ...bin }, bin.width, bin.height, bin.length, bin.weight)
      )
    return this.#bins
  }

  #setItems(items) {
    const { Item } = BP3D

    this.#items = items.map(
      (item) =>
        new Item(
          {
            title: item.product_title,
            product_id: item.product_id,
            variant_id: item.variant_id,
          },
          item.width,
          item.height,
          item.length,
          item.weight
        )
    )
    return this.#items
  }

  static calculateVolume({ length, depth, width, height }) {
    return length ? length * width * height : depth * width * height
  }
}

export default ShippoPackerService
