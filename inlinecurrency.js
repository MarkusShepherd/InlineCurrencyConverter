var rates = {};
var regex = /(^|\W)([A-Za-z]{3})(\d+(\.\d{2})?)($|\W)/im

var convertElement = function(targetCurrency) {
  targetCurrency = targetCurrency.toUpperCase();
  return function(index) {
    var text = $( this ).text();
    var matches = regex.exec(text);
    var baseCurrency = matches[2].toUpperCase();
    var value = parseFloat(matches[3]);

    if (baseCurrency === targetCurrency)
      return;

    var rate;

    if (baseCurrency in rates && targetCurrency in rates[baseCurrency]) 
      rate = rates[baseCurrency][targetCurrency];
    else {
      // TODO make XHR to fill rates
    }

    var valueConverted = value * rate;

    text = baseCurrency + value + ' (' + targetCurrency + valueConverted + ')';
    $( this ).html(text);
  };
};