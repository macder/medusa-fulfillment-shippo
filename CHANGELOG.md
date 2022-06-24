# Change Log

All notable changes to this project will be documented in this file.
## [0.8.1] (2022-06-23)
Fixed
- Config loading fail [#69](https://github.com/macder/medusa-fulfillment-shippo/issues/69)
## [0.8.0] (2022-06-23)
Added
- Exposed shippo client for direct use [#62](https://github.com/macder/medusa-fulfillment-shippo/issues/62)
- Exposed public methods for all features [#64](https://github.com/macder/medusa-fulfillment-shippo/issues/64)
- Public methods documented in README [#66](https://github.com/macder/medusa-fulfillment-shippo/issues/66)
- Parcel template ID included in live rate response [#67](https://github.com/macder/medusa-fulfillment-shippo/issues/67)

Changed
- Verifies if CSO is shippo before modifying [#63](https://github.com/macder/medusa-fulfillment-shippo/issues/63)
## [0.7.0] (2022-06-23)
Changed
- Refactored fetching methods into a class [#56](https://github.com/macder/medusa-fulfillment-shippo/issues/56)
- New public methods (expect more changes) [#58](https://github.com/macder/medusa-fulfillment-shippo/issues/58)

Fixed
- Line item prices in shippo orders [#57](https://github.com/macder/medusa-fulfillment-shippo/issues/57)
## [0.6.0] (2022-06-21)
Changed
- **BREAKING**: API endpoint URI's [#50](https://github.com/macder/medusa-fulfillment-shippo/issues/50)
- Housekeeping [#51](https://github.com/macder/medusa-fulfillment-shippo/issues/51)

Added
- Parcel template name from bin packing to shippo order [#53](https://github.com/macder/medusa-fulfillment-shippo/issues/53)

## [0.5.2] (2022-06-21)
Fixed
- Documentation mistake - wrong field name in Getting Started readme
## [0.5.1] (2022-06-21)
Bug Fixes
- Shippo orders created on new fulfillment now have status "PAID" [#23](https://github.com/macder/medusa-fulfillment-shippo/issues/23)
## [0.5.0] (2022-06-20)
Added
- Implemented a FFD bin packing algorithm for rates at checkout [#44](https://github.com/macder/medusa-fulfillment-shippo/issues/44)
## [0.4.0] (2022-06-18)
Added
- Price totals to shippo order [#26](https://github.com/macder/medusa-fulfillment-shippo/issues/26)
- Product codes to shippo order line items [#41](https://github.com/macder/medusa-fulfillment-shippo/issues/41)

Bug Fixes
- Shipping address validation error message [#37](https://github.com/macder/medusa-fulfillment-shippo/issues/37)
- Shipping address state/province validation [#38](https://github.com/macder/medusa-fulfillment-shippo/issues/38)

## [0.3.1] (2022-06-17)
Fixes
- Critical bug [#34](https://github.com/macder/medusa-fulfillment-shippo/issues/34)
## [0.3.0] (2022-06-16)
Added
- Endpoint to retrieve shippo packing slip [#27](https://github.com/macder/medusa-fulfillment-shippo/issues/27)

Changed
- Endpoint errors return sane json [#32](https://github.com/macder/medusa-fulfillment-shippo/issues/32)
## [0.2.0] (2022-06-15)
Added
- Endpoint to retrieve shippo orders [#20](https://github.com/macder/medusa-fulfillment-shippo/issues/20)
- cors to api endpoints [#22](https://github.com/macder/medusa-fulfillment-shippo/issues/22)

Changed
- **BREAKING**: API endpoint URI's [#21](https://github.com/macder/medusa-fulfillment-shippo/issues/21)

Bug Fixes:
- Correct order number in new Shippo orders [#24](https://github.com/macder/medusa-fulfillment-shippo/issues/24)


## [0.1.2] (2022-06-15)
### Added
- Fulfillment ID to Shippo order
- Shippo order ID to fulfillment

### Bug Fixes
- Currency type user paid with added to shippo order
## [0.1.1] (2022-06-14)
### Bug Fixes
- Fixes [#10](https://github.com/macder/medusa-fulfillment-shippo/issues/10)
### Documentation
- Resolves [#11](https://github.com/macder/medusa-fulfillment-shippo/issues/11)

## [0.1.0] (2022-06-14)
