import React from "react";
import "./App.css";
import packageJSON from "../package.json";
import AddSKU from "./AddSKU";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    const INITIAL_STATE = {
      sku: "",
      quantity: 0,
      basePrice: 0,
      baseAP: 0,
    };

    this.state = {
      testCase: "",
      orderNo: 0,
      rebateRank: 0,
      skuType: "single",
      skuDetailList: [INITIAL_STATE],
      credits: 0,
      typeOfPromoCode: "",
      promoCode: 0,
    };
  }

  onChangeInput = (e) => {
    const { name, value } = e.target;
    const updateStateObj = {
      [name]: value,
    };

    if (!["testCase", "typeOfPromoCode", "skuType", "skuDetailList"].includes(name))
      updateStateObj[name] = parseFloat(updateStateObj[name]);

    this.setState(updateStateObj);
  };

  calculateTotalPrice = () => {
    const { skuType, skuDetailList } = this.state;
    if (skuType === "single") {
      const { basePrice, quantity } = skuDetailList[0];
      return basePrice * quantity || 0;
    }

    let totalPrice = 0;
    skuDetailList.map((skuDetail) => {
      const { basePrice, quantity } = skuDetail;
      totalPrice += basePrice * quantity;

      return true;
    });
    return totalPrice || 0;
  };

  calculateTotalAP = () => {
    const { skuType, skuDetailList } = this.state;
    if (skuType === "single") {
      const { baseAP, quantity } = skuDetailList[0];
      return baseAP * quantity || 0;
    }

    let totalAP = 0;
    skuDetailList.map((skuDetail) => {
      const { baseAP, quantity } = skuDetail;
      totalAP += baseAP * quantity;

      return true;
    });
    return totalAP || 0;
  };

  calculateAPRatio = () => {
    return this.calculateTotalAP() / this.calculateTotalPrice();
  };

  calculateTotalPriceToBeConsidered = () => {
    const { promoCode, credits } = this.state;
    return this.calculateTotalPrice() - (promoCode + credits);
  };

  calculateEffectiveAP = () => {
    const { promoCode, credits } = this.state;
    return this.calculateAPRatio() * (promoCode + credits);
  };

  calculateTotalAPToBeConsidered = () => {
    return this.calculateTotalAP() - this.calculateEffectiveAP();
  };

  percentDiscountByRank = () => {
    const { rebateRank } = this.state;

    switch (rebateRank) {
      case 1:
        return 0.16;
      case 2:
        return 0.32;
      case 3:
        return 0.46;
      case 4:
        return 0.6;
      case 5:
        return 0.63;
      case 6:
        return 0.65;
      case 7:
        return 0.66;
      default:
        return 0;
    }
  };

  calculateRebateAP = () => {
    return this.calculateTotalAPToBeConsidered() * this.percentDiscountByRank();
  };

  calculateRebateINR = () => {
    return this.calculateRebateAP() / 2;
  };

  onChangeSKUInput = (e) => {
    const {
      name,
      value,
      dataset: { index },
    } = e.target;

    this.setState((state) => {
      const { skuDetailList } = state;

      skuDetailList[index][name] = value === "sku" ? value : parseFloat(value);

      return {
        skuDetailList,
      };
    });
  };

  addSKUField = () => {
    const INITIAL_STATE = {
      sku: "",
      quantity: 0,
      basePrice: 0,
      baseAP: 0,
    };

    this.setState((state) => {
      const { skuDetailList } = state;
      skuDetailList.push(INITIAL_STATE);

      return {
        skuDetailList,
      };
    });
  };

  render() {
    const {
      testCase,
      orderNo,
      credits,
      promoCode,
      typeOfPromoCode,
      skuType,
      skuDetailList,
    } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h2>
            Rebate AP & INR Calculator <span>{"v" + packageJSON.version}</span>
          </h2>
          <h3>Customer/Distributor. Multi SKU. Included Tax in Promo-code.</h3>
        </header>
        <div className="container">
          <div id="contact">
            <label>Test Case</label>
            <input
              placeholder="Test Case:"
              type="text"
              tabIndex="1"
              required
              autoFocus
              name="testCase"
              onChange={this.onChangeInput}
              value={testCase}
            />

            <label>Order No.</label>
            <input
              placeholder="Order No."
              type="number"
              tabIndex="2"
              name="orderNo"
              required
              onChange={this.onChangeInput}
              value={orderNo}
            />

            <label>Rebate Rank</label>
            <select
              name="rebateRank"
              id="rank-select"
              tabIndex="3"
              required
              onChange={this.onChangeInput}
            >
              <option value={0}>--Please choose an option--</option>
              <option value={1}>Ambassador</option>
              <option value={2}>Promoter</option>
              <option value={3}>Maven</option>
              <option value={4}>Influencer</option>
              <option value={5}>ACE</option>
              <option value={6}>ABO</option>
              <option value={7}>Veteran ABO</option>
            </select>

            <fieldset>
              <legend>
                <select
                  name="skuType"
                  id="skuType-select"
                  tabIndex="3"
                  required
                  onChange={this.onChangeInput}
                >
                  <option value={"single"}>Single SKU</option>
                  <option value={"multi"}>Multi SKU</option>
                </select>
              </legend>
              {skuType === "multi" ? (
                skuDetailList.map((skuDetail, idx) => {
                  const { sku, quantity, basePrice, baseAP } = skuDetail;

                  return (
                    <AddSKU
                      skuType={skuType}
                      sku={sku}
                      quantity={quantity}
                      basePrice={basePrice}
                      baseAP={baseAP}
                      index={idx}
                      key={"skuDetail-" + idx}
                      onChangeSKUInput={this.onChangeSKUInput}
                    />
                  );
                })
              ) : (
                <AddSKU
                  skuType={skuType}
                  sku={skuDetailList[0].sku}
                  quantity={skuDetailList[0].quantity}
                  basePrice={skuDetailList[0].basePrice}
                  baseAP={skuDetailList[0].baseAP}
                  index={0}
                  onChangeSKUInput={this.onChangeSKUInput}
                />
              )}
              {skuType === "multi" && (
                <button
                  name="addSKUField"
                  type="button"
                  onClick={this.addSKUField}
                >
                  ADD
                </button>
              )}
            </fieldset>

            <label>Credits</label>
            <input
              placeholder="Credits"
              type="number"
              tabIndex="7"
              required
              name="credits"
              onChange={this.onChangeInput}
              value={credits}
              min={0}
            />

            <fieldset>
              <legend>Promo Code Details</legend>

              <div className="radio-button-group">
                <label>Included Tax</label>
                <input
                  type="radio"
                  value="includedTax"
                  name="typeOfPromoCode"
                  checked={typeOfPromoCode === "includedTax"}
                  tabIndex="8"
                  onChange={this.onChangeInput}
                />

                {/* <label>Excluded Tax</label>
                <input
                  type="radio"
                  value="excludedTax"
                  name="typeOfPromoCode"
                  tabIndex="9"
                  checked={typeOfPromoCode === "excludedTax"}
                  onChange={this.onChangeInput}
                /> */}
              </div>

              <label>Promo Code</label>
              <input
                placeholder="Promo Code"
                type="number"
                tabIndex="10"
                required
                name="promoCode"
                onChange={this.onChangeInput}
                value={promoCode}
                disabled={typeOfPromoCode === ""}
                min={0}
              />
            </fieldset>
          </div>

          <div id="contact">
            <label>Total Price</label>
            <input
              disabled
              type="number"
              value={this.calculateTotalPrice()}
              name="totalPrice"
            />

            <label>Total AP</label>
            <input
              disabled
              type="number"
              value={this.calculateTotalAP()}
              name="totalPrice"
            />

            <label>AP Ratio</label>
            <input
              disabled
              type="number"
              value={this.calculateAPRatio() || Infinity}
              name="apRatio"
            />

            <label>Total Price to be Considered</label>
            <input
              disabled
              type="number"
              value={this.calculateTotalPriceToBeConsidered()}
              name="totalPriceToBeConsidered"
            />

            <label>Total AP to be Considered</label>
            <input
              disabled
              type="number"
              value={this.calculateTotalAPToBeConsidered() || Infinity}
              name="totalAPToBeConsidered"
            />

            <label>Rebate AP</label>
            <input
              disabled
              type="number"
              value={this.calculateRebateAP() || Infinity}
              name="rebateAP"
            />

            <label>Rebate INR</label>
            <input
              disabled
              type="number"
              value={this.calculateRebateINR() || Infinity}
              name="rebateINR"
            />
          </div>
        </div>
      </div>
    );
  }
}
