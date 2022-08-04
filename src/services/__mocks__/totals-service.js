import { lineItemTotalsTemplate } from "./templates"

export const totalsServiceMock = () => ({
  getLineItemTotals: jest.fn(async () => lineItemTotalsTemplate()),
})
