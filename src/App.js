import React from "react";
import "./App.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      testCase: "",
      orderNo: 0,
      rebateRank: 0,
      quantity: 0,
      basePrice: 0,
      credits: 0,
      promoCode: 0,
      totalAP: 0,
    };
  }

  onChangeInput = (e) => {
    const { name, value } = e.target;
    const updateStateObj = {
      [name]: value,
    };

    if (name !== "testCase")
      updateStateObj[name] = parseInt(updateStateObj[name]);

    this.setState(updateStateObj);
  };

  calculateTotalPrice = () => {
    const { basePrice, quantity } = this.state;
    return basePrice * quantity;
  };

  calculateAPRatio = () => {
    const { totalAP } = this.state;
    return totalAP / this.calculateTotalPrice();
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
    const { totalAP } = this.state;
    return totalAP - this.calculateEffectiveAP();
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Asort Rebate AP & INR Calculator v0.1.0</h2>
          <h3>Customer. Single SKU. Included Tax in Promo-code.</h3>
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
            />

            <label>Order No.</label>
            <input
              placeholder="Order No."
              type="number"
              tabIndex="2"
              name="orderNo"
              required
              onChange={this.onChangeInput}
            />

            <label>Rebate Rank</label>
            <select
              name="rebateRank"
              id="pet-select"
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
              <legend>Some SKU</legend>
              <label>Quantity</label>
              <input
                placeholder="Quantity"
                type="number"
                tabIndex="4"
                required
                name="quantity"
                onChange={this.onChangeInput}
              />

              <label>Base Price</label>
              <input
                placeholder="Base Price"
                type="number"
                tabIndex="5"
                required
                name="basePrice"
                onChange={this.onChangeInput}
              />
            </fieldset>

            <label>Total AP</label>
            <input
              placeholder="Total AP"
              type="number"
              tabIndex="6"
              required
              name="totalAP"
              onChange={this.onChangeInput}
            />

            <label>Credits</label>
            <input
              placeholder="Credits"
              type="number"
              tabIndex="7"
              required
              name="credits"
              onChange={this.onChangeInput}
            />

            <label>Promo Code</label>
            <input
              placeholder="Promo Code"
              type="number"
              tabIndex="8"
              required
              name="promoCode"
              onChange={this.onChangeInput}
            />
          </div>

          <div id="contact">
            <label>Total Price</label>
            <input
              disabled
              type="number"
              value={this.calculateTotalPrice()}
              name="totalPrice"
            />

            <label>AP Ratio</label>
            <input
              disabled
              type="number"
              value={this.calculateAPRatio()}
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
              value={this.calculateTotalAPToBeConsidered()}
              name="totalAPToBeConsidered"
            />

            <label>Rebate AP</label>
            <input
              disabled
              type="number"
              value={this.calculateRebateAP()}
              name="rebateAP"
            />

            <label>Rebate INR</label>
            <input
              disabled
              type="number"
              value={this.calculateRebateINR()}
              name="rebateINR"
            />
          </div>
        </div>
      </div>
    );
  }
}
