import { BP3D } from "binpackingjs"
import { BaseService } from "medusa-interfaces"
import { productLineItem } from "../utils/formatters"

class ShippoPackerService extends BaseService {
  bins_ = []
  items_ = []

  constructor({}, options) {
    super()
  }

  /**
   * @param  {array} lineItems
   * @param  {array} parcelTemplates
   */
  async packBins(lineItems, parcelTemplates) {
    const { Packer } = BP3D

    this.setBins_(parcelTemplates)
    this.setItems_(lineItems)
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
    return this.result_(fitBins)
  }

  /**
   * @param  {} fitBins
   */
  result_(fitBins) {
    return fitBins.map((bin) => {
      const binItemsVolume = bin.items.map(
        (item) =>
          this.reduceFactor_(item.width) *
          this.reduceFactor_(item.height) *
          this.reduceFactor_(item.depth)
      )

      const totalItemVolume = binItemsVolume.reduce((a, b) => a + b, 0)
      const volumeVacant = bin.name.volume - totalItemVolume
      const items = bin.items.map((item) => {
        return {
          title: item.name.title,
          product_id: item.name.product_id,
          variant_id: item.name.variant_id,
          length: this.reduceFactor_(item.depth),
          width: this.reduceFactor_(item.width),
          height: this.reduceFactor_(item.height),
          weight: this.reduceFactor_(item.weight),
          volume: this.calculateVolume_(item),
          locus: {
            allowed_rotation: item.allowedRotation,
            rotation_type: item.rotationType,
            position: item.position.map((e) => this.reduceFactor_(e)),
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

  /**
   * @param  {array} parcelTemplates
   */
  setBins_(parcelTemplates) {
    const { Bin } = BP3D

    this.bins_ = parcelTemplates
      .map(({ object_owner, object_created, object_updated, ...bin }) => ({
        ...bin,
        volume: this.calculateVolume_(bin),
      }))
      .sort((a, b) => a.volume - b.volume)
      .map(
        (bin) =>
          new Bin({ ...bin }, bin.width, bin.height, bin.length, bin.weight)
      )
  }

  /**
   * @param  {array} lineItems
   */
  setItems_(lineItems) {
    const { Item } = BP3D
    this.items_ = lineItems
      .flatMap((item) =>
        item.quantity > 1 ? this.splitItem_(item) : productLineItem(item)
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

  calculateVolume_({ length, depth, width, height }) {
    return length
      ? length * width * height
      : this.reduceFactor_(depth) *
          this.reduceFactor_(width) *
          this.reduceFactor_(height)
  }

  reduceFactor_(num) {
    return num / 100000
  }

  splitItem_(item) {
    return [...Array(item.quantity).keys()].map(() => productLineItem(item))
  }
}

export default ShippoPackerService
