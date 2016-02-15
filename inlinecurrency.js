var rates = {};
var currencies = [
  "AUD", "BGN", "BRL", "CAD", "CHF", 
  "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", 
  "HRK", "HUF", "IDR", "ILS", "INR", 
  "JPY", "KRW", "MXN", "MYR", "NOK", 
  "NZD", "PHP", "PLN", "RON", "RUB", 
  "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
];
var valueRegex = /(^|\W)([A-Za-z]{3})(\d+(\.\d{2})?)(-(\d+(\.\d{2})?))?($|\W)/im;
var classRegex = /([A-Za-z]{3}\d+(\.\d{2})?(-\d+(\.\d{2})?)?)/igm;
var currencyClass = "currency";
var elementQuery = "." + currencyClass;
var targetCurr = "EUR";
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

    text = baseCurrency + matches[3];
    if (isRange)
      text += '-' + matches[6];
    if (rate) {
      var valueConverted = value * rate;
      text += ' (' + targetCurrency + valueConverted.toFixed(2);
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

  jQuery(html).on('change', function() {
    targetCurr = jQuery(this).val();
    getRates(targetCurr, true);
  }).appendTo(parent);
};

jQuery(function(){
  markTextWithClass(classRegex, currencyClass);
  getRates(targetCurr, true);
  initDropDownMenu(jQuery("#ddmContainer"), ddmIdStr, ddmClassStr);
});
