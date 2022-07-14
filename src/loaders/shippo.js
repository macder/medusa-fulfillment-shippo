
export default async (container, options) => {
  

  const shippingProfileService = container.resolve("shippingProfileService")
  // const cartService = container.resolve("cartService")
  // console.log('*********shippingProfileService: ', shippingProfileService)

  shippingProfileService.addDecorator(async(obj) => {
    console.log('*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/')
    
    // console.log('*********cart: ', JSON.stringify(cart, null, 2))

    // obj.testing = "wowowowow"
    // const test = await obj(cart)

    //console.log('*********obj: ', obj)
    //console.log('*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/')

    // obj.fetchCartOptions = () => ({test: [{test: "test"}]})

    const fetchCartOptionsTest = async (obj) => {
      // return { test: "test" }
      //  const options = await obj.fetchCartOptions(cart)


      console.log('fetchCartOptionsTest*******************************************fetchCartOptionsTest')


      const options = async (cart) => {
        console.log('*********cart ', JSON.stringify(cart, null, 2))

        const shippingOptions = await shippingProfileService.fetchCartOptions(cart)
        console.log('*********shippingOptions ', JSON.stringify(shippingOptions, null, 2))

        return [{ test: "test" }, { test: "test" }]
      }
      obj.fetchCartOptions = async (cart) => options

      // obj.fetchCartOptions = async (cart) => {
      //   console.log('*********cart ', JSON.stringify(cart, null, 2))
      //   ///const test = obj.fetchCartOptions(cart)
      //   //console.log('*********test ', JSON.stringify(test, null, 2))
      //   return [{ test: "test" }, { test: "test" }]
      // }

      obj.test = "testing"

      return obj


    }

    const newObj = await fetchCartOptionsTest(obj)

    console.log(obj.test)
    console.log(newObj.test)

    return newObj



    // obj = () => ({test: "testtest"})

    // return obj
    // return {
    //   test: "testtest"
    // }
    // return fetchSomething().then(res => {
    //   obj.asyncStuff = res
    //   return obj
    // })
  })

}