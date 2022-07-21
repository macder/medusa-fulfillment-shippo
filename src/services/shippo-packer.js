import { BP3D } from "binpackingjs"
import { BaseService } from "medusa-interfaces"
import { productLineItem } from "../utils/formatters"

class ShippoPackerService extends BaseService {
  bins_ = []
  items_ = []

  constructor({ shippoClientService }, options) {
    super()

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService
  }

  /**
   * Packs line items into parcel templates defined in shippo account
   * @param {array.<LineItem>} lineItems - array of LineItems, eg. cart.items
   * @return {array.<object>} - array of packed bins, including its items 3D locus
   */
  async packBins(lineItems) {
    const { Packer } = BP3D

    const parcelTemplates = await this.shippo_.fetchUserParcelTemplates()

    this.#setBins(parcelTemplates)
    this.#setItems(lineItems)
    const fitBins = []

    this.bins_.forEach((bin) => {
      const packer = new Packer()
      packer.addBin(bin)

      this.items_.forEach((item) => {
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
        (item) =>
          this.#reduceFactor(item.width) *
          this.#reduceFactor(item.height) *
          this.#reduceFactor(item.depth)
      )

      const totalItemVolume = binItemsVolume.reduce((a, b) => a + b, 0)
      const volumeVacant = bin.name.volume - totalItemVolume
      const items = bin.items.map((item) => {
        return {
          title: item.name.title,
          product_id: item.name.product_id,
          variant_id: item.name.variant_id,
          length: this.#reduceFactor(item.depth),
          width: this.#reduceFactor(item.width),
          height: this.#reduceFactor(item.height),
          weight: this.#reduceFactor(item.weight),
          volume: this.#calculateVolume(item),
          locus: {
            allowed_rotation: item.allowedRotation,
            rotation_type: item.rotationType,
            position: item.position.map((e) => this.#reduceFactor(e)),
          },
        }
      })

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

  #setBins(parcelTemplates) {
    const { Bin } = BP3D

    this.bins_ = parcelTemplates
      .map(({ object_owner, object_created, object_updated, ...bin }) => ({
        ...bin,
        volume: this.#calculateVolume(bin),
      }))
      .sort((a, b) => a.volume - b.volume)
      .map(
        (bin) =>
          new Bin({ ...bin }, bin.width, bin.height, bin.length, bin.weight)
      )
  }

  #setItems(lineItems) {
    const { Item } = BP3D
    this.items_ = lineItems
      .flatMap((item) =>
        item.quantity > 1 ? this.#splitItem(item) : productLineItem(item)
      )
      .map(
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
  }

  #calculateVolume({ length, depth, width, height }) {
    return length
      ? length * width * height
      : this.#reduceFactor(depth) *
          this.#reduceFactor(width) *
          this.#reduceFactor(height)
  }

  #reduceFactor(num) {
    return num / 100000
  }

  #splitItem(item) {
    return [...Array(item.quantity).keys()].map(() => productLineItem(item))
  }
}

export default ShippoPackerService
