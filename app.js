const STORAGE_KEY = "global-seller-margin-desk-v2";
const RATE_PROFILE_ID = "hana-first-20260612-92-usd1335";
const SHOPEE_FEE_PROFILE_ID = "shopee-sls-fee-article-10624-20260720-mx";

const SHOPEE_MARKETS = {
  SG: { label: "싱가포르", currency: "SGD", exchangeRate: 1094.322, commissionFee: 15.35, transactionFee: 2.16 },
  TW: { label: "대만", currency: "TWD", exchangeRate: 44.436, commissionFee: 12.35, transactionFee: 2 },
  BR: { label: "브라질", currency: "BRL", exchangeRate: 275.439, commissionFee: 13.35, transactionFee: 2 },
  TH: { label: "태국", currency: "THB", exchangeRate: 42.909, commissionFee: 21.77, transactionFee: 2.14 },
  MY: { label: "말레이시아", currency: "MYR", exchangeRate: 345.423, commissionFee: 16.58, transactionFee: 2.12 },
  PH: { label: "필리핀", currency: "PHP", exchangeRate: 23, commissionFee: 10.01, transactionFee: 2.24 },
  VN: { label: "베트남", currency: "VND", exchangeRate: 0.05336, commissionFee: 17, transactionFee: 2.2 },
  MX: { label: "멕시코", currency: "MXN", exchangeRate: 77.64, commissionFee: 15.35, transactionFee: 2 }
};
const SHOPEE_MARKET_CODES = Object.keys(SHOPEE_MARKETS);

const SHOPEE_BUYER_SHIPPING_RULES = {
  SG: { type: "fixed", amount: 1.83, note: "SG 2026.06.01 요율표의 고객 부담 배송비 기준 반영" },
  TW: { type: "fixed", amount: 70, note: "생방 배송 기준 고객 고정 배송비" },
  BR: { type: "fixed", amount: 13, note: "공유 요율표 기준 고객 부담 배송비" },
  TH: { type: "fixed", amount: 22, note: "Zone A 기준 고객 고정 배송비" },
  MY: {
    type: "table",
    table: [[800, 4.9], [1000, 7.1], [1500, 11.5]],
    overStepGram: 100,
    overStepFee: 0.88,
    note: "New MY Price Tool 예시 기준. 800g 초과분은 보수 추정"
  },
  PH: { type: "fixed", amount: 40, note: "Zone A 기준 고객 고정 배송비" },
  VN: { type: "fixed", amount: 15000, note: "Zone A1 기준 고객 고정 배송비" },
  MX: { type: "fixed", amount: 40, note: "MX Price Tool 2026.07.01 기준 고객 부담 배송비" }
};

const CUSTOMS_TOY_CARD = {
  SG: { dutyRate: 0, vatRate: 9, thresholdLocal: 0, note: "GST 9% 기준" },
  TW: { dutyRate: 5, vatRate: 5, thresholdLocal: 2000, underDutyRate: 0, underVatRate: 0, note: "NT$2,000 이하 면세 기준" },
  BR: { dutyRate: 60, vatRate: 20, thresholdUsd: 50, underDutyRate: 20, underVatRate: 20, note: "Remessa Conforme 소액/고액 구간 기준" },
  TH: { dutyRate: 20, vatRate: 7, thresholdLocal: 0, note: "CIF 기준 관부가세" },
  MY: { dutyRate: 0, vatRate: 10, thresholdLocal: 0, note: "LVG 판매세 10% 기준" },
  PH: { dutyRate: 15, vatRate: 12, thresholdLocal: 10000, underDutyRate: 0, underVatRate: 0, note: "PHP 10,000 이하 면세 기준" },
  VN: { dutyRate: 20, vatRate: 10, thresholdLocal: 0, note: "저가수입 면세 폐지 이후 보수 기준" },
  MX: { dutyRate: 33.5, vatRate: 16, thresholdUsd: 2500, note: "비FTA 소액 특송 보수 기준" }
};

const CUSTOMS_POLICY_NOTES = {
  SG: "마켓/구매자 처리",
  TW: "마켓/구매자 처리",
  BR: "구매자 부담",
  TH: "쇼피 자동 마크업",
  MY: "마켓/구매자 처리",
  PH: "마켓/구매자 처리",
  VN: "마켓/구매자 처리",
  MX: "쇼피 수입 관세율 자동 반영"
};

const defaults = {
  productName: "트레이딩 카드 박스",
  productCost: 32000,
  domesticShipping: 3000,
  packingCost: 1200,
  targetProfitKrw: 8000,
  targetProfitMode: "krw",
  targetProfitPercent: 25,
  exchangeRate: 1335,
  weightGram: 800,
  lengthCm: 24,
  widthCm: 18,
  heightCm: 8,
  ebayFinalValueFee: 13.25,
  ebayInternationalFee: 1.45,
  ebayFixedFee: 0.4,
  ebayAdFee: 3,
  ebayBufferFee: 1,
  shopeeProgramFee: 4,
  shopeeWithdrawalFee: 0.9,
  shopeeBufferFee: 1,
  customsPayer: "buyer",
  customsExtraFixed: 0,
  markets: SHOPEE_MARKETS,
  savedRecords: [],
  rateProfile: RATE_PROFILE_ID,
  shopeeFeeProfile: SHOPEE_FEE_PROFILE_ID
};

let cachedShopeeShippingTables = null;


const els = {};
const PRODUCT_FIELDS = [
  "productName",
  "productCost",
  "domesticShipping",
  "packingCost",
  "targetProfitKrw",
  "targetProfitMode",
  "targetProfitPercent",
  "weightGram",
  "lengthCm",
  "widthCm",
  "heightCm"
];

function createProduct(overrides = {}) {
  return {
    id: overrides.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    productName: overrides.productName ?? defaults.productName,
    productCost: numberValue(overrides.productCost ?? defaults.productCost),
    domesticShipping: numberValue(overrides.domesticShipping ?? defaults.domesticShipping),
    packingCost: numberValue(overrides.packingCost ?? defaults.packingCost),
    targetProfitKrw: numberValue(overrides.targetProfitKrw ?? defaults.targetProfitKrw),
    targetProfitMode: normalizeTargetProfitMode(overrides.targetProfitMode ?? defaults.targetProfitMode),
    targetProfitPercent: numberValue(overrides.targetProfitPercent ?? defaults.targetProfitPercent),
    weightGram: numberValue(overrides.weightGram ?? defaults.weightGram),
    lengthCm: numberValue(overrides.lengthCm ?? defaults.lengthCm),
    widthCm: numberValue(overrides.widthCm ?? defaults.widthCm),
    heightCm: numberValue(overrides.heightCm ?? defaults.heightCm)
  };
}

function normalizeProducts(products, fallbackSource = defaults) {
  if (Array.isArray(products) && products.length) {
    return products.map((product) => createProduct(product));
  }
  return [createProduct(fallbackSource)];
}

function calculationInput(product) {
  return {
    ...state,
    ...product,
    markets: state.markets
  };
}

let state = loadState();

function boot() {
  Object.assign(els, {
    saveStatus: document.querySelector("#saveStatus"),
    productRows: document.querySelector("#productRows"),
    addProductButton: document.querySelector("#addProductButton"),
    exchangeRate: document.querySelector("#exchangeRate"),
    ebayBody: document.querySelector("#ebayBody"),
    ebayNote: document.querySelector("#ebayNote"),
    shopeeBody: document.querySelector("#shopeeBody"),
    saveCurrentButton: document.querySelector("#saveCurrentButton"),
    resetButton: document.querySelector("#resetButton"),
    copySummaryButton: document.querySelector("#copySummaryButton"),
    historySearch: document.querySelector("#historySearch"),
    historyBody: document.querySelector("#historyBody"),
    historyCount: document.querySelector("#historyCount"),
    ebayFinalValueFee: document.querySelector("#ebayFinalValueFee"),
    ebayInternationalFee: document.querySelector("#ebayInternationalFee"),
    ebayFixedFee: document.querySelector("#ebayFixedFee"),
    ebayAdFee: document.querySelector("#ebayAdFee"),
    ebayBufferFee: document.querySelector("#ebayBufferFee"),
    shopeeProgramFee: document.querySelector("#shopeeProgramFee"),
    shopeeWithdrawalFee: document.querySelector("#shopeeWithdrawalFee"),
    shopeeBufferFee: document.querySelector("#shopeeBufferFee"),
    resetShopeeFeesButton: document.querySelector("#resetShopeeFeesButton"),
    customsPayer: document.querySelector("#customsPayer"),
    customsExtraFixed: document.querySelector("#customsExtraFixed"),
    marketSettingsBody: document.querySelector("#marketSettingsBody")
  });

  hydrate();
  updateCustomsExtraField();
  renderMarketSettings();
  bindEvents();
  recalculate();
  renderHistory();
}

function bindEvents() {
  getInputs().forEach((input) => {
    const eventName = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, () => {
      syncState();
      updateCustomsExtraField();
      recalculate();
      saveState();
    });
  });
  els.addProductButton.addEventListener("click", () => {
    syncProductsFromDom();
    state.products.push(createProduct({ productName: `상품 ${state.products.length + 1}` }));
    renderProductRows();
    recalculate();
    saveState("상품 추가됨");
  });
  els.saveCurrentButton.addEventListener("click", saveCurrentRecord);
  els.resetButton.addEventListener("click", () => {
    const savedRecords = state.savedRecords || [];
    state = structuredClone(defaults);
    state.savedRecords = savedRecords;
    state.products = [createProduct(defaults)];
    hydrate();
    renderMarketSettings();
    recalculate();
    renderHistory();
    saveState("샘플로 되돌림");
  });
  els.copySummaryButton.addEventListener("click", copySummary);
  els.historySearch.addEventListener("input", renderHistory);
  els.resetShopeeFeesButton.addEventListener("click", () => {
    applyShopeeOfficialFees(state);
    hydrate();
    renderMarketSettings();
    recalculate();
    saveState("SLS 공식 수수료 적용됨");
  });
}

function getInputs() {
  return [
    els.exchangeRate,
    els.ebayFinalValueFee,
    els.ebayInternationalFee,
    els.ebayFixedFee,
    els.ebayAdFee,
    els.ebayBufferFee,
    els.shopeeProgramFee,
    els.shopeeWithdrawalFee,
    els.shopeeBufferFee,
    els.customsPayer,
    els.customsExtraFixed
  ].filter(Boolean);
}

function hydrate() {
  state.products = normalizeProducts(state.products, state);
  syncPrimaryProductFields();
  renderProductRows();
  els.exchangeRate.value = state.exchangeRate;
  els.ebayFinalValueFee.value = state.ebayFinalValueFee;
  els.ebayInternationalFee.value = state.ebayInternationalFee;
  els.ebayFixedFee.value = state.ebayFixedFee;
  els.ebayAdFee.value = state.ebayAdFee;
  els.ebayBufferFee.value = state.ebayBufferFee;
  els.shopeeProgramFee.value = state.shopeeProgramFee;
  els.shopeeWithdrawalFee.value = state.shopeeWithdrawalFee;
  els.shopeeBufferFee.value = state.shopeeBufferFee;
  els.customsPayer.value = state.customsPayer;
  els.customsExtraFixed.value = state.customsExtraFixed;
  updateCustomsExtraField();
}

function syncState() {
  syncProductsFromDom();
  state.exchangeRate = numberValue(els.exchangeRate.value);
  state.ebayFinalValueFee = numberValue(els.ebayFinalValueFee.value);
  state.ebayInternationalFee = numberValue(els.ebayInternationalFee.value);
  state.ebayFixedFee = numberValue(els.ebayFixedFee.value);
  state.ebayAdFee = numberValue(els.ebayAdFee.value);
  state.ebayBufferFee = numberValue(els.ebayBufferFee.value);
  state.shopeeProgramFee = numberValue(els.shopeeProgramFee.value);
  state.shopeeWithdrawalFee = numberValue(els.shopeeWithdrawalFee.value);
  state.shopeeBufferFee = numberValue(els.shopeeBufferFee.value);
  state.customsPayer = els.customsPayer.value;
  state.customsExtraFixed = numberValue(els.customsExtraFixed.value);
}

function renderProductRows() {
  state.products = normalizeProducts(state.products, state);
  els.productRows.innerHTML = state.products.map((product, index) => `
    <tr data-product-index="${index}">
      <td><input data-field="productName" type="text" value="${escapeHtml(product.productName)}"></td>
      <td><input data-field="productCost" type="number" min="0" step="100" value="${product.productCost}"></td>
      <td><input data-field="domesticShipping" type="number" min="0" step="100" value="${product.domesticShipping}"></td>
      <td><input data-field="packingCost" type="number" min="0" step="100" value="${product.packingCost}"></td>
      <td>
        <div class="margin-input">
          <select data-field="targetProfitMode">
            <option value="krw" ${product.targetProfitMode === "krw" ? "selected" : ""}>원화</option>
            <option value="percent" ${product.targetProfitMode === "percent" ? "selected" : ""}>원가 대비 %</option>
          </select>
          <input data-field="${product.targetProfitMode === "percent" ? "targetProfitPercent" : "targetProfitKrw"}" type="number" min="0" step="${product.targetProfitMode === "percent" ? "0.1" : "100"}" value="${product.targetProfitMode === "percent" ? product.targetProfitPercent : product.targetProfitKrw}">
        </div>
      </td>
      <td><input data-field="weightGram" type="number" min="1" step="10" value="${product.weightGram}"></td>
      <td><input data-field="lengthCm" type="number" min="0" step="0.1" value="${product.lengthCm}"></td>
      <td><input data-field="widthCm" type="number" min="0" step="0.1" value="${product.widthCm}"></td>
      <td><input data-field="heightCm" type="number" min="0" step="0.1" value="${product.heightCm}"></td>
      <td><button class="danger-button" type="button" data-remove-product="${index}" ${state.products.length <= 1 ? "disabled" : ""}>삭제</button></td>
    </tr>
  `).join("");

  els.productRows.querySelectorAll("input, select").forEach((input) => {
    const eventName = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, () => {
      syncProductsFromDom();
      if (input.dataset.field === "targetProfitMode") renderProductRows();
      recalculate();
      saveState();
    });
  });
  els.productRows.querySelectorAll("[data-remove-product]").forEach((button) => {
    button.addEventListener("click", () => {
      syncProductsFromDom();
      if (state.products.length <= 1) return;
      state.products.splice(Number(button.dataset.removeProduct), 1);
      renderProductRows();
      recalculate();
      saveState("상품 삭제됨");
    });
  });
}

function syncProductsFromDom() {
  if (!els.productRows) {
    state.products = normalizeProducts(state.products, state);
    syncPrimaryProductFields();
    return;
  }
  const rows = Array.from(els.productRows.querySelectorAll("tr[data-product-index]"));
  if (!rows.length) {
    state.products = normalizeProducts(state.products, state);
    syncPrimaryProductFields();
    return;
  }
  state.products = rows.map((row, index) => {
    const product = createProduct(state.products[index] || {});
    row.querySelectorAll("input[data-field], select[data-field]").forEach((input) => {
      const field = input.dataset.field;
      if (!PRODUCT_FIELDS.includes(field)) return;
      if (field === "productName") {
        product[field] = input.value.trim();
      } else if (field === "targetProfitMode") {
        product[field] = normalizeTargetProfitMode(input.value);
      } else {
        product[field] = numberValue(input.value);
      }
    });
    return product;
  });
  syncPrimaryProductFields();
}

function syncPrimaryProductFields() {
  const firstProduct = normalizeProducts(state.products, state)[0];
  PRODUCT_FIELDS.forEach((field) => {
    state[field] = firstProduct[field];
  });
}

function updateCustomsExtraField() {
  const sellerPays = els.customsPayer.value === "seller";
  els.customsExtraFixed.disabled = !sellerPays;
  els.customsExtraFixed.title = sellerPays
    ? "통관 완료 후 반품/배송 실패처럼 판매자가 수입 관부가세를 부담하는 예외 상황에만 반영합니다."
    : "쇼피 자동 마크업/구매자 부담 모드에서는 반영하지 않습니다.";
}

function recalculate() {
  ensureStateMarkets();
  state.products = normalizeProducts(state.products, state);
  const productResults = state.products.map((product) => {
    const input = calculationInput(product);
    const ebay = calculateEbay(input);
    const shopeeRows = SHOPEE_MARKET_CODES.map((code) => ({
      ...calculateShopee(code, input),
      product
    }));
    return { product, ebay, shopeeRows };
  });
  const shopeeRows = productResults.flatMap((result) => result.shopeeRows);
  renderEbay(productResults);
  renderShopee(shopeeRows);
}

function baseCost(input) {
  return numberValue(input.productCost) + numberValue(input.domesticShipping) + numberValue(input.packingCost);
}

function targetProfitAmountKrw(input) {
  if (normalizeTargetProfitMode(input.targetProfitMode) === "percent") {
    return numberValue(input.productCost) * numberValue(input.targetProfitPercent) / 100;
  }
  return numberValue(input.targetProfitKrw);
}

function normalizeTargetProfitMode(value) {
  return value === "percent" ? "percent" : "krw";
}

function calculateEbay(input) {
  const cost = baseCost(input);
  const targetProfit = targetProfitAmountKrw(input);
  const fixedFeeKrw = numberValue(input.ebayFixedFee) * numberValue(input.exchangeRate);
  const feeRate = (numberValue(input.ebayFinalValueFee) + numberValue(input.ebayInternationalFee) + numberValue(input.ebayAdFee) + numberValue(input.ebayBufferFee)) / 100;
  const required = (cost + targetProfit + fixedFeeKrw) / Math.max(0.01, 1 - feeRate);
  const listingPrice = roundKrw(required);
  const fee = listingPrice * feeRate + fixedFeeKrw;
  const payout = listingPrice - fee;
  const profit = payout - cost;
  return {
    listingPrice,
    foreignPrice: listingPrice / numberValue(input.exchangeRate),
    fee,
    payout,
    profit,
    feeRate
  };
}

function calculateShopee(code, input) {
  const market = getShopeeMarket(input, code);
  const billableWeight = billableGram(input);
  const sellerShippingLocal = lookupShopeeShipping(code, billableWeight);
  const shippingIssue = shopeeShippingIssue(code, billableWeight);
  const sellerShippingKrw = sellerShippingLocal * numberValue(market.exchangeRate);
  const buyerShippingLocal = lookupShopeeBuyerShipping(code, billableWeight);
  const buyerShippingKrw = buyerShippingLocal * numberValue(market.exchangeRate);
  const cost = baseCost(input) + sellerShippingKrw;
  const targetProfit = targetProfitAmountKrw(input);
  const commissionServiceRate = (numberValue(market.commissionFee) + numberValue(input.shopeeProgramFee)) / 100;
  const bufferRate = numberValue(input.shopeeBufferFee) / 100;
  const withdrawalRate = numberValue(input.shopeeWithdrawalFee) / 100;
  const transactionRate = numberValue(market.transactionFee) / 100;
  const feeRate = commissionServiceRate + bufferRate + transactionRate + withdrawalRate;
  const sellerPaysCustoms = input.customsPayer === "seller";
  const extraCustomsKrw = sellerPaysCustoms ? numberValue(input.customsExtraFixed) : 0;
  let listingLocal = 0;
  let customsKrw = 0;
  let customsBlocked = false;

  if (sellerPaysCustoms) {
    listingLocal = roundLocal(shopeeRequiredKrw(cost, targetProfit, extraCustomsKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate) / numberValue(market.exchangeRate), market.currency);
    let low = listingLocal;
    let high = listingLocal;
    for (let index = 0; index < 24; index += 1) {
      if (shopeeProfitAt(code, high, sellerShippingLocal, buyerShippingKrw, cost, extraCustomsKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate, input) >= targetProfit) break;
      high = roundLocal(high * 1.35 + 1, market.currency);
      if (high > Math.max(listingLocal * 80, 1000000)) {
        customsBlocked = true;
        break;
      }
    }
    if (shopeeProfitAt(code, high, sellerShippingLocal, buyerShippingKrw, cost, extraCustomsKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate, input) < targetProfit) {
      customsBlocked = true;
    }
    if (!customsBlocked) {
      for (let index = 0; index < 32; index += 1) {
        const middle = roundLocal((low + high) / 2, market.currency);
        if (middle === low || middle === high) break;
        if (shopeeProfitAt(code, middle, sellerShippingLocal, buyerShippingKrw, cost, extraCustomsKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate, input) >= targetProfit) {
          high = middle;
        } else {
          low = middle;
        }
      }
      listingLocal = high;
    }
    customsKrw = estimateCustomsKrw(code, listingLocal, sellerShippingLocal, input);
  } else {
    const requiredKrw = shopeeRequiredKrw(cost, targetProfit, extraCustomsKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate);
    listingLocal = roundLocal(requiredKrw / numberValue(market.exchangeRate), market.currency);
  }

  const listingKrw = listingLocal * numberValue(market.exchangeRate);
  const feeBreakdown = shopeeFeeBreakdownKrw(listingKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate);
  const feeKrw = feeBreakdown.total;
  const profit = listingKrw - feeKrw - customsKrw - extraCustomsKrw - cost;
  return {
    code,
    market,
    shippingLocal: sellerShippingLocal,
    shippingKrw: sellerShippingKrw,
    sellerShippingLocal,
    sellerShippingKrw,
    buyerShippingLocal,
    buyerShippingKrw,
    buyerShippingNote: buyerShippingNote(code),
    customsKrw,
    customsNote: customsNote(code, input),
    listingLocal,
    listingKrw,
    feeKrw,
    feeBreakdown,
    profit,
    feeRate: listingKrw ? feeKrw / listingKrw : feeRate,
    customsBlocked,
    status: shippingIssue || (customsBlocked ? "판매자 부담 위험" : profit >= targetProfit ? "OK" : "확인")
  };
}

function shopeeProfitAt(code, listingLocal, sellerShippingLocal, buyerShippingKrw, cost, extraCustomsKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate, input) {
  const market = getShopeeMarket(input, code);
  const listingKrw = numberValue(listingLocal) * numberValue(market.exchangeRate);
  const feeKrw = shopeeFeeKrw(listingKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate);
  const customsKrw = estimateCustomsKrw(code, listingLocal, sellerShippingLocal, input);
  return listingKrw - feeKrw - customsKrw - extraCustomsKrw - cost;
}

function shopeeRequiredKrw(cost, targetProfit, extraCustomsKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate) {
  const payoutRateBeforeWithdrawal = 1 - commissionServiceRate - transactionRate;
  const denominator = payoutRateBeforeWithdrawal * (1 - withdrawalRate) - bufferRate;
  const buyerShippingFeeImpact = transactionRate * buyerShippingKrw * (1 - withdrawalRate);
  return (cost + targetProfit + extraCustomsKrw + buyerShippingFeeImpact) / Math.max(0.01, denominator);
}

function shopeeFeeKrw(listingKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate) {
  return shopeeFeeBreakdownKrw(listingKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate).total;
}

function shopeeFeeBreakdownKrw(listingKrw, buyerShippingKrw, commissionServiceRate, bufferRate, transactionRate, withdrawalRate) {
  const commissionServiceFee = listingKrw * commissionServiceRate;
  const transactionFee = (listingKrw + buyerShippingKrw) * transactionRate;
  const bufferFee = listingKrw * bufferRate;
  const settlementBeforeWithdrawal = Math.max(0, listingKrw - commissionServiceFee - transactionFee);
  const withdrawalFee = settlementBeforeWithdrawal * withdrawalRate;
  return {
    commissionServiceFee,
    transactionFee,
    bufferFee,
    withdrawalFee,
    total: commissionServiceFee + transactionFee + bufferFee + withdrawalFee
  };
}

function estimateCustomsKrw(code, listingLocal, shippingLocal, input) {
  if (input.customsPayer !== "seller") return 0;
  const market = getShopeeMarket(input, code);
  return customsBaseKrw(code, listingLocal, shippingLocal, input, market) * customsEffectiveRate(code, listingLocal, shippingLocal, input);
}

function customsEffectiveRate(code, listingLocal, shippingLocal, input) {
  const market = getShopeeMarket(input, code);
  const profile = CUSTOMS_TOY_CARD[code];
  if (!profile) return 0;
  const customsBaseLocal = numberValue(listingLocal) + numberValue(shippingLocal);
  const customsBaseKrw = customsBaseLocal * numberValue(market.exchangeRate);
  const thresholdLocal = numberValue(profile.thresholdLocal);
  const thresholdUsd = numberValue(profile.thresholdUsd);
  const useUnderRate = thresholdUsd
    ? customsBaseKrw / numberValue(input.exchangeRate) <= thresholdUsd
    : thresholdLocal && customsBaseLocal <= thresholdLocal;
  const dutyRate = useUnderRate ? numberValue(profile.underDutyRate) : numberValue(profile.dutyRate);
  const vatRate = useUnderRate ? numberValue(profile.underVatRate) : numberValue(profile.vatRate);
  return dutyRate / 100 + (1 + dutyRate / 100) * vatRate / 100;
}

function customsBaseKrw(code, listingLocal, shippingLocal, input, market) {
  if (code === "TH") {
    const realWeightKg = Math.max(numberValue(input.weightGram) / 1000, 0.01);
    const cifLocal = numberValue(listingLocal) * 1.01 + 260 * realWeightKg;
    return cifLocal * numberValue(market.exchangeRate);
  }
  return (numberValue(listingLocal) + numberValue(shippingLocal)) * numberValue(market.exchangeRate);
}

function customsNote(code, input) {
  if (input.customsPayer !== "seller") return CUSTOMS_POLICY_NOTES[code] || "쇼피/구매자 처리";
  const note = CUSTOMS_TOY_CARD[code]?.note || "판매자 부담";
  if (code === "TH") return `${note} 추정`;
  return `${note} 예외 추정`;
}

function billableGram(input) {
  const volumeKg = numberValue(input.lengthCm) * numberValue(input.widthCm) * numberValue(input.heightCm) / 6000;
  return Math.max(numberValue(input.weightGram), volumeKg * 1000, 1);
}

function lookupShopeeShipping(code, gram) {
  const rawTable = getShopeeShippingTables()[code] || [];
  const table = Array.isArray(rawTable)
    ? rawTable.filter((row) => Array.isArray(row) && row.length >= 2)
    : [];
  if (!table.length) return 0;
  const found = table.find(([weight]) => weight >= gram);
  return found ? found[1] : table[table.length - 1][1];
}

function shopeeShippingIssue(code, gram) {
  const rawTable = getShopeeShippingTables()[code] || [];
  const table = Array.isArray(rawTable)
    ? rawTable.filter((row) => Array.isArray(row) && row.length >= 2)
    : [];
  if (!table.length) return "배송표 없음";
  const maxWeight = numberValue(table[table.length - 1][0]);
  if (gram > maxWeight) return `요율표 초과(${formatNumber(maxWeight)}g+)`;
  return "";
}

function getShopeeShippingTables() {
  if (typeof SHOPEE_SHIPPING_TABLES !== "undefined") return SHOPEE_SHIPPING_TABLES;
  if (cachedShopeeShippingTables) return cachedShopeeShippingTables;
  cachedShopeeShippingTables = {};
  if (typeof require === "function") {
    try {
      cachedShopeeShippingTables = require("./shopee-shipping-data.js").SHOPEE_SHIPPING_TABLES || {};
    } catch {
      cachedShopeeShippingTables = {};
    }
  }
  return cachedShopeeShippingTables;
}

function lookupShopeeBuyerShipping(code, gram) {
  const rule = SHOPEE_BUYER_SHIPPING_RULES[code];
  if (!rule) return 0;
  if (rule.type === "fixed") return numberValue(rule.amount);
  if (rule.type === "table") {
    const table = Array.isArray(rule.table)
      ? rule.table.filter((row) => Array.isArray(row) && row.length >= 2)
      : [];
    if (!table.length) return 0;
    const found = table.find(([weight]) => weight >= gram);
    if (found) return found[1];
    const [lastWeight, lastFee] = table[table.length - 1];
    const extraSteps = Math.ceil(Math.max(0, gram - lastWeight) / Math.max(1, numberValue(rule.overStepGram)));
    return lastFee + extraSteps * numberValue(rule.overStepFee);
  }
  return 0;
}

function buyerShippingNote(code) {
  return SHOPEE_BUYER_SHIPPING_RULES[code]?.note || "고객 부담 배송비 미확인";
}

function ensureStateMarkets() {
  state.markets = normalizeShopeeMarkets(state.markets);
  return state.markets;
}

function getShopeeMarket(input, code) {
  return normalizeShopeeMarket(code, input?.markets?.[code]);
}

function normalizeShopeeMarkets(markets) {
  const savedMarkets = isPlainObject(markets) ? markets : {};
  return Object.fromEntries(SHOPEE_MARKET_CODES.map((code) => [
    code,
    normalizeShopeeMarket(code, savedMarkets[code])
  ]));
}

function normalizeShopeeMarket(code, savedMarket) {
  const fallback = defaults.markets[code] || SHOPEE_MARKETS[code] || defaults.markets.SG;
  const saved = isPlainObject(savedMarket) ? savedMarket : {};
  return {
    label: fallback.label,
    currency: fallback.currency,
    exchangeRate: marketNumberOrDefault(saved.exchangeRate, fallback.exchangeRate, { positive: true }),
    commissionFee: marketNumberOrDefault(saved.commissionFee, fallback.commissionFee),
    transactionFee: marketNumberOrDefault(saved.transactionFee, fallback.transactionFee)
  };
}

function marketNumberOrDefault(value, fallback, options = {}) {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  const number = Number(String(value ?? "").replace(/,/g, ""));
  if (!Number.isFinite(number)) return fallback;
  if (options.positive && number <= 0) return fallback;
  if (number < 0) return fallback;
  return number;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function renderEbay(results) {
  els.ebayBody.innerHTML = results.map(({ product, ebay }) => `
    <tr>
      <td><strong>${escapeHtml(product.productName || "상품")}</strong></td>
      <td>${formatForeign(ebay.foreignPrice, "USD")}</td>
      <td>${formatKrw(ebay.listingPrice)}</td>
      <td>${formatKrw(ebay.profit)}</td>
      <td>${formatKrw(ebay.fee)}</td>
    </tr>
  `).join("");
  els.ebayNote.textContent = "이베이는 해외 배송비를 상품 마진 계산에서 제외했습니다. 단, 공식 문서상 최종 가치 수수료는 구매자 결제 총액 기준으로 적용될 수 있으니 실제 정산으로 보정하세요.";
}

function renderShopee(rows) {
  els.shopeeBody.innerHTML = rows.map((row) => `
    <tr class="${row.status === "OK" ? "" : "risk-row"}">
      <td><strong>${row.market.label}</strong></td>
      <td>${escapeHtml(row.product?.productName || "상품")}</td>
      <td>${row.market.currency}</td>
      <td>${formatNumber(row.market.exchangeRate, 3)}</td>
      <td>
        <strong>${formatForeign(row.sellerShippingLocal, row.market.currency)}</strong><br>
        <span>판매자 부담 ${formatKrw(row.sellerShippingKrw)}</span><br>
        <span>고객 부담 ${formatForeign(row.buyerShippingLocal, row.market.currency)} · 거래수수료 기준</span><br>
        <span>${row.buyerShippingNote}</span>
      </td>
      <td>${formatKrw(row.customsKrw)}<br><span>${row.customsNote}</span></td>
      <td>${renderShopeeFeeCell(row)}</td>
      <td>${renderShopeePriceCell(row)}</td>
      <td>${formatKrw(row.profit)}</td>
      <td>${row.status}</td>
    </tr>
  `).join("");
}

function renderShopeeFeeCell(row) {
  const fee = row.feeBreakdown || {};
  return `
    <strong>${formatKrw(row.feeKrw)}</strong><br>
    <span>판매/FSP ${formatKrw(fee.commissionServiceFee)}</span><br>
    <span>거래 ${formatKrw(fee.transactionFee)} · 인출 ${formatKrw(fee.withdrawalFee)}</span><br>
    <span>여유분 ${formatKrw(fee.bufferFee)}</span>
  `;
}

function renderShopeePriceCell(row) {
  if (row.customsBlocked) {
    return "<strong>계산 불가</strong><br><span>세금+수수료 과다</span>";
  }
  return `<strong>${formatForeign(row.listingLocal, row.market.currency)}</strong><br><span>${formatKrw(row.listingKrw)}</span>`;
}

function renderMarketSettings() {
  const markets = ensureStateMarkets();
  els.marketSettingsBody.innerHTML = SHOPEE_MARKET_CODES.map((code) => {
    const market = markets[code];
    return `
    <tr data-market="${code}">
      <td>${market.label}</td>
      <td>${market.currency}</td>
      <td><input data-field="exchangeRate" type="number" min="0" step="0.001" value="${market.exchangeRate}"></td>
      <td><input data-field="commissionFee" type="number" min="0" step="0.1" value="${market.commissionFee}"></td>
      <td><input data-field="transactionFee" type="number" min="0" step="0.1" value="${market.transactionFee}"></td>
    </tr>
  `;
  }).join("");
  els.marketSettingsBody.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const row = event.target.closest("tr");
      ensureStateMarkets();
      if (!state.markets[row.dataset.market]) return;
      state.markets[row.dataset.market][event.target.dataset.field] = numberValue(event.target.value);
      recalculate();
      saveState();
    });
  });
}

function saveCurrentRecord() {
  syncState();
  ensureStateMarkets();
  state.products = normalizeProducts(state.products, state);
  const records = state.products.map((product) => {
    const input = calculationInput(product);
    const ebay = calculateEbay(input);
    const shopeeRows = SHOPEE_MARKET_CODES.map((code) => calculateShopee(code, input));
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      savedAt: new Date().toISOString(),
      productName: product.productName || "이름 없는 상품",
      productCost: product.productCost,
      domesticShipping: product.domesticShipping,
      packingCost: product.packingCost,
      customsPayer: state.customsPayer,
      customsExtraFixed: state.customsExtraFixed,
      weightGram: product.weightGram,
      lengthCm: product.lengthCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      targetProfitKrw: product.targetProfitKrw,
      targetProfitMode: product.targetProfitMode,
      targetProfitPercent: product.targetProfitPercent,
      targetProfitAmountKrw: targetProfitAmountKrw(product),
      ebayPrice: ebay.listingPrice,
      ebayUsd: ebay.foreignPrice,
      ebayProfit: ebay.profit,
      shopeePrices: Object.fromEntries(shopeeRows.map((row) => [
        row.code,
        {
          label: row.market.label,
          currency: row.market.currency,
          listingLocal: row.listingLocal,
          profit: row.profit,
          status: row.status,
          customsKrw: row.customsKrw,
          sellerShippingLocal: row.sellerShippingLocal,
          buyerShippingLocal: row.buyerShippingLocal
        }
      ]))
    };
  });
  state.savedRecords = [...records, ...(state.savedRecords || [])].slice(0, 300);
  renderHistory();
  saveState(`${records.length}개 상품 저장됨`);
}

function renderHistory() {
  const query = normalize(els.historySearch.value);
  const rows = (state.savedRecords || []).filter((record) => {
    if (!query) return true;
    const markets = Object.values(record.shopeePrices || {}).map((item) => item.label).join(" ");
    return normalize(`${record.productName} ${markets} ${record.shopeeMarket || ""} ebay shopee`).includes(query);
  });
  els.historyCount.textContent = `${state.savedRecords.length}개 저장됨`;
  if (!rows.length) {
    els.historyBody.innerHTML = `<tr><td colspan="13" class="empty">검색 결과가 없습니다.</td></tr>`;
    return;
  }
  els.historyBody.innerHTML = rows.map((record) => `
    <tr>
      <td>${formatDateTime(record.savedAt)}</td>
      <td>${escapeHtml(record.productName)}</td>
      <td>${formatKrw(record.productCost)}</td>
      <td>${formatTargetProfit(record)}</td>
      <td><strong>${formatSavedEbay(record)}</strong><br><span>${formatKrw(record.ebayProfit || 0)}</span></td>
      ${SHOPEE_MARKET_CODES.map((code) => renderSavedShopeeCell(record, code)).join("")}
      <td><button type="button" data-load="${record.id}">불러오기</button></td>
    </tr>
  `).join("");
  els.historyBody.querySelectorAll("[data-load]").forEach((button) => {
    button.addEventListener("click", () => loadRecord(button.dataset.load));
  });
}

function formatSavedEbay(record) {
  if (record.ebayUsd) return formatForeign(record.ebayUsd, "USD");
  return formatKrw(record.ebayPrice);
}

function formatTargetProfit(record) {
  if (normalizeTargetProfitMode(record.targetProfitMode) === "percent") {
    const percent = formatNumber(record.targetProfitPercent, 1);
    return `${percent}% (${formatKrw(targetProfitAmountKrw(record))})`;
  }
  return formatKrw(record.targetProfitKrw);
}

function renderSavedShopeeCell(record, code) {
  const saved = record.shopeePrices?.[code];
  if (!saved && code === "SG" && record.shopeePrice) {
    return `<td>${formatForeign(record.shopeePrice, record.shopeeCurrency)}</td>`;
  }
  if (!saved) return "<td>-</td>";
  if (saved.status === "판매자 부담 위험") {
    return `<td><strong>계산 불가</strong><br><span>${saved.status}</span></td>`;
  }
  return `<td><strong>${formatForeign(saved.listingLocal, saved.currency)}</strong><br><span>${formatKrw(saved.profit)}</span></td>`;
}

function loadRecord(id) {
  const record = (state.savedRecords || []).find((item) => item.id === id);
  if (!record) return;
  state.products = [createProduct({
    productName: record.productName,
    productCost: record.productCost,
    domesticShipping: record.domesticShipping ?? state.domesticShipping,
    packingCost: record.packingCost ?? state.packingCost,
    weightGram: record.weightGram ?? state.weightGram,
    lengthCm: record.lengthCm ?? state.lengthCm,
    widthCm: record.widthCm ?? state.widthCm,
    heightCm: record.heightCm ?? state.heightCm,
    targetProfitKrw: record.targetProfitKrw,
    targetProfitMode: record.targetProfitMode ?? "krw",
    targetProfitPercent: record.targetProfitPercent ?? state.targetProfitPercent
  })];
  syncPrimaryProductFields();
  state.customsPayer = record.customsPayer ?? state.customsPayer;
  state.customsExtraFixed = record.customsExtraFixed ?? state.customsExtraFixed;
  hydrate();
  recalculate();
  saveState("저장 상품 불러옴");
}

async function copySummary() {
  syncState();
  ensureStateMarkets();
  state.products = normalizeProducts(state.products, state);
  const text = state.products.flatMap((product) => {
    const input = calculationInput(product);
    const ebay = calculateEbay(input);
    const shopeeRows = SHOPEE_MARKET_CODES.map((code) => calculateShopee(code, input));
    return [
      `[${product.productName || "상품"} 원화 마진 계산]`,
      `목표 마진: ${formatTargetProfit(product)}`,
      `이베이 권장가: ${formatForeign(ebay.foreignPrice, "USD")} / 예상 마진: ${formatKrw(ebay.profit)}`,
      ...shopeeRows.map((row) => `${row.market.label}: ${formatForeign(row.listingLocal, row.market.currency)} / 마진 ${formatKrw(row.profit)}`),
      ""
    ];
  }).join("\n").trim();
  try {
    await navigator.clipboard.writeText(text);
    setSaveStatus("결과 복사 완료");
  } catch {
    setSaveStatus("복사 권한 확인 필요");
  }
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const saved = isPlainObject(parsed) ? parsed : {};
    const merged = mergeDefaults(structuredClone(defaults), saved);
    return ensureLoadedMarkets(applyShopeeFeeProfile(applyRateProfile(merged, saved), saved));
  } catch {
    return ensureLoadedMarkets(structuredClone(defaults));
  }
}

function ensureLoadedMarkets(nextState) {
  nextState.markets = normalizeShopeeMarkets(nextState.markets);
  nextState.products = normalizeProducts(nextState.products, nextState);
  PRODUCT_FIELDS.forEach((field) => {
    nextState[field] = nextState.products[0][field];
  });
  return nextState;
}

function applyRateProfile(nextState, saved) {
  nextState.markets = normalizeShopeeMarkets(nextState.markets);
  if (saved.rateProfile === RATE_PROFILE_ID) return nextState;
  nextState.exchangeRate = defaults.exchangeRate;
  Object.keys(defaults.markets).forEach((code) => {
    nextState.markets[code].exchangeRate = defaults.markets[code].exchangeRate;
  });
  nextState.rateProfile = RATE_PROFILE_ID;
  return nextState;
}

function applyShopeeFeeProfile(nextState, saved) {
  if (saved.shopeeFeeProfile === SHOPEE_FEE_PROFILE_ID) return nextState;
  applyShopeeOfficialFees(nextState);
  nextState.customsPayer = saved.customsPayer ?? defaults.customsPayer;
  nextState.customsExtraFixed = saved.customsExtraFixed ?? defaults.customsExtraFixed;
  nextState.shopeeFeeProfile = SHOPEE_FEE_PROFILE_ID;
  return nextState;
}

function applyShopeeOfficialFees(nextState) {
  nextState.markets = normalizeShopeeMarkets(nextState.markets);
  Object.keys(defaults.markets).forEach((code) => {
    nextState.markets[code].commissionFee = defaults.markets[code].commissionFee;
    nextState.markets[code].transactionFee = defaults.markets[code].transactionFee;
  });
  nextState.shopeeProgramFee = defaults.shopeeProgramFee;
  nextState.shopeeWithdrawalFee = defaults.shopeeWithdrawalFee;
  nextState.shopeeFeeProfile = SHOPEE_FEE_PROFILE_ID;
}

function mergeDefaults(base, saved) {
  const savedState = isPlainObject(saved) ? saved : {};
  if (savedState.bufferFee !== undefined) {
    savedState.ebayBufferFee = savedState.ebayBufferFee ?? savedState.bufferFee;
    savedState.shopeeBufferFee = savedState.shopeeBufferFee ?? savedState.bufferFee;
  }
  return {
    ...base,
    ...savedState,
    markets: normalizeShopeeMarkets(savedState.markets),
    products: normalizeProducts(savedState.products, savedState),
    savedRecords: Array.isArray(savedState.savedRecords) ? savedState.savedRecords : []
  };
}

function saveState(message = "자동 저장됨") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setSaveStatus(message);
}

function setSaveStatus(message) {
  els.saveStatus.textContent = message;
  window.clearTimeout(setSaveStatus.timer);
  setSaveStatus.timer = window.setTimeout(() => {
    els.saveStatus.textContent = "자동 저장 대기";
  }, 1500);
}

function roundKrw(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / 100) * 100;
}

function roundLocal(value, currency) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (currency === "VND") return Math.ceil(value / 1000) * 1000;
  if (currency === "TWD" || currency === "PHP" || currency === "THB") return Math.ceil(value);
  return Math.ceil(value * 100) / 100;
}

function numberValue(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function formatKrw(value) {
  return `${Math.round(value || 0).toLocaleString("ko-KR")}원`;
}

function formatForeign(value, currency) {
  const digits = currency === "VND" || currency === "TWD" || currency === "PHP" || currency === "THB" ? 0 : 2;
  return `${currency} ${formatNumber(value, digits)}`;
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (typeof document !== "undefined") boot();

if (typeof module !== "undefined") {
  module.exports = {
    calculateEbay,
    calculateShopee,
    defaults,
    lookupShopeeShipping,
    lookupShopeeBuyerShipping
  };
}
