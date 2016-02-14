var rates = {};
var valueRegex = /(^|\W)([A-Za-z]{3})(\d+(\.\d{2})?)($|\W)/im;
var classRegex = /([A-Za-z]{3}\d+(\.\d{2})?)/igm;
var currencyClass = "currency";
var elementQuery = "." + currencyClass;
var targetCurr = "EUR";

var markTextWithClass = function(regex, classStr) {
  var textNodes = getTextNodesIn($("body"));
  textNodes.replaceWith(function() {
    var text = $(this)[0].textContent;
    console.log(text);
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

    if (baseCurrency === targetCurrency)
      return;

    var rate;

    if (baseCurrency in rates && targetCurrency in rates[baseCurrency]) 
      rate = rates[baseCurrency][targetCurrency];
    else
      return;

    var valueConverted = value * rate;

    text = baseCurrency + value.toFixed(2) + ' (' + targetCurrency + valueConverted.toFixed(2) + ')';
    $(this).html(text);
  };
};

var getTextNodesIn = function(el) {
  return $(el).find(":not(iframe)").addBack().contents().filter(function() {
    return this.nodeType === 3;
  });
};

$(function(){
  markTextWithClass(classRegex, currencyClass);
  getRates(targetCurr, true);
});
