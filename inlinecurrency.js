var rates = {};
var currencies = [
  "AUD", "BGN", "BRL", "CAD", "CHF", 
  "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", 
  "HRK", "HUF", "IDR", "ILS", "INR", 
  "JPY", "KRW", "MXN", "MYR", "NOK", 
  "NZD", "PHP", "PLN", "RON", "RUB", 
  "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
];
var valueRegex = /(^|\W)([A-Za-z]{3})\s?(\d+(\.\d{2})?)(-(\d+(\.\d{2})?))?($|\W)/im;
var classRegex = /([A-Za-z]{3}\d+(\.\d{2})?(-\d+(\.\d{2})?)?)/igm;
var currencyClass = "currency";
var elementQuery = "." + currencyClass;
var targetCcy = undefined;
var targetCcyDefault = "EUR";
var ddmIdStr = "currencyDDM";
var ddmClassStr = "currencyDDM";
var apiURL = "http://api.fixer.io/latest?base=" // "api/";

var markTextWithClass = function(regex, classStr) {
  var textNodes = getTextNodesIn(jQuery("body"));
  textNodes.replaceWith(function() {
    var text = jQuery(this)[0].textContent;
    return text.replace(regex, '<span class="' + classStr + '">$1</span>');
  });
};

var getRates = function(targetCurrency, updateElements) {
  targetCurrency = targetCurrency.toUpperCase();
  jQuery.getJSON( apiURL + targetCurrency, function(data) {
    var r;
    if (targetCurrency in rates)
      r = rates[targetCurrency];
    else {
      r = {};
      rates[targetCurrency] = r;
    }

    jQuery.extend(r, data.rates);
    jQuery.each(data.rates, function(curr, val ) {
      if (!(curr in rates))
        rates[curr] = {};
      rates[curr][targetCurrency] = 1/val;
    });

    if (updateElements)
      jQuery(elementQuery).each(convertElement(targetCurrency));
  });
};

var convertElement = function(targetCurrency) {
  targetCurrency = targetCurrency.toUpperCase();
  return function(index) {
    var text = jQuery(this).text();
    var matches = valueRegex.exec(text);
    var baseCurrency = matches[2].toUpperCase();
    var value = parseFloat(matches[3]);
    var isRange = matches[6] ? true : false;
    var valueTo = isRange ? parseFloat(matches[6]) : undefined;

    var rate = 0;

    if (baseCurrency !== targetCurrency && baseCurrency in rates && targetCurrency in rates[baseCurrency]) 
      rate = rates[baseCurrency][targetCurrency];

    text = baseCurrency + ' ' + matches[3];
    if (isRange)
      text += '-' + matches[6];
    if (rate) {
      var valueConverted = value * rate;
      text += ' (' + targetCurrency + ' ' + valueConverted.toFixed(2);
      if (isRange) {
        var valueToConverted = valueTo * rate;
        text += '-' + valueToConverted.toFixed(2);
      }
      text += ')';
    }
    jQuery(this).html(text);
  };
};

var getTextNodesIn = function(el) {
  return jQuery(el).find(":not(iframe)").addBack().contents().filter(function() {
    return this.nodeType === 3;
  });
};

var initDropDownMenu = function(parent, idStr, classStr, defaultCurr, currs) {
  if (!idStr)
    idStr = ddmIdStr;
  if (!classStr)
    classStr = ddmClassStr;
  if (!defaultCurr)
    defaultCurr = targetCcy;
  if (!currs)
    currs = currencies;

  html = '<select id="' + idStr + '" class="' + classStr + '">';
  for (var i = 0; i < currs.length; i++)
    html += '<option value="' + currs[i] + '"' + 
              (defaultCurr === currs[i] ? ' selected="selected"' : '') + '>' + 
              currs[i] + '</option>';
  html += '</select>';

  jQuery(html).on('change', function() {
    setTargetCcy(jQuery(this).val(), false);
    getRates(targetCcy, true);
  }).appendTo(parent);
};

var getTargetCcy = function(doGetRates) {
  if (!targetCcy && "localStorage" in window && window.localStorage.getItem('targetCcy'))
    setTargetCcy(window.localStorage.getItem('targetCcy'), true);
  else if (!targetCcy) {
    $.getJSON('http://ipinfo.io', function(data) {
      console.log(data);
      var country = data.country;
      var ccy = countryCcy[country];
      if (ccy) {
        console.log(ccy);
        setTargetCcy(ccy, true);
        if (doGetRates)
          getRates(targetCcy, true);
      }
    });
    targetCcy = targetCcyDefault;
  }

  if (doGetRates)
    getRates(targetCcy, true);
  return targetCcy;
};

var setTargetCcy = function(ccy, updateDDM) {
  targetCcy = ccy;
  if ("localStorage" in window)
    window.localStorage.setItem('targetCcy', targetCcy);
  if (updateDDM)
    $('#' + ddmIdStr).val(targetCcy);
  return targetCcy;
}

jQuery(function(){
  markTextWithClass(classRegex, currencyClass);
  getTargetCcy(true);
  initDropDownMenu(jQuery("#ddmContainer"));
});

var countryCcy = {
  BD: "BDT",
  BE: "EUR",
  BF: "XOF",
  BG: "BGN",
  BA: "BAM",
  BB: "BBD",
  WF: "XPF",
  BL: "EUR",
  BM: "BMD",
  BN: "BND",
  BO: "BOB",
  BH: "BHD",
  BI: "BIF",
  BJ: "XOF",
  BT: "BTN",
  JM: "JMD",
  BV: "NOK",
  BW: "BWP",
  WS: "WST",
  BQ: "USD",
  BR: "BRL",
  BS: "BSD",
  JE: "GBP",
  BY: "BYR",
  BZ: "BZD",
  RU: "RUB",
  RW: "RWF",
  RS: "RSD",
  TL: "USD",
  RE: "EUR",
  TM: "TMT",
  TJ: "TJS",
  RO: "RON",
  TK: "NZD",
  GW: "XOF",
  GU: "USD",
  GT: "GTQ",
  GS: "GBP",
  GR: "EUR",
  GQ: "XAF",
  GP: "EUR",
  JP: "JPY",
  GY: "GYD",
  GG: "GBP",
  GF: "EUR",
  GE: "GEL",
  GD: "XCD",
  GB: "GBP",
  GA: "XAF",
  SV: "USD",
  GN: "GNF",
  GM: "GMD",
  GL: "DKK",
  GI: "GIP",
  GH: "GHS",
  OM: "OMR",
  TN: "TND",
  JO: "JOD",
  HR: "HRK",
  HT: "HTG",
  HU: "HUF",
  HK: "HKD",
  HN: "HNL",
  HM: "AUD",
  VE: "VEF",
  PR: "USD",
  PS: "ILS",
  PW: "USD",
  PT: "EUR",
  SJ: "NOK",
  PY: "PYG",
  IQ: "IQD",
  PA: "PAB",
  PF: "XPF",
  PG: "PGK",
  PE: "PEN",
  PK: "PKR",
  PH: "PHP",
  PN: "NZD",
  PL: "PLN",
  PM: "EUR",
  ZM: "ZMK",
  EH: "MAD",
  EE: "EUR",
  EG: "EGP",
  ZA: "ZAR",
  EC: "USD",
  IT: "EUR",
  VN: "VND",
  SB: "SBD",
  ET: "ETB",
  SO: "SOS",
  ZW: "ZWL",
  SA: "SAR",
  ES: "EUR",
  ER: "ERN",
  ME: "EUR",
  MD: "MDL",
  MG: "MGA",
  MF: "EUR",
  MA: "MAD",
  MC: "EUR",
  UZ: "UZS",
  MM: "MMK",
  ML: "XOF",
  MO: "MOP",
  MN: "MNT",
  MH: "USD",
  MK: "MKD",
  MU: "MUR",
  MT: "EUR",
  MW: "MWK",
  MV: "MVR",
  MQ: "EUR",
  MP: "USD",
  MS: "XCD",
  MR: "MRO",
  IM: "GBP",
  UG: "UGX",
  TZ: "TZS",
  MY: "MYR",
  MX: "MXN",
  IL: "ILS",
  FR: "EUR",
  IO: "USD",
  SH: "SHP",
  FI: "EUR",
  FJ: "FJD",
  FK: "FKP",
  FM: "USD",
  FO: "DKK",
  NI: "NIO",
  NL: "EUR",
  NO: "NOK",
  NA: "NAD",
  VU: "VUV",
  NC: "XPF",
  NE: "XOF",
  NF: "AUD",
  NG: "NGN",
  NZ: "NZD",
  NP: "NPR",
  NR: "AUD",
  NU: "NZD",
  CK: "NZD",
  XK: "EUR",
  CI: "XOF",
  CH: "CHF",
  CO: "COP",
  CN: "CNY",
  CM: "XAF",
  CL: "CLP",
  CC: "AUD",
  CA: "CAD",
  CG: "XAF",
  CF: "XAF",
  CD: "CDF",
  CZ: "CZK",
  CY: "EUR",
  CX: "AUD",
  CR: "CRC",
  CW: "ANG",
  CV: "CVE",
  CU: "CUP",
  SZ: "SZL",
  SY: "SYP",
  SX: "ANG",
  KG: "KGS",
  KE: "KES",
  SS: "SSP",
  SR: "SRD",
  KI: "AUD",
  KH: "KHR",
  KN: "XCD",
  KM: "KMF",
  ST: "STD",
  SK: "EUR",
  KR: "KRW",
  SI: "EUR",
  KP: "KPW",
  KW: "KWD",
  SN: "XOF",
  SM: "EUR",
  SL: "SLL",
  SC: "SCR",
  KZ: "KZT",
  KY: "KYD",
  SG: "SGD",
  SE: "SEK",
  SD: "SDG",
  DO: "DOP",
  DM: "XCD",
  DJ: "DJF",
  DK: "DKK",
  VG: "USD",
  DE: "EUR",
  YE: "YER",
  DZ: "DZD",
  US: "USD",
  UY: "UYU",
  YT: "EUR",
  UM: "USD",
  LB: "LBP",
  LC: "XCD",
  LA: "LAK",
  TV: "AUD",
  TW: "TWD",
  TT: "TTD",
  TR: "TRY",
  LK: "LKR",
  LI: "CHF",
  LV: "EUR",
  TO: "TOP",
  LT: "LTL",
  LU: "EUR",
  LR: "LRD",
  LS: "LSL",
  TH: "THB",
  TF: "EUR",
  TG: "XOF",
  TD: "XAF",
  TC: "USD",
  LY: "LYD",
  VA: "EUR",
  VC: "XCD",
  AE: "AED",
  AD: "EUR",
  AG: "XCD",
  AF: "AFN",
  AI: "XCD",
  VI: "USD",
  IS: "ISK",
  IR: "IRR",
  AM: "AMD",
  AL: "ALL",
  AO: "AOA",
  AQ: "",
  AS: "USD",
  AR: "ARS",
  AU: "AUD",
  AT: "EUR",
  AW: "AWG",
  IN: "INR",
  AX: "EUR",
  AZ: "AZN",
  IE: "EUR",
  ID: "IDR",
  UA: "UAH",
  QA: "QAR",
  MZ: "MZN"
};