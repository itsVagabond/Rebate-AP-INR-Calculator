import React from "react";

export default class AddSKU extends React.Component {
  render() {
    const {
      skuType,
      sku,
      quantity,
      basePrice,
      baseAP,
      onChangeSKUInput,
      index,
    } = this.props;

    return (
      <div
        style={{
          border: "1px solid #000",
          marginBottom: "15px",
          padding: "0 10px 10px",
        }}
      >
        {skuType === "multi" && (
          <div>
            <label>SKU</label>
            <input
              placeholder="SKU"
              type="text"
              tabIndex="4"
              required
              name="sku"
              onChange={onChangeSKUInput}
              value={sku}
              data-index={index}
            />
          </div>
        )}

        <label>Quantity</label>
        <input
          placeholder="Quantity"
          type="number"
          tabIndex="4"
          required
          name="quantity"
          onChange={onChangeSKUInput}
          value={quantity}
          min={0}
          data-index={index}
        />

        <label>Base Price</label>
        <input
          placeholder="Base Price"
          type="number"
          tabIndex="5"
          required
          name="basePrice"
          onChange={onChangeSKUInput}
          value={basePrice}
          min={0}
          data-index={index}
        />

        <label>Base AP</label>
        <input
          placeholder="Base AP"
          type="number"
          tabIndex="6"
          required
          name="baseAP"
          onChange={onChangeSKUInput}
          value={baseAP}
          min={0}
          data-index={index}
        />
      </div>
    );
  }
}
