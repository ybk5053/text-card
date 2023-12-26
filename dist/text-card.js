const LitElement =
  window.LitElement ||
  Object.getPrototypeOf(customElements.get("hui-masonry-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

export class TextCard extends LitElement {
  _hass;

  // internal reactive states
  static get properties() {
    return {
      _header: { state: true },
      _action: { state: true },
      _entries: { state: true },
    };
  }

  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    this._hass = hass;
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.action || !config.action.service) {
      throw new Error("Need to define service in action");
    }
    if (!config.entries) {
      throw new Error("Need to define entries");
    }
    this._header = config.header === "" ? nothing : config.header;
    this._action = config.action;
    this._entries = config.entries;
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      .rows {
        padding: 5px;
      }
      .right {
        float: right;
      }

      /* For input */
      .input-wrapper {
        position: relative;
        margin-top: 5px; // To create space for floating inputs
        margin-inline: auto;
      }
      
      .input {
        box-sizing: border-box;
        font-size: 1em;
        width: 100%;
        padding: 8px 0;
        padding-right: 30px; // To avoid overlapping with the clear button
        color: #333;
        border: none;
        border-bottom: 1px solid #ddd;
        transition: border-color 250ms;
        background-color: transparent;
      
        &:focus {
          outline: none;
          border-bottom-color: #777;
        }
      
        &::placeholder {
          color: transparent;
        }
        
        // Hide Safari's autofill button
        &::-webkit-contacts-auto-fill-button {
          visibility: hidden;
          pointer-events: none;
          position: absolute;
        }
      }
      
      .label {
        position: absolute;
        top: 8px;
        left: 0;
        pointer-events: none;
        transform-origin: left center;
        transition: transform 250ms;
        font-family: "Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052,
          serif;
      }
      
      .input:focus + .label,
      .input:not(:placeholder-shown) + .label {
        transform: translateY(-100%) scale(0.75);
      }
      
      .clear {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        position: absolute;
        bottom: 8px;
        right: 0; // To visually align with inputs right edge
        transform: translateY(-50%);
        background: none;
        border: none;
        border-radius: 50%;
        height: 2em;
        width: 2 em;
        transition: color 250ms;
        display: flex;
        align-items: center;
        justify-content: center;
      
        &:hover,
        &:focus {
          color: #333;
        }
      }
      
      .input:placeholder-shown + .label + .clear {
        display: none;
      }
    `;
  }

  render() {
    let items = [];
    for (const x of this._entries) {
        let name = x["name"];
        let icon = x["icon"] === "" ? undefined : x["icon"];
        let button = undefined;
        if (icon) {
            button = html`
                <button
                    class="clear"
                    aria-label="Clear input"
                    @click="${this._click}"
                    >
                    <ha-icon icon="${icon}"></ha-icon>
                </button>
                `;
        }
        items.push(html`
        <div class="input-wrapper">
            <ha-textarea></ha-textarea>
            <input
                autocomplete="off"
                class="input"
                type="text"
                id=${name}
                placeholder=${name}
            />
            <label class="label" for=${name}> ${name} </label>
                ${button}
            </div>
        `);
    }

    return html`
      <ha-card>
        <div class="card-header">${this._header}</div>
        <div class="card-content">
            ${items}
        </div>
      </ha-card>
    `;
  }

  _click() {
    let domain = this._action.service.split(".")[0];
    let serv = this._action.service.split(".")[1];
    let target = this._action.target ? this._action.target : {};
    let data = Object.assign({}, target, this._action.data);
    for (const x of this._entries) {
        let val = this.shadowRoot.getElementById(x["name"]).value;
        if (val) {
            let key = x["data_key"].split(".");
            let t = val;
            for (let i=key.length-1; i>=0; i--) {
                t = {[key[i]]: t};
                if (i===0) {
                    data = deepmerge(data, t);
                }
            }
        }
    }
    this._hass.callService(domain, serv, data);
  }
}

customElements.define("text-card", TextCard);

window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
  type: "text-card",
  name: "Text Input Card",
  preview: false,
  description: "Input Field with Button",
});
console.info("Text Input Card 0.1");

function deepmerge(t,s) {
    for (const [k, v] of Object.entries(s)) {
        if (t[k] && typeof t[k] === "object" && typeof v === "object") {
            t[k] = deepmerge(t[k], v);
        } else {
            t[k] = v;
        }
    }
    return t;
}
