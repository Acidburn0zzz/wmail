const React = require('react')
const { Toggle, TextField } = require('material-ui')
const { Row, ColXS } = require('../Flexbox')
const flux = {
  settings: require('../../stores/settings')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'AdvancedSettings',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.settings.S.listen(this.settingsChanged)
  },

  componentWillUnmount: function () {
    flux.settings.S.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState: function (store = flux.settings.S.getState()) {
    const proxyServer = store.getProxyServer()
    return {
      proxyEnabled: proxyServer.enabled,
      proxyHost: proxyServer.host || '',
      proxyPort: proxyServer.port || ''
    }
  },

  getInitialState: function () {
    return this.generateState()
  },

  settingsChanged: function (store) {
    this.setState(this.generateState(store))
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Enables / disables the proxy server
  */
  handleProxyToggle: function (evt, toggled) {
    flux.settings.A[toggled ? 'enableProxyServer' : 'disableProxyServer']()
  },

  handleProxyValueChanged: function (event) {
    flux.settings.A.enableProxyServer(
      this.refs.proxy_host.getValue(),
      this.refs.proxy_port.getValue()
    )
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div {...this.props}>
        <Toggle
          name='proxyEnabled'
          defaultToggled={this.state.proxyEnabled}
          label='Enable Proxy Server'
          onToggle={this.handleProxyToggle} />
        <Row>
          <ColXS size='6'>
            <TextField
              ref='proxy_host'
              hintText='192.168.1.1'
              floatingLabelText='Proxy Server Host'
              defaultValue={this.state.proxyHost}
              onChange={this.handleProxyValueChanged}
              disabled={!this.state.proxyEnabled} />
          </ColXS>
          <ColXS size='6'>
            <TextField
              ref='proxy_port'
              hintText='8080'
              floatingLabelText='Proxy Server Port'
              defaultValue={this.state.proxyPort}
              onChange={this.handleProxyValueChanged}
              disabled={!this.state.proxyEnabled} />
          </ColXS>
        </Row>
      </div>
    )
  }
})
