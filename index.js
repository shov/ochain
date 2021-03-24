'use strict'

/**
 * Proxy functional accessor to wrapped object
 */
class ProxyAccessor extends Function {
  /**
   * @param {*} value
   * @param {{isValidBranch: null|function}} options
   * @returns {ProxyAccessor}
   */
  constructor(value, options = {isValidBranch: null}) {
    super()
    this._value = value
    this._isValidBranch = options.isValidBranch

    if ('function' !== typeof this._isValidBranch) {
      this._isValidBranch = isObject
    }

    /**
     * Proxy handler
     * - if the accessor is called, "apply" function traps it and returns with the value
     * - if a prop of the accessor is tried to be got, "get" function traps it and
     *   depending on existing of called prop and it's type return new ProxyAccessor with
     *   a value from the prop (if it's object) or undefined
     */
    const handler = {
      get: (target, prop, receiver) => {
        if (this._isValidBranch(this._value) && prop in this._value) {
          return new ProxyAccessor(this._value[prop])
        }

        return new ProxyAccessor(undefined)
      },

      apply: (target, thisArg, args) => target._call()
    }

    /**
     * Returns the proxy of this accessor with the handler
     */
    return new Proxy(this, handler)
  }

  /**
   * Returns the wrapped value
   * @returns {*}
   * @private
   */
  _call() {
    return this._value
  }
}

/**
 * Built-in check if a value can be a branch
 * @param value
 * @return {boolean}
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

module.exports = ProxyAccessor
