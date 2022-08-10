import { carrierAccountSchema, carrierServiceLevelSchema } from "./schema"

export const carrierAccountMock = ({ ...state }) =>
  carrierAccountSchema({
    ...state,
    service_levels: state.service_levels.map((props) =>
      carrierServiceLevelSchema(props)
    ),
  })
