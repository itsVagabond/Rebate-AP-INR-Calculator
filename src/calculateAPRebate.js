import _ from "lodash";

let purchase_cap = {
  '0': { limit: 4000, pct: 0.16 },
  '1': { limit: 24000, pct: 0.32 },
  '2': { limit: 0, pct: 0.46 },
  '3': { limit: 0, pct: 0.60 },
  '4': { limit: 0, pct: 0.63 },
  '5': { limit: 0, pct: 0.65 },
  '6': { limit: 0, pct: 0.66 },
};



export const calculateAPRebate = (LTBV, rank, order_items, used_credits, updateDiscount, promoDiscount) => {
  check(LTBV, Number);
  check(rank, Number);
  check(order_items, [Object]);
  check(used_credits, Number);

  let total_ap = 0;
  let considered_total_ap = 0;
  let rebate_pct = 0;
  let rebate = 0;
  let discount_updated = 0;
  let u_credits = used_credits || 0;
  let promo_discount = promoDiscount || 0;
  let sum_items_promo = 0;

  // item wise totalPrice, totalAP, APRatio
  order_items = _.map(order_items, (order_item) => {
    const item_total_base_price = order_item.basePrice * order_item.quantity;
    const item_total_ap = order_item.asort_points * order_item.quantity;
    const ap_ratio = item_total_ap / item_total_base_price;

    order_item.item_total_base_price = item_total_base_price;
    order_item.item_total_ap = item_total_ap;
    order_item.ap_ratio = ap_ratio;

    sum_items_promo += order_item.promocodeDiscount; // how to find promocodeDiscount per orderItem ??????

    return order_item;
  });

  // items ordered in descending order of ap_ratio
  order_items = _.orderBy(order_items, ['ap_ratio'], ['desc']);

  // 
  order_items = _.map(order_items, (order_item) => {
    let item_total_base_price = order_item.item_total_base_price;
    let item_total_ap = order_item.item_total_ap;
    let ap_ratio = order_item.ap_ratio;
    let item_rebate_pct = 0;
    let item_rebate = 0;
    let old_discount = order_item.discount || 0; // how to find this ?????

    order_item.considered_item_total_base_price = item_total_base_price;
    order_item.considered_item_total_ap = order_item.considered_item_total_base_price * order_item.ap_ratio; // totalAP is always equal to consideredAP ??????

    if (promo_discount > 0 && order_item.item_total_base_price > 0 && sum_items_promo > 0) {
      let tmp = promo_discount - order_item.considered_item_total_base_price; // in most cases consideredPrice > promocodeDiscount, then why its done ?????

      if (tmp <= 0) {
        order_item.considered_item_total_base_price -= promo_discount;
        order_item.promocodeDiscount = promo_discount;
        order_item.considered_item_total_ap = order_item.considered_item_total_ap - (promo_discount * order_item.ap_ratio);
        tmp = promo_discount;
      } else {
        let p = _.min([promo_discount, order_item.considered_item_total_base_price]); // consideredPrice is always minimum, then why its done ?????
        order_item.promocodeDiscount = p;
        order_item.considered_item_total_ap = order_item.considered_item_total_ap - (p * order_item.ap_ratio); // consideredAP is always 0 ?????
        order_item.considered_item_total_base_price -= p; // consideredPrice is always 0 ?????
        tmp = p;
      }

      promo_discount -= tmp; // promocodeDiscount is either 0 or promocode-consideredPrice, but never used again ?????
    } else {
      order_item.promocodeDiscount = 0;
    }

    order_item.amountAfterPromocodeDiscount = _.max([order_item.amountAfterMSD - order_item.promocodeDiscount, 0]);
    order_item.amountAfterRewards = order_item.amountAfterPromocodeDiscount - order_item.reward;
    order_item.taxableAmount = order_item.amountAfterRewards;


    item_total_base_price = order_item.considered_item_total_base_price;
    let considered_item_total_ap = order_item.considered_item_total_ap;
    if (rank >= 2) {
      item_rebate_pct = purchase_cap[rank].pct;
    } else {
      if (LTBV + item_total_base_price > purchase_cap[rank].limit) {
        let over_value = LTBV + item_total_base_price - purchase_cap[rank].limit;
        let first_value = item_total_base_price - over_value;
        if (LTBV > purchase_cap[rank].limit) first_value = 0;
        let second_value = item_total_base_price - first_value;
        let item_rebate =
          ap_ratio * first_value * purchase_cap[rank].pct +
          ap_ratio * second_value * purchase_cap[rank + 1].pct;
        item_rebate_pct = item_rebate / considered_item_total_ap;
      } else {
        if (item_total_base_price > 0)
          item_rebate_pct = purchase_cap[rank].pct;
        else
          item_rebate_pct = 0;
      }
    }
    item_rebate = considered_item_total_ap * item_rebate_pct;
    console.log("Got item rebate", item_rebate, considered_item_total_ap, item_rebate_pct);
    order_item.rebate = item_rebate;
    if (updateDiscount)
      order_item.discount = item_rebate / 2;
    order_item.rebate_pct = item_rebate_pct;
    rebate += order_item.rebate;
    total_ap += item_total_ap;
    considered_total_ap += considered_item_total_ap;
    LTBV += item_total_base_price;
    if (updateDiscount) {
      order_item.rebate_pct = 0;
      order_item.rebate = 0;
    }
    if (old_discount != order_item.discount) {
      discount_updated = 1;
      console.log("CalculateAPRebate Discount Changed:", old_discount, order_item.discount);
    }
    if (order_item.igstPct > 0) {
      order_item.igst = order_item.taxableAmount * (order_item.igstPct / 100);
    }
    if (order_item.cgstPct > 0) {
      order_item.cgst = order_item.taxableAmount * (order_item.cgstPct / 100);
    }
    if (order_item.sgstPct > 0) {
      order_item.sgst = order_item.taxableAmount * (order_item.sgstPct / 100);
    }

    order_item.totalTax = order_item.igst + order_item.cgst + order_item.sgst;
    order_item.total = order_item.taxableAmount + order_item.totalTax;

    return order_item;
  });
  rebate_pct = _.round(rebate / total_ap, 2);
  rebate = _.round(rebate, 2);
  return {
    total_ap,
    considered_total_ap,
    rebate_pct,
    rebate,
    order_items,
    discount_updated
  }
}
