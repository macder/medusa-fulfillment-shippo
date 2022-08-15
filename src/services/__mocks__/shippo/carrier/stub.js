import { carrierAccountSchema, carrierServiceLevelSchema } from "./schema"

export const carrierAccountStub = ({ ...state }) =>
  carrierAccountSchema({
    ...state,
    service_levels: state.service_levels.map((props) =>
      carrierServiceLevelSchema(props)
    ),
  })
