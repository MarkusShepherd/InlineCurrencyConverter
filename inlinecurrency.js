var rates = {};
var currencies = [
  "AUD", "BGN", "BRL", "CAD", "CHF", 
  "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", 
  "HRK", "HUF", "IDR", "ILS", "INR", 
  "JPY", "KRW", "MXN", "MYR", "NOK", 
  "NZD", "PHP", "PLN", "RON", "RUB", 
  "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
];
var valueRegex = /(^|\W)([A-Za-z]{3})(\d+(\.\d{2})?)($|\W)/im;
var classRegex = /([A-Za-z]{3}\d+(\.\d{2})?)/igm;
var currencyClass = "currency";
var elementQuery = "." + currencyClass;
var targetCurr = "EUR";
var ddmIdStr = "currencyDDM";
var ddmClassStr = "currencyDDM";

var markTextWithClass = function(regex, classStr) {
  var textNodes = getTextNodesIn($("body"));
  textNodes.replaceWith(function() {
    var text = $(this)[0].textContent;
    return text.replace(regex, '<span class="' + classStr + '">$1</span>');
  });
};

var getRates = function(targetCurrency, updateElements) {
  targetCurrency = targetCurrency.toUpperCase();
  $.getJSON( "http://api.fixer.io/latest?base=" + targetCurrency, function(data) {
    var r;
    if (targetCurrency in rates)
      r = rates[targetCurrency];
    else {
      r = {};
      rates[targetCurrency] = r;
    }

    $.extend(r, data.rates);
    $.each(data.rates, function(curr, val ) {
      if (!(curr in rates))
        rates[curr] = {};
      rates[curr][targetCurrency] = 1/val;
    });

    if (updateElements)
      $(elementQuery).each(convertElement(targetCurrency));
  });
};

var convertElement = function(targetCurrency) {
  targetCurrency = targetCurrency.toUpperCase();
  return function(index) {
    var text = $(this).text();
    var matches = valueRegex.exec(text);
    var baseCurrency = matches[2].toUpperCase();
    var value = parseFloat(matches[3]);

    var rate = 0;

    if (baseCurrency !== targetCurrency && baseCurrency in rates && targetCurrency in rates[baseCurrency]) 
      rate = rates[baseCurrency][targetCurrency];

    text = baseCurrency + value.toFixed(2)
    if (rate) {
      var valueConverted = value * rate;
      text += ' (' + targetCurrency + valueConverted.toFixed(2) + ')';
    }
    $(this).html(text);
  };
};

var getTextNodesIn = function(el) {
  return $(el).find(":not(iframe)").addBack().contents().filter(function() {
    return this.nodeType === 3;
  });
};

var initDropDownMenu = function(parent, idStr, classStr, defaultCurr, currs) {
  if (!defaultCurr)
    defaultCurr = targetCurr;
  if (!currs)
    currs = currencies;

  html = '<select id="' + idStr + '" class="' + classStr + '">';
  for (var i = 0; i < currs.length; i++)
    html += '<option value="' + currs[i] + '"' + 
              (defaultCurr === currs[i] ? ' selected="selected"' : '') + '>' + 
              currs[i] + '</option>';
  html += '</select>';

  $(html).on('change', function() {
    targetCurr = $(this).val();
    getRates(targetCurr, true);
  }).appendTo(parent);
};

$(function(){
  markTextWithClass(classRegex, currencyClass);
  getRates(targetCurr, true);
  initDropDownMenu($("#ddmContainer"), ddmIdStr, ddmClassStr);
});
