# Change Log

All notable changes to this project will be documented in this file.

## \[0.14.0] (2022-07-11)

Added

*   Support for returns [#115](https://github.com/macder/medusa-fulfillment-shippo/issues/115), [#151](https://github.com/macder/medusa-fulfillment-shippo/issues/151)
*   Support for exchanges [#116](https://github.com/macder/medusa-fulfillment-shippo/issues/116), [#151](https://github.com/macder/medusa-fulfillment-shippo/issues/151)
*   Support for claims [#117](https://github.com/macder/medusa-fulfillment-shippo/issues/117), [#151](https://github.com/macder/medusa-fulfillment-shippo/issues/151)

## \[0.13.0] (2022-07-10)

Added

*   Emit event after creating shippo order [#156](https://github.com/macder/medusa-fulfillment-shippo/issues/156)
*   New method to fetch default sender address from shippo [#157](https://github.com/macder/medusa-fulfillment-shippo/issues/157)

## \[0.12.2] (2022-07-08)

Fixed

*   Proper fix for shipping option conditions [#149](https://github.com/macder/medusa-fulfillment-shippo/issues/149)

## \[0.12.1] (2022-07-08)

Fixed

*   Shipping options fail to load when discount code applied to cart [#146](https://github.com/macder/medusa-fulfillment-shippo/issues/146)

## \[0.12.0] (2022-07-07)

Added

*   Bin packing support for all shipping option types [#125](https://github.com/macder/medusa-fulfillment-shippo/issues/125)

*   Raw live-rate object that determined rate at checkout added to fulfillment data [#144](https://github.com/macder/medusa-fulfillment-shippo/issues/144)

Changed

*   **BREAKING** - New implementation for rates at checkout [#137](https://github.com/macder/medusa-fulfillment-shippo/issues/137)
*   **BREAKING** - Bin packing data is no longer saved [#141](https://github.com/macder/medusa-fulfillment-shippo/issues/141)
*   **BREAKING** - Parcel template data used for rate moved from order metadata to fulfillment data

Fixed

*   Rates at checkout not respecting discounts [#105](https://github.com/macder/medusa-fulfillment-shippo/issues/105)

*   Rates at checkout not respecting shipping option conditions [#139](https://github.com/macder/medusa-fulfillment-shippo/issues/139)

## \[0.11.0] (2022-07-05)

Added

*   Webhook support for transaction\_created event [#132](https://github.com/macder/medusa-fulfillment-shippo/issues/132)

Changed

*   Parcel template name moved to notes in shippo order [#131](https://github.com/macder/medusa-fulfillment-shippo/issues/131)

## \[0.10.4] (2022-07-02)

Fixed

*   Prevent live-rate option from being added to cart before requesting rates [#124](https://github.com/macder/medusa-fulfillment-shippo/issues/124)
*   Fulfillment with item of 0 quantity creates shippo order [#128](https://github.com/macder/medusa-fulfillment-shippo/issues/128)

## \[0.10.3] (2022-07-01)

Fixed

*   Major bug - updating rates removes carts shipping options that are not live-rates [#121](https://github.com/macder/medusa-fulfillment-shippo/issues/121)

## \[0.10.2] (2022-07-01)

Removed test coverage data from npm package [#111](https://github.com/macder/medusa-fulfillment-shippo/issues/111)

## \[0.10.1] (2022-06-30)

Fixed

*   Edge case where fallback amount for live-rate fails [#109](https://github.com/macder/medusa-fulfillment-shippo/issues/109)

## \[0.10.0] (2022-06-30)

Added

*   New endpoint to retrieve bin packing result data [#102](https://github.com/macder/medusa-fulfillment-shippo/issues/102)

Changed

*   **BREAKING** Moved bin packing result data [#101](https://github.com/macder/medusa-fulfillment-shippo/issues/101)

## \[0.9.0] (2022-06-29)

Added

*   Bin packing result data added to cart/order metadata [#96](https://github.com/macder/medusa-fulfillment-shippo/issues/96)

Fixed

*   Empty json reponse under certain conditions when updating live-rates for shipping options [#99](https://github.com/macder/medusa-fulfillment-shippo/issues/99)

## \[0.8.7] (2022-06-28)

Fixed

*   Bin packer async issue [#90](https://github.com/macder/medusa-fulfillment-shippo/issues/90)

## \[0.8.6] (2022-06-27)

Misc code improvements from testing

## \[0.8.5] (2022-06-25)

Fixed

*   Documentation inaccuracy

## \[0.8.4] (2022-06-25)

Fixed

*   Error messages in API responses [#80](https://github.com/macder/medusa-fulfillment-shippo/issues/80)

## \[0.8.3] (2022-06-24)

Fixed

*   Flattened nested json response from both admin routes [#72](https://github.com/macder/medusa-fulfillment-shippo/issues/72)
*   Cancel fulfillment [#75](https://github.com/macder/medusa-fulfillment-shippo/issues/75), [#76](https://github.com/macder/medusa-fulfillment-shippo/issues/76)
*   Performance issue [#77](https://github.com/macder/medusa-fulfillment-shippo/issues/77)

## \[0.8.1] (2022-06-23)

Fixed

*   Config loading fail [#69](https://github.com/macder/medusa-fulfillment-shippo/issues/69)

## \[0.8.0] (2022-06-23)

Added

*   Exposed shippo client for direct use [#62](https://github.com/macder/medusa-fulfillment-shippo/issues/62)
*   Exposed public methods for all features [#64](https://github.com/macder/medusa-fulfillment-shippo/issues/64)
*   Public methods documented in README [#66](https://github.com/macder/medusa-fulfillment-shippo/issues/66)
*   Parcel template ID included in live rate response [#67](https://github.com/macder/medusa-fulfillment-shippo/issues/67)

Changed

*   Verifies if CSO is shippo before modifying [#63](https://github.com/macder/medusa-fulfillment-shippo/issues/63)

## \[0.7.0] (2022-06-23)

Changed

*   Refactored fetching methods into a class [#56](https://github.com/macder/medusa-fulfillment-shippo/issues/56)
*   New public methods (expect more changes) [#58](https://github.com/macder/medusa-fulfillment-shippo/issues/58)

Fixed

*   Line item prices in shippo orders [#57](https://github.com/macder/medusa-fulfillment-shippo/issues/57)

## \[0.6.0] (2022-06-21)

Changed

*   **BREAKING**: API endpoint URI's [#50](https://github.com/macder/medusa-fulfillment-shippo/issues/50)
*   Housekeeping [#51](https://github.com/macder/medusa-fulfillment-shippo/issues/51)

Added

*   Parcel template name from bin packing to shippo order [#53](https://github.com/macder/medusa-fulfillment-shippo/issues/53)

## \[0.5.2] (2022-06-21)

Fixed

*   Documentation mistake - wrong field name in Getting Started readme

## \[0.5.1] (2022-06-21)

Bug Fixes

*   Shippo orders created on new fulfillment now have status "PAID" [#23](https://github.com/macder/medusa-fulfillment-shippo/issues/23)

## \[0.5.0] (2022-06-20)

Added

*   Implemented a FFD bin packing algorithm for rates at checkout [#44](https://github.com/macder/medusa-fulfillment-shippo/issues/44)

## \[0.4.0] (2022-06-18)

Added

*   Price totals to shippo order [#26](https://github.com/macder/medusa-fulfillment-shippo/issues/26)
*   Product codes to shippo order line items [#41](https://github.com/macder/medusa-fulfillment-shippo/issues/41)

Bug Fixes

*   Shipping address validation error message [#37](https://github.com/macder/medusa-fulfillment-shippo/issues/37)
*   Shipping address state/province validation [#38](https://github.com/macder/medusa-fulfillment-shippo/issues/38)

## \[0.3.1] (2022-06-17)

Fixes

*   Critical bug [#34](https://github.com/macder/medusa-fulfillment-shippo/issues/34)

## \[0.3.0] (2022-06-16)

Added

*   Endpoint to retrieve shippo packing slip [#27](https://github.com/macder/medusa-fulfillment-shippo/issues/27)

Changed

*   Endpoint errors return sane json [#32](https://github.com/macder/medusa-fulfillment-shippo/issues/32)

## \[0.2.0] (2022-06-15)

Added

*   Endpoint to retrieve shippo orders [#20](https://github.com/macder/medusa-fulfillment-shippo/issues/20)
*   cors to api endpoints [#22](https://github.com/macder/medusa-fulfillment-shippo/issues/22)

Changed

*   **BREAKING**: API endpoint URI's [#21](https://github.com/macder/medusa-fulfillment-shippo/issues/21)

Bug Fixes:

*   Correct order number in new Shippo orders [#24](https://github.com/macder/medusa-fulfillment-shippo/issues/24)

## \[0.1.2] (2022-06-15)

### Added

*   Fulfillment ID to Shippo order
*   Shippo order ID to fulfillment

### Bug Fixes

*   Currency type user paid with added to shippo order

## \[0.1.1] (2022-06-14)

### Bug Fixes

*   Fixes [#10](https://github.com/macder/medusa-fulfillment-shippo/issues/10)

### Documentation

*   Resolves [#11](https://github.com/macder/medusa-fulfillment-shippo/issues/11)

## \[0.1.0] (2022-06-14)
