const { ipcRenderer } = require("electron")
const Store = require("electron-store")
const fetch = require("node-fetch")

const store = new Store()
module.exports.store = store

async function createSession(email, password) {
    const credentials = new Buffer(`${email}:${password}`).toString("base64")
    const auth = await fetch(`${KEYGEN_REQUEST_BASEURL}/tokens`, {
      headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Basic ${credentials}` }),
      method: "POST"
    })
  
    // Get the newly created authentication token
    const { data, errors } = await auth.json()
    if (errors) {
      return { errors }
    }
  
    const { id, attributes: { token, expiry } } = data
  
    // Store session
    store.set("session", JSON.stringify({ id, token, expiry }))
  
    // Get the current user
    const profile = await fetch(`${KEYGEN_REQUEST_BASEURL}/profile`, {
      headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Bearer ${token}` }),
      method: "GET"
    })
    const { data: user } = await profile.json()
    store.set("currentUser", JSON.stringify(user))
  
    return { id, token, expiry }
  }