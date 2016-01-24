const alt = require('../alt')
const actions = require('./settingsActions')
const storage = require('../storage')
const ipc = window.nativeRequire('electron').ipcRenderer

const SETTINGS_KEY = 'App_settings'

class SettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__settings__ = {}
    this.__onloadSettings__ = {}

    /* ****************************************/
    // Helpers
    /* ****************************************/

    /**
    * @param key: the key to fetch
    * @param def: the default value to return
    * @return the value from settings or the default value
    */
    this.__value__ = (key, def) => {
      return this.__settings__[key] === undefined ? def : this.__settings__[key]
    }

    /**
    * @param key: the key to fetch
    * @param def: the default value to return
    * @return the value from load setting or the default value
    */
    this.__onloadvalue__ = (key, def) => {
      return this.__onloadSettings__[key] === undefined ? def : this.__onloadSettings__[key]
    }

    /**
    * @param key: the key to check
    * @param def: the default value
    * @return true if the value is different to the onload value
    */
    this.__valuediff__ = (key, def) => {
      return this.__value__(key, def) !== this.__onloadvalue__(key, def)
    }

    /* ****************************************/
    // Proxy Server
    /* ****************************************/
    this.getProxyServer = () => {
      return this.__value__('proxyServer', { enabled: false })
    }
    this.proxyServerValid = () => {
      const proxy = this.getProxyServer()
      return proxy.enabled && proxy.host && proxy.port
    }

    /* ****************************************/
    // OS level settings
    /* ****************************************/

    this.showTitlebar = () => {
      return this.__value__('showTitlebar', false)
    }
    this.showTitlebarChanged = () => {
      return this.__valuediff__('showTitlebar', false)
    }
    this.showAppBadge = () => {
      return this.__value__('showAppBadge', true)
    }

    /* ****************************************/
    // Higher order
    /* ****************************************/

    /**
    * @return true if the app needs to be restarted to apply the settings
    */
    this.requiresRestart = () => {
      return this.showTitlebarChanged()
    }

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleSetProxyServer: actions.SET_PROXY_SERVER,
      handleSetShowTitlebar: actions.SET_SHOW_TITLEBAR,
      handleSetShowAppBadge: actions.SET_SHOW_APP_BADGE
    })
  }

  /* **************************************************************************/
  // Disk
  /* **************************************************************************/

  persist () {
    storage.set(SETTINGS_KEY, this.__settings__)
    ipc.send('settings-update', this.__settings__)
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/
  /**
  * Loads the storage from disk
  */
  handleLoad () {
    this.__settings__ = storage.get(SETTINGS_KEY, {})
    this.__onloadSettings__ = Object.freeze(storage.get(SETTINGS_KEY, {}))
  }

  /**
  * Sets the proxy server
  * @param host: the host or undefined
  * @param port: the port or undefined
  */
  handleSetProxyServer ({ host, port, enabled }) {
    if (!enabled) {
      delete this.__settings__.proxyServer
    } else {
      this.__settings__.proxyServer = { host: host, port: port, enabled: true }
    }
    this.persist()
  }

  handleSetShowTitlebar ({ show }) {
    this.__settings__.showTitlebar = show
    this.persist()
  }

  handleSetShowAppBadge ({ show }) {
    this.__settings__.showAppBadge = show
    this.persist()
  }
}

module.exports = alt.createStore(SettingsStore, 'SettingsStore')
