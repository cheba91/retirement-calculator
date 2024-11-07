//------------------- Range sliders charting -------------------//
const chartHeight = 32;
let fixedBarCount = 49;
const optimalValues = {};
const calcSelectors = [
  'retirement-age',
  'expectancy',
  'expected-stocks',
  'expected-bonds',
  'expected-btc',
  'expected-cash',
  'growth-rate',
  'retirement-income',
  'retirement-expenses',
  'capital-gains',
  'inflation-rate',
];
const calcElementsAndRanges = [];
const inputValues = {
  'btc-price': 65000,
};

//------------------- Functions -------------------//
const onlyNumbers = (value) => +String(value).replace(/\D/g, '');
const formatPercent = (value) => `${value}%`;
const formatToFixed = (value, decimals = 0) => +value.toFixed(decimals);
const formatCurrencyShort = (value, decimal = 0) => {
  if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(1)}T`;
  else if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  else if (value >= 1000000) return `$${(value / 1000000).toFixed(decimal)}M`;
  else if (value >= 1000) return `$${(value / 1000).toFixed()}K`;
  else return `$${value}`;
};
const formatCurrency = (value, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

const updateRangeSliderScale = (value, currentValue, minValue, maxValue, optimalValue, isReversedScale, index) => {
  const barWidth = (maxValue - minValue) / (fixedBarCount - 1);
  const optimalValueBarIndex = Math.round((optimalValue - minValue) / barWidth);

  // console.log('optimalValue', optimalValue, 'optimalValueBarIndex', optimalValueBarIndex, 'Current index', index);

  // Gray color the optimal index
  if (index === optimalValueBarIndex) return '#E9EBF2';
  // If reversed, color green to red
  else if (isReversedScale) {
    // Bars to the left of optimal bar
    if (index < optimalValueBarIndex) {
      const diff = (optimalValueBarIndex - index) / optimalValueBarIndex;
      const opacity = 0.24 + diff * 0.6;
      return `rgba(57, 158, 106, ${Math.min(opacity, 1)})`;
    } else {
      // Bars to the right of optimal bar
      const diff = (index - optimalValueBarIndex) / (fixedBarCount - optimalValueBarIndex);
      const opacity = 0.24 + diff * 0.6;
      return `rgba(255, 91, 59, ${Math.min(opacity, 1)})`;
    }
  } else {
    // Bars to the left of optimal bar
    if (index < optimalValueBarIndex) {
      const diff = (optimalValueBarIndex - index) / optimalValueBarIndex;
      const opacity = 0.24 + diff * 0.6;
      return `rgba(255, 91, 59, ${Math.min(opacity, 1)})`;
    } else {
      // Bars to the right of optimal bar
      const diff = (index - optimalValueBarIndex) / (fixedBarCount - optimalValueBarIndex);
      const opacity = 0.24 + diff * 0.6;
      return `rgba(57, 158, 106, ${Math.min(opacity, 1)})`;
    }
  }
};

const updateAllRangesliders = () => {
  // console.log(optimalValues);
  // Update all range sliders
  calcElementsAndRanges.forEach((element) => {
    const { selector, slider, min, max, step } = element;
    const currentValue = +slider.value;
    const barWidth = (max - min) / (fixedBarCount - 1);
    const optimalValue = optimalValues[selector];
    const isReversedScale = optimalValues[`${selector}-reversed`];
    const bars = optimalValues[`${selector}-bars`];

    bars.attr('fill', (d, i) => {
      const value = min + barWidth * i;
      return updateRangeSliderScale(value, currentValue, min, max, optimalValue, isReversedScale, i);
    });
  });
};

// Update the handle position and value
const updateHandle = (selector, value) => {
  // console.log('updateHandle', selector, value);
  const rangeValue = document.querySelector(`#${selector} .calc__slider__scale__item.is--mid`);
  const range = document.querySelector(`#${selector} input[type="range"]`);
  const percent = (value - range.min) / (range.max - range.min);
  const rangeWidth = range.offsetWidth;
  const handlePosition = percent * rangeWidth;
  const fullPercent = percent * 100;

  if (rangeValue.getAttribute('is-percent') === 'true') rangeValue.innerText = formatPercent(value);
  else if (rangeValue.getAttribute('is-usd') === 'true') rangeValue.innerText = formatCurrencyShort(value);
  else rangeValue.innerText = onlyNumbers(value);

  if (fullPercent > 97) rangeValue.nextElementSibling.style.opacity = 0;
  if (fullPercent < 3) rangeValue.previousElementSibling.style.opacity = 0;
  if (fullPercent > 3 && fullPercent < 97) {
    rangeValue.nextElementSibling.style.opacity = 1;
    rangeValue.previousElementSibling.style.opacity = 1;
  }

  rangeValue.style.left = handlePosition + 'px';
  rangeValue.style.transform = `translateX(-${fullPercent}%)`;
};

// Main function to initialize graphs and sliders
const initRangeSliders = () => {
  calcSelectors.forEach((selector) => {
    const sliderContainer = document.querySelector(`#${selector}`);
    if (!sliderContainer) {
      console.error(`Slider container not found for selector: ${selector}`);
      return;
    }

    const graphContainer = sliderContainer.querySelector('.calc__graph');
    if (!graphContainer) {
      console.error(`Graph container not found for selector: ${selector}`);
      return;
    }

    let chartWidth = graphContainer.clientWidth;
    const gap = window.innerWidth < 768 ? 3 : 4;

    const graph = d3.select(graphContainer).append('svg').attr('width', chartWidth).attr('height', chartHeight);

    const slider = sliderContainer.querySelector('.calc__slider-range');
    if (!slider) {
      console.error(`Slider not found for selector: ${selector}`);
      return;
    }

    const minValue = +slider.min;
    const maxValue = +slider.max;

    const data = d3.range(fixedBarCount);

    // Calculate width of each bar, including the gap
    const barWidth = (chartWidth - gap * (fixedBarCount - 1)) / fixedBarCount;

    // Update xScale to reflect the bar positions, including the gap
    const xScale = d3
      .scaleBand()
      .domain(data)
      .range([0, chartWidth])
      .paddingInner(gap / (barWidth + gap)); // This ensures the gap is accounted for

    // Create bars with adjusted width and gap
    const bars = graph
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d))
      .attr('y', 0)
      .attr('width', barWidth) // Set the width of the bar
      .attr('height', chartHeight);

    // Save bars for coloring later
    optimalValues[`${selector}-bars`] = bars;

    const updateBars = () => {
      const currentValue = +slider.value;
      // bars.attr('fill', (d, i) => {
      // const value = minValue + (maxValue - minValue) * (i / (fixedBarCount - 1));
      // return updateRangeSliderScale(value, currentValue, minValue, maxValue, optimalValues[selector], optimalValues[`${selector}-reversed`], i);
      // return updateRangeSliderScale(value, currentValue, minValue, maxValue, i);
      // });
      updateAllRangesliders();
      updateHandle(selector, currentValue);
    };

    let debounceTimer;
    slider.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const value = slider.value;
        inputValues[selector] = onlyNumbers(value);
        updateBars();
        const inputElement = sliderContainer.querySelector(`#${selector}-i`);
        if (inputElement) {
          if (inputElement.getAttribute('is-percent') === 'true') inputElement.value = formatPercent(value);
          else if (inputElement.getAttribute('is-usd') === 'true') inputElement.value = formatCurrency(value);
          else inputElement.value = onlyNumbers(value);
        }
        runCalculations();
      }, 10); // Delay to debounce rapid changes
    });

    // Initial update
    updateBars();

    // Handle window resize
    const resizeGraph = () => {
      chartWidth = graphContainer.clientWidth;
      const barWidth = (chartWidth - gap * (fixedBarCount - 1)) / fixedBarCount;
      xScale.range([0, chartWidth]);
      bars.attr('x', (d) => xScale(d)).attr('width', barWidth);
      updateBars();
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeGraph, 100);
    });

    // Update range slider when input field changes
    const inputElement = sliderContainer.querySelector(`#${selector}-i`);
    if (inputElement) {
      inputElement.addEventListener('blur', () => {
        setTimeout(() => {
          inputValues[selector] = onlyNumbers(inputElement.value);
          slider.value = onlyNumbers(inputElement.value);
          updateBars();
        }, 10);
      });
    }
  });
};

//------------------- Initialize -------------------//
window.addEventListener('load', () => {
  if (window.innerWidth < 768) fixedBarCount = 35;
  initRangeSliders();

  // Range sliders
  calcSelectors.forEach((selector) => {
    const slider = document.querySelector(`#${selector} .calc__slider-range`);
    calcElementsAndRanges.push({
      selector,
      slider,
      element: slider,
      min: +slider.getAttribute('min'),
      max: +slider.getAttribute('max'),
      step: +slider.getAttribute('step'),
    });
    if (slider) {
      slider.dispatchEvent(new Event('input'));
      runCalculations();
    }
  });

  // Age fields
  const ageInputs = document.querySelectorAll('.calc-field[is-age="true"]');
  ageInputs.forEach((input) => {
    const maxAge = +input.getAttribute('max-age');
    const minAge = +input.getAttribute('min-age');
    input.addEventListener('input', () => (input.value = onlyNumbers(input.value)));

    input.addEventListener('blur', () => {
      let value = onlyNumbers(input.value);
      if (value > maxAge) value = maxAge;
      if (value < minAge) value = minAge;
      input.value = value;
      inputValues[input.id] = value;

      const rangeInput = input.closest('.calc-range__wrap')?.querySelector('.calc__slider-range');
      if (rangeInput) {
        rangeInput.value = value;
        rangeInput.dispatchEvent(new Event('input'));
      } else runCalculations();

      console.log(input.id, 'input value: ', input.value, 'max age: ', maxAge, 'min age:', minAge, 'used value: ', value);
    });
  });

  // Percent fields
  const percentInputs = document.querySelectorAll('.calc-field[is-percent="true"]');
  percentInputs.forEach((input) => {
    const maxPercent = +input.getAttribute('max-percent');
    const minPercent = +input.getAttribute('min-percent');

    input.addEventListener('blur', () => {
      let value = onlyNumbers(input.value);
      if (value > maxPercent) value = maxPercent;
      if (value < minPercent) value = minPercent;
      input.value = formatPercent(value);
      inputValues[input.id] = value / 100;

      const rangeInput = input.closest('.calc-range__wrap')?.querySelector('.calc__slider-range');
      if (rangeInput) {
        rangeInput.value = value;
        rangeInput.dispatchEvent(new Event('input'));
      } else runCalculations();

      console.log(input.id, 'input value: ', input.value, 'only numbers: ', onlyNumbers(input.value), 'used value: ', value / 100);
    });
  });

  // Currency fields
  const currencyInputs = document.querySelectorAll('.calc-field[is-usd="true"]');
  currencyInputs.forEach((input) => {
    const maxUsd = +input.getAttribute('max-usd');
    const minUsd = +input.getAttribute('min-usd');

    input.addEventListener('blur', () => {
      let value = onlyNumbers(input.value);
      if (value > maxUsd) value = maxUsd;
      if (value < minUsd) value = minUsd;
      input.value = formatCurrency(value);
      inputValues[input.id] = value;

      const rangeInput = input.closest('.calc-range__wrap')?.querySelector('.calc__slider-range');
      if (rangeInput) {
        rangeInput.value = value;
        rangeInput.dispatchEvent(new Event('input'));
      } else runCalculations();

      console.log(input.id, 'input value: ', input.value, 'only numbers: ', onlyNumbers(input.value), 'used value: ', value);
    });
  });

  // Save radio values
  document.querySelectorAll('.calc-radio input').forEach((radio) => {
    radio.addEventListener('change', () => {
      inputValues[radio.name] = radio.value;
      runCalculations();
      console.log(radio.name, 'radio value: ', radio.value);
      // document.querySelector("input[type='range']").dispatchEvent(new Event('input'));
    });
  });

  // Set initial values
  document.querySelectorAll('input[init-value]').forEach((input) => {
    input.value = input.getAttribute('init-value');
    input.dispatchEvent(new Event('blur'));
    runCalculations();
  });

  // Set initial radio values
  document.querySelectorAll("input[type='radio'][radio-initial='true']").forEach((radio) => {
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    runCalculations();
  });

  // "Plan type" radios
  document.querySelectorAll(`.calc-radio input[name="plan-type"]`).forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedPlanType = document.querySelector('.calc-radio input[name="plan-type"]:checked').value;
      if (selectedPlanType === 'custom') {
        document.querySelector('#expected-btc').classList.remove('is--disabled');
      } else {
        document.querySelector('#expected-btc').classList.add('is--disabled');
      }
    });
  });

  window.dispatchEvent(new Event('resize'));
});
//------------------ Calculations ------------------//
//------------------ S2F Model prices
// prettier-ignore
const btcPricesS2F = {2023:83667.67557239954,2024:686398.0127483337,2025:703741.9524243205,2026:721375.6236071566,2027:739301.4262968419,2028:5986997.015654025,2029:6060174.083947013,2030:6133945.0152537,2031:6208312.209574085,2032:49965761.24291532,2033:50266224.53526536,2034:50567889.953642786,2035:50870759.89804761,2036:408181178.5400824,2037:409398694.1478387,2038:410618628.40764976,2039:411840983.7195157,2040:3299624560.159754,2041:3304526099.867491,2042:3309432491.2793384,2043:3314343736.795295,2044:26534409444.738514,2045:26554078710.52289,2046:26573757694.115482,2047:26593446397.916298,2048:212826355165.1583,2049:212905158594.60263,2050:212983981474.06342,2051:213062823805.94064,2052:1704818018138.2832,2053:1705133484741.0745,2054:1705448990258.2983,2055:1705764534692.3552,2056:13647378572031.568,2057:13648640944365.16,2058:13649903394542.018,2059:13651165922564.541,2060:109214377726149.42,2061:109219428227481.05,2062:109224478884513.6,2063:109229529697249.48,2064:873856441296055.4,2065:873876645325528.8,2066:873896849666418.5,2067:873917054318726.8,2068:6991417254093309,2069:6991498074259649,2070:6991578895048836,2071:6991659716460872,2072:55933601019203670,2073:55933924307966080,2074:55934247597974184,2075:55934570889228010,2076:447477860282576500,2077:447479153453820400,2078:447480446627555650,2079:447481739803782400,2080:3579859091142640000,2081:3579864263860004400,2082:3579869436582351400,2083:3579874609309681000,2084:28639017565401715000,2085:28639038256335950000,2086:28639058947280150000,2087:28639079638234317000,2088:229112719869721100000,2089:229112802633587600000,2090:229112885397474000000,2091:229112968161380340000,2092:1.832904076346728e21,2093:1.832904407402453e21,2094:1.832904738458218e21,2095:1.832905069514023e21,2096:1.4663241880335521e22,2097:1.4663243204558938e22,2098:1.4663244528782437e22,2099:1.4663245853006015e22,2100:1.1730597212094267e23,2101:1.1730597741783739e23,2102:1.1730598271473226e23,2103:1.173059880116273e23,2104:9.384479252805988e23,2105:9.384479464681798e23,2106:9.38447967655761e23,2107:9.384479888433425e23,2108:7.507583995497068e24,2109:7.507584080247396e24,2110:7.507584164997724e24,2111:7.507584249748053e24,2112:6.006067433698574e25,2113:6.0060674675987065e25,2114:6.006067501498839e25,2115:6.006067535398971e25,2116:4.8048540418792296e26,2117:4.8048540554392825e26,2118:4.804854068999335e26,2119:4.804854082559388e26,2120:3.8438832714715317e27,2121:3.843883276895553e27,2122:3.8438832823195746e27,2123:3.843883287743595e27,2124:3.075106632364485e28,2125:3.075106634586495e28,2126:3.075106636808505e28,2127:3.075106639030515e28,2128:2.460085306062612e29,2129:2.460085306646612e29,2130:2.460085307230612e29,2131:2.460085307814612e29,2132:1.9680682457644896e30,2133:1.9680682458004896e30,2134:1.9680682458364896e30,2135:1.9680682458724896e30,2136:1.5744545966091917e31,2137:1.5744545966101917e31,2138:1.5744545966111917e31,2139:1.5744545966121917e31,2140:1.2595636772888455e32,2141:1.2595636772889455e32,2142:1.2595636772890455e32,2143:1.2595636772891455e32,2144:1.0076509418312764e33,2145:1.0076509418312864e33,2146:1.0076509418312964e33,2147:1.0076509418313064e33,2148:8.06120753465051e33,2149:8.06120753465052e33,2150:8.06120753465053e33,
};

//---------------- Power law
// prettier-ignore
const btcPricesPowerLaw={2010:0.03010628391340072,2011:1.1665179071089278,2012:9.907153518999726,2013:45.19867119834384,2014:146.69756182579547,2015:383.8690959546252,2016:865.7538110434199,2017:1751.2974860018503,2018:3260.172897171796,2019:5684.040358193767,2020:9398.205992247365,2021:14873.644841217618,2022:22689.361763417706,2023:33545.06742296482,2024:48274.150009732526,2025:67856.9259484952,2026:93434.15495479168,2027:126320.80650542538,2028:168020.06620561847,2029:220237.57171875774,2030:284895.86892683443,2031:364149.07984625496,2032:460397.7745621203,2033:576304.0400856528,2034:714806.7396007673,2035:879136.956059804,2036:1072833.6145261182,2037:1299759.2780504897,2038:1564116.11221663,2039:1870462.0138040376,2040:2223726.899298489,2041:2629229.1492358693,2042:3092692.20459768,2043:3620261.3116871836,2044:4218520.412109992,2045:4894509.174658779,2046:5655740.166065894,2047:6510216.157738416,2048:7466447.56572719,2049:8533470.021312093,2050:9720862.069704706,2051:11038762.99447847,2052:12497890.765443347,2053:14109560.10777605,2054:15885700.690305535,2055:17838875.430944793,2056:19982298.91732885,2057:22329855.9408026,2058:24896120.141967528,2059:27696372.76606204,2060:30746621.526514836,2061:34063619.575065486,2062:37664884.57690828,2063:41568717.88935906,2064:45794223.84260448,2065:50361329.121127106,2066:55290802.24446532,2067:60604273.145984486,2068:66324252.848392956,2069:72474153.23477471,2070:79078306.9139389,2071:86161987.17892468,2072:93751428.05753744,2073:101873844.45382282,2074:110557452.37940992,2075:119831489.27368927,2076:129726234.41182208,2077:140273029.3995864,2078:151504298.75413832,2079:163453570.5697123,2080:176155497.2673918,2081:189645876.42804408,2082:203961671.7075677,2083:219141033.83361897,2084:235223321.68296367,2085:252249123.43869257,2086:270260277.82650423,2087:289299895.4292663,2088:309412380.07914644,2089:330643450.3265579,2090:353040160.9852152,2091:376650924.7525929,2092:401525533.90509224,2093:427715182.06731635,2094:455272486.0546629,2095:484251507.78876597,2096:514707776.2849914,2097:546698309.7114946,2098:580281637.519149,2099:615517822.6418598,2100:652468483.7665489,2101:691196817.6723416,2102:731767621.6383815,2103:774247315.91971,2104:818703966.2906268,2105:865207306.6551566,2106:913828761.7238742,2107:964641469.7568666,2108:1017720305.3720078,2109:1073141902.4184024,2110:1130984676.914149,2111:1191328850.0483358,2112:1254256471.2464457,2113:1319851441.2990417,2114:1388199535.5529408,2115:1459388427.1647863,2116:1533507710.416309,2117:1610648924.0909843,2118:1690905574.9117064,2119:1774373161.0388107,2120:1861149195.6284683,2121:1951333230.450664,2122:2045026879.5664902,2123:2142333843.06452,/**/2124:2243359930.8555956,2125:2348213187.2468762,2126:2457003848.429197,2127:2569844421.318914,2128:2686849762.5737424,2129:2808137152.919356,2130:2933826241.2336226,2131:3064039183.7189164,2132:3198900557.6991563,2133:3338537479.274699,2134:3483079594.9370136,2135:3632659358.393442,2136:3787412122.3454347,2137:3947476186.1085377,2138:4112982582.5432158,2139:4284065241.7017865,2140:4460850714.863287,2141:4643468531.0255375,2142:4832041129.041158,2143:5026693943.046582,2144:5227555547.292991,2145:5434757559.012363,2146:5648434824.287295,2147:5868725423.872905,2148:6095760671.162726,2149:6329675264.029956,2150:6570607324.946248,
};

// Constants
const currentYear = new Date().getFullYear();
const currentBtcPrice = 65000;

//------------------ Saylor' s 2024 Bitcoin Model prices
const btcPricesBtc24 = (() => {
  const startYear = currentYear;
  const startingPercent = 50;
  const minPercent = 20;
  const percentDecrement = 2.5;
  const prices = { [startYear]: currentBtcPrice };

  for (let i = 1; i <= 121; i++) {
    const percent = Math.max(startingPercent - (i - 1) * percentDecrement, minPercent);
    const previousPrice = prices[startYear + (i - 1)];
    const currentYear = startYear + i;
    prices[currentYear] = previousPrice * (1 + percent / 100);
  }

  return prices;
})();

//------------------ BTC prices for custom percent increase per year
const btcPricesCustom = (percent) => {
  const prices = { [currentYear]: currentBtcPrice };
  for (let i = 1; i <= 150; i++) {
    const previousPrice = prices[currentYear + i - 1];
    prices[currentYear + i] = previousPrice * (1 + percent / 100);
  }
  return prices;
};

const sidebarElements = {};
document.addEventListener('DOMContentLoaded', () => {
  sidebarElements.retireBy = document.querySelector('#res-retire-by');
  sidebarElements.portfolioAtRetirement = document.querySelector('#res-portfolio-retirement');
  sidebarElements.btcAtRetirement = document.querySelector('#res-btc-retirement');
  sidebarElements.btcPriceAtRetirement = document.querySelector('#res-btc-price-retirement');
  sidebarElements.monthlyBudget = document.querySelector('#res-budget-monthly');
  sidebarElements.annualBudget = document.querySelector('#res-budget-year');
  sidebarElements.yearsOfWithdrawals = document.querySelector('#res-years-of-withdrawals');
  sidebarElements.portfolioAtDeath = document.querySelector('#res-portfolio-at-death');
  sidebarElements.successMessage = document.querySelector('.notification[notification="success"]');
  sidebarElements.errorMessage = document.querySelector('.notification[notification="fail"]');
  sidebarElements.mobileUnderline = document.querySelector('.calc-mobile__underline');
});

const runCalculations = () => {
  // Check if all required input values are present
  // prettier-ignore
  const requiredInputs = ['btc-price','current-age-i','balance-stocks','balance-bonds','balance-btc','balance-other','additional-stocks','additional-bonds','additional-btc','additional-other','retirement-age','expectancy','expected-stocks','expected-bonds','expected-cash','expected-btc','growth-rate','retirement-income','retirement-expenses','capital-gains','inflation-rate','plan-type','btc-account',/*'retirement-strategy-sell', 'retirement-strategy-order', */
   ];

  console.log('Run calcs');

  const missingInputs = requiredInputs.filter((input) => !inputValues[input] && inputValues[input] !== 0);
  if (missingInputs.length > 0) {
    // console.log(`Missing input values: ${missingInputs.join(', ')}`);
    // window.alert('Please fill in all required fields');
    return;
  }

  const currentAge = inputValues['current-age-i'];

  //------------------ Projected portfolio at retirement
  const getProjectedPortfolioAtRetirement = (totalBalances, yearOfRetirement) => totalBalances[yearOfRetirement];

  //------------------ Projected portfolio at death
  const getProjectedPortfolioAtDeath = (totalBalances, yearOfDeath) => totalBalances[yearOfDeath];

  //------------------ Annual Expenses at retirement
  const getAnnualBudgetAtRetirement = (annualExpenses, yearOfRetirement) => annualExpenses[yearOfRetirement];

  //------------------ BTC price at retirement
  const getBitcoinPriceAtRetirement = (btcPrices, yearOfRetirement) => btcPrices[yearOfRetirement];

  //------------------ BTC balance at retirement
  const getBtcBalanceAtRetirement = (btcBalance, yearOfRetirement) => btcBalance[yearOfRetirement];

  //------------------ Years of sustainable withdrawals
  const getYearsOfSustainableWithdrawals = (retirementSuccessStatus, yearOfRetirement, yearOfDeath) => {
    let years = 0;
    for (let i = yearOfRetirement; i <= yearOfDeath; i++) {
      if (retirementSuccessStatus[i]) years++;
      else break;
    }
    return years;
  };

  //------------------ Calculate Annual Savings or Expenses
  const getAnnualSavingsOrExpenses = (
    startingValue,
    yearOfRetirement,
    expectancy,
    isExpense = false,
    stopAtRetirement = true,
    growthRate = inputValues['growth-rate'],
    inflationRate = inputValues['inflation-rate']
  ) => {
    const annualSavings = {};
    annualSavings[currentYear] = startingValue;
    for (let i = 1; i <= expectancy; i++) {
      const previousYear = annualSavings[currentYear + (i - 1)];
      const localCurrentYear = currentYear + i;
      if (stopAtRetirement && localCurrentYear > yearOfRetirement) continue;
      const savings = previousYear * (1 + (isExpense ? inflationRate : growthRate) / 100);
      annualSavings[localCurrentYear] = savings;
    }
    return annualSavings;
  };

  //------------------ All BTC balances
  const getAllBtcBalances = (expectedBtc) => {
    const btcBalances = {};
    btcBalances[currentYear] = inputValues['balance-btc'];
    if (inputValues['plan-type'] === 'btc24') return btcPricesBtc24;
    else if (inputValues['plan-type'] === 'power-law') return btcPricesPowerLaw;
    else if (inputValues['plan-type'] === 'custom') return btcPricesCustom(expectedBtc);
    else return btcPricesS2F;
  };

  //------------------ Withdrawals needed
  const getWithdrawalsNeeded = (expenses, accountType, yearOfRetirement, expectancy, capitalGains = inputValues['capital-gains']) => {
    const withdrawalsNeeded = {};
    for (let i = 1; i <= expectancy; i++) {
      const localCurrentYear = currentYear + i;
      // Get user age in local year
      const localAge = currentAge + i;
      // Capital gains tax doesn't apply until year 60
      const formattedCapitalGains = localAge >= 60 ? 0 : capitalGains;
      if (localCurrentYear > yearOfRetirement) {
        let withdrawal;
        if (accountType === 'none') withdrawal = expenses[localCurrentYear] / (1 - formattedCapitalGains / 100);
        // if (accountType === 'none') withdrawal = expenses[localCurrentYear] / (1 - capitalGains / 100);
        else withdrawal = expenses[localCurrentYear];

        withdrawalsNeeded[localCurrentYear] = withdrawal;
      } else withdrawalsNeeded[localCurrentYear] = 0;
    }
    return withdrawalsNeeded;
  };

  //------------------ Withdrawals taxes paid
  // const getWithdrawalsTaxesPaid = (withdrawalsNeeded, expectancy, yearOfRetirement, capitalGains = inputValues['capital-gains']) => {
  //   const withdrawalsTaxesPaid = {};
  //   for (let i = 1; i <= expectancy; i++) {
  //     const localCurrentYear = currentYear + i;
  //     if (localCurrentYear >= yearOfRetirement) {
  //       const withdrawal = withdrawalsNeeded[localCurrentYear];
  //       const taxesPaid = (withdrawal * capitalGains) / 100;
  //       withdrawalsTaxesPaid[localCurrentYear] = taxesPaid;
  //     } else withdrawalsTaxesPaid[localCurrentYear] = 0;
  //   }
  //   return withdrawalsTaxesPaid;
  // };

  //------------------ Cash balances
  const getCashBalances = (annualCashSavings, expectancy) => {
    const cashBalances = {};
    cashBalances[currentYear] = inputValues['balance-other'];
    const expectedGrowthRate = inputValues['expected-cash'];
    for (let i = 1; i <= expectancy; i++) {
      const previousYear = cashBalances[currentYear + (i - 1)];
      const localCurrentYear = currentYear + i;
      const savings = annualCashSavings[localCurrentYear];
      const growth = previousYear * (1 + expectedGrowthRate / 100);
      cashBalances[localCurrentYear] = growth + savings;
    }
    return cashBalances;
  };
  //------------------ Update sidebar Results
  const updateSidebarResults = (
    currentAge,
    btcBalance,
    btcPrices,
    annualBudgetAtRetirement,
    retirementSuccessStatus,
    projectedPortfolioAtDeath,
    projectedPortfolioAtRetirement
  ) => {
    setTimeout(() => {
      const btcPriceAtRetirement = getBitcoinPriceAtRetirement(btcPrices, currentYear + (inputValues['retirement-age'] - currentAge));
      sidebarElements.retireBy && (sidebarElements.retireBy.value = inputValues['retirement-age']);
      sidebarElements.portfolioAtRetirement && (sidebarElements.portfolioAtRetirement.value = formatCurrency(projectedPortfolioAtRetirement));
      sidebarElements.btcAtRetirement &&
        (sidebarElements.btcAtRetirement.value =
          '₿' +
          formatCurrency(
            getBtcBalanceAtRetirement(btcBalance, currentYear + (inputValues['retirement-age'] - currentAge)) / btcPriceAtRetirement,
            3
          ).replace('$', ''));
      sidebarElements.btcPriceAtRetirement && (sidebarElements.btcPriceAtRetirement.value = formatCurrency(btcPriceAtRetirement));
      sidebarElements.monthlyBudget && (sidebarElements.monthlyBudget.value = formatCurrency(annualBudgetAtRetirement / 12));
      sidebarElements.annualBudget && (sidebarElements.annualBudget.value = formatCurrency(annualBudgetAtRetirement));
      sidebarElements.yearsOfWithdrawals &&
        (sidebarElements.yearsOfWithdrawals.value = formatToFixed(
          getYearsOfSustainableWithdrawals(
            retirementSuccessStatus,
            currentYear + (inputValues['retirement-age'] - currentAge),
            currentYear - currentAge + inputValues['expectancy']
          ),
          1
        ));
      sidebarElements.portfolioAtDeath && (sidebarElements.portfolioAtDeath.value = formatCurrency(projectedPortfolioAtDeath));
      if (projectedPortfolioAtDeath <= 0) {
        sidebarElements.successMessage.classList.add('hidden');
        sidebarElements.errorMessage.classList.remove('hidden');
        sidebarElements.mobileUnderline.classList.remove('is--green');
      } else {
        sidebarElements.successMessage.classList.remove('hidden');
        sidebarElements.errorMessage.classList.add('hidden');
        sidebarElements.mobileUnderline.classList.add('is--green');
      }
    }, 50);
  };
  //------------------ Asset total balance, all individual balances and all sold balances
  const getAllBalancesAndSold = (
    withdrawalsNeeded,
    otherIncome,
    annualBtcSavings,
    annualStocksSavings,
    annualBondsSavings,
    annualCashSavings,
    expectancy,
    yearOfRetirement,
    expectedStocksGrowthRate,
    expectedBondsGrowthRate,
    expectedCashGrowthRate,
    expectedBtcGrowthRate,
    logResults = false
  ) => {
    const totalBalances = {};
    const btcBalance = {};
    const btcSold = {};
    const stocksBalance = {};
    const stocksSold = {};
    const bondsBalance = {};
    const bondsSold = {};
    const cashIncomeBalance = {};
    const btcPrices = getAllBtcBalances(expectedBtcGrowthRate);
    const retirementSuccessStatus = {};
    const portfolio60_40 = {};

    const stocksGrowthRate = expectedStocksGrowthRate;
    const bondsGrowthRate = expectedBondsGrowthRate;
    const cashGrowthRate = expectedCashGrowthRate;

    // console.log(expectancy, yearOfRetirement, stocksGrowthRate, bondsGrowthRate, cashGrowthRate);

    const initialBondsBalance = inputValues['balance-bonds'];
    const initialStocksBalance = inputValues['balance-stocks'];
    const initialBtcBalance = inputValues['balance-btc'];
    const initialCashBalance = inputValues['balance-other'];

    // Initialize first year
    totalBalances[currentYear] = initialBondsBalance + initialStocksBalance + initialBtcBalance + initialCashBalance;
    btcBalance[currentYear] = initialBtcBalance;
    stocksBalance[currentYear] = initialStocksBalance;
    bondsBalance[currentYear] = initialBondsBalance;
    cashIncomeBalance[currentYear] = initialCashBalance;

    // Starting balances for 60/40 portfolio
    portfolio60_40[currentYear] = totalBalances[currentYear];

    for (let i = 1; i <= expectancy; i++) {
      const localCurrentYear = currentYear + i;
      const btcPrice = btcPrices[localCurrentYear];
      const previousTotalBalance = totalBalances[localCurrentYear - 1] || 0;

      let yearBtcSold = 0;
      let yearStocksSold = 0;
      let yearBondsSold = 0;
      const netWithdrawal = withdrawalsNeeded[localCurrentYear] - otherIncome[localCurrentYear] || 0;
      // const netWithdrawal = Math.max(withdrawalsNeeded[localCurrentYear] - otherIncome[localCurrentYear]);

      if (localCurrentYear > yearOfRetirement && previousTotalBalance > 0) {
        // Calculate the difference between needed withdrawals and other income

        if (netWithdrawal !== 0) {
          // Calculate proportions based on previous year's balances
          const previousBtcBalance = btcBalance[localCurrentYear - 1] || 0;
          const previousStocksBalance = stocksBalance[localCurrentYear - 1] || 0;
          const previousBondsBalance = bondsBalance[localCurrentYear - 1] || 0;

          // Avoid division by zero by checking if there's any balance
          if (previousTotalBalance > 0) {
            const btcProportion = previousBtcBalance / previousTotalBalance;
            const stocksProportion = previousStocksBalance / previousTotalBalance;
            const bondsProportion = previousBondsBalance / previousTotalBalance;

            // Calculate changes proportionally
            yearBtcSold = netWithdrawal * btcProportion;
            yearStocksSold = netWithdrawal * stocksProportion;
            yearBondsSold = netWithdrawal * bondsProportion;

            // If we need to withdraw (positive netWithdrawal), ensure we don't withdraw more than available
            if (netWithdrawal > 0) {
              yearBtcSold = Math.min(yearBtcSold, previousBtcBalance);
              yearStocksSold = Math.min(yearStocksSold, previousStocksBalance);
              yearBondsSold = Math.min(yearBondsSold, previousBondsBalance);
            }
          }
        }
      }

      if (previousTotalBalance > 0) {
        // Record the withdrawals/additions
        btcSold[localCurrentYear] = -yearBtcSold;
        stocksSold[localCurrentYear] = -yearStocksSold;
        bondsSold[localCurrentYear] = -yearBondsSold;

        // Calculate new balances with growth and additions
        const btcGrowthFactor = btcPrice / btcPrices[localCurrentYear - 1];

        btcBalance[localCurrentYear] =
          (btcBalance[localCurrentYear - 1] || 0) * btcGrowthFactor + (annualBtcSavings[localCurrentYear] || 0) + btcSold[localCurrentYear];

        stocksBalance[localCurrentYear] =
          (stocksBalance[localCurrentYear - 1] || 0) * (1 + stocksGrowthRate / 100) +
          (annualStocksSavings[localCurrentYear] || 0) +
          stocksSold[localCurrentYear];

        bondsBalance[localCurrentYear] =
          (bondsBalance[localCurrentYear - 1] || 0) * (1 + bondsGrowthRate / 100) +
          (annualBondsSavings[localCurrentYear] || 0) +
          bondsSold[localCurrentYear];

        cashIncomeBalance[localCurrentYear] =
          (cashIncomeBalance[localCurrentYear - 1] || 0) * (1 + cashGrowthRate / 100) + (annualCashSavings[localCurrentYear] || 0);

        // Calculate total balance
        totalBalances[localCurrentYear] = Math.max(
          btcBalance[localCurrentYear] +
            stocksBalance[localCurrentYear] +
            bondsBalance[localCurrentYear] +
            cashIncomeBalance[localCurrentYear] -
            Math.max(netWithdrawal, 0),
          0
        );
        // console.log('Total balance:', totalBalances[localCurrentYear]);
      } else {
        // If there's no previous balance, set everything to 0
        btcBalance[localCurrentYear] = 0;
        stocksBalance[localCurrentYear] = 0;
        bondsBalance[localCurrentYear] = 0;
        cashIncomeBalance[localCurrentYear] = 0;
        totalBalances[localCurrentYear] = 0;
      }

      // Retirement success status
      if (totalBalances[localCurrentYear] <= 0) retirementSuccessStatus[localCurrentYear] = false;
      else retirementSuccessStatus[localCurrentYear] = true;

      // Calculate 60% in stocks/40% in bonds portfolio
      const previousStocksValue = portfolio60_40[localCurrentYear - 1] * 0.6;
      const currentStocksValue =
        previousStocksValue * (1 + stocksGrowthRate / 100) + (annualStocksSavings[localCurrentYear] || 0) + stocksSold[localCurrentYear];

      // Calculate current value of bonds (40% of portfolio)
      const previousBondsValue = portfolio60_40[localCurrentYear - 1] * 0.4;
      const currentBondsValue =
        previousBondsValue * (1 + bondsGrowthRate / 100) + (annualBondsSavings[localCurrentYear] || 0) + bondsSold[localCurrentYear];

      // Start selling 60_40 portfolio after retirement
      if (localCurrentYear > yearOfRetirement) {
        const portfolioValue = currentStocksValue + currentBondsValue;
        const portfolioWithdrawal = netWithdrawal * (portfolioValue / totalBalances[localCurrentYear]);
        const stocksWithdrawal = portfolioWithdrawal * 0.6;
        const bondsWithdrawal = portfolioWithdrawal * 0.4;

        // Calculate new with growth minus withdrawals
        if (portfolio60_40[localCurrentYear - 1] > 0 && withdrawalsNeeded[localCurrentYear] < portfolioValue) {
          const newStocksValue = currentStocksValue - stocksWithdrawal;
          const newBondsValue = currentBondsValue - bondsWithdrawal;
          // Calculate new total portfolio value, minimum 0
          portfolio60_40[localCurrentYear] = Math.max(newStocksValue + newBondsValue, 0);
        } else {
          portfolio60_40[localCurrentYear] = 0;
        }
      } else {
        portfolio60_40[localCurrentYear] = currentStocksValue + currentBondsValue;
      }

      // Add validation and logging
      if (isNaN(totalBalances[localCurrentYear])) {
        console.error('NaN detected in year:', localCurrentYear, {
          btcBalance: btcBalance[localCurrentYear],
          stocksBalance: stocksBalance[localCurrentYear],
          bondsBalance: bondsBalance[localCurrentYear],
          cashBalance: cashIncomeBalance[localCurrentYear],
          btcPrice,
          previousBtcPrice: btcPrices[localCurrentYear - 1],
          withdrawals: {
            btc: btcSold[localCurrentYear],
            stocks: stocksSold[localCurrentYear],
            bonds: bondsSold[localCurrentYear],
          },
        });
      }
      if (logResults) {
        console.log('Res', logResults);
        console.log(`Year ${localCurrentYear},  Total Balance: ${formatCurrency(totalBalances[localCurrentYear])}, Total withdrawal: ${formatCurrency(
          netWithdrawal
        )} \n
        BTC Balance: ${formatCurrency(btcBalance[localCurrentYear])}, withdrawal: ${formatCurrency(
          btcSold[localCurrentYear],
          2
        )}, price: ${formatCurrency(btcPrice)} \n
        Stocks Balance: ${formatCurrency(stocksBalance[localCurrentYear])}, withdrawal: ${formatCurrency(stocksSold[localCurrentYear])} \n
        Bonds Balance: ${formatCurrency(bondsBalance[localCurrentYear])}, withdrawal: ${formatCurrency(bondsSold[localCurrentYear])} \n
        Cash Balance: ${formatCurrency(cashIncomeBalance[localCurrentYear])} \n
        60/40 Portfolio: ${formatCurrency(portfolio60_40[localCurrentYear])} \n
        Retirement Success: ${retirementSuccessStatus[localCurrentYear] ? 'Yes' : 'No'} \n
        `);
      }
    }

    return {
      totalBalances,
      btcBalance,
      btcSold,
      stocksBalance,
      stocksSold,
      bondsBalance,
      bondsSold,
      cashIncomeBalance,
      btcPrices,
      retirementSuccessStatus,
      portfolio60_40,
    };
  };

  //------------------ Annual cash expenses
  const annualCashExpenses = getAnnualSavingsOrExpenses(
    inputValues['retirement-expenses'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    true,
    false
  );
  // console.log('Annual Expenses: ', annualCashExpenses);

  //------------------ Annual cash savings contribution
  const annualCashSavings = getAnnualSavingsOrExpenses(
    inputValues['additional-other'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    false
  );
  // console.log('Annual Cash Savings: ', annualCashSavings);

  //------------------ Annual bonds savings contribution
  const annualBondsSavings = getAnnualSavingsOrExpenses(
    inputValues['additional-bonds'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );
  // console.log('Annual Bonds Savings: ', annualBondsSavings);

  //------------------ Annual stocks savings contribution
  const annualStocksSavings = getAnnualSavingsOrExpenses(
    inputValues['additional-stocks'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );
  // console.log('Annual Stocks Savings: ', annualStocksSavings);

  //------------------ Annual bitcoin savings contribution
  const annualBtcSavings = getAnnualSavingsOrExpenses(
    inputValues['additional-btc'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );
  // console.log('Annual Bitcoin Savings: ', annualBtcSavings);

  //------------------ Other annual income
  const annualOtherIncome = getAnnualSavingsOrExpenses(
    inputValues['retirement-income'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    true,
    false
  );
  // console.log('Annual Other Income: ', annualOtherIncome);

  //------------------ Cash balances
  const annualCashBalances = getCashBalances(annualCashSavings, inputValues['expectancy']);
  // console.log('Cash Balances: ', cashBalances);

  //------------------ Annual withdrawals needed
  const annualWithdrawalsNeeded = getWithdrawalsNeeded(
    annualCashExpenses,
    inputValues['btc-account'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy']
  );
  // console.log('Annual Withdrawals Needed: ', annualWithdrawalsNeeded);

  //------------------ Annual withdrawals taxes paid
  // const annualWithdrawalsTaxesPaid = getWithdrawalsTaxesPaid(annualWithdrawalsNeeded, inputValues['expectancy'], currentYear + (inputValues['retirement-age'] - currentAge));
  // console.log('Annual Withdrawals Taxes Paid: ', annualWithdrawalsTaxesPaid);

  //------------------ Calculate all balances
  const {
    totalBalances,
    btcBalance,
    btcSold,
    stocksBalance,
    stocksSold,
    bondsBalance,
    bondsSold,
    cashIncomeBalance,
    btcPrices,
    retirementSuccessStatus,
    portfolio60_40,
  } = getAllBalancesAndSold(
    annualWithdrawalsNeeded,
    annualOtherIncome,
    annualBtcSavings,
    annualStocksSavings,
    annualBondsSavings,
    annualCashSavings,
    inputValues['expectancy'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expected-stocks'],
    inputValues['expected-bonds'],
    inputValues['expected-cash'],
    inputValues['expected-btc'],
    false
  );
  // console.log('btcPrices', btcPrices);

  //------------------ Always calculate for Roth IRA (if it's not selected)
  let totalBalancesRoth = {};
  if (inputValues['btc-account'] !== 'roth') {
    const rothAnnualWithdrawalsNeeded =
      inputValues['btc-account'] !== 'roth'
        ? getWithdrawalsNeeded(annualCashExpenses, 'roth', currentYear + (inputValues['retirement-age'] - currentAge), inputValues['expectancy'])
        : false;
    // const rothAnnualWithdrawalsTaxesPaid = rothAnnualWithdrawalsNeeded
    //   ? getWithdrawalsTaxesPaid(rothAnnualWithdrawalsNeeded, inputValues['expectancy'], currentYear + (inputValues['retirement-age'] - currentAge))
    //   : false;

    const {
      totalBalances: totalBalancesRothL,
      btcBalance: btcBalanceRoth,
      btcSold: btcSoldRoth,
      stocksBalance: stocksBalanceRoth,
      stocksSold: stocksSoldRoth,
      bondsBalance: bondsBalanceRoth,
      bondsSold: bondsSoldRoth,
      cashIncomeBalance: cashIncomeBalanceRoth,
      btcPrices: btcPricesRoth,
      retirementSuccessStatus: retirementSuccessStatusRoth,
      portfolio60_40: portfolio60_40Roth,
    } = getAllBalancesAndSold(
      rothAnnualWithdrawalsNeeded,
      annualOtherIncome,
      annualBtcSavings,
      annualStocksSavings,
      annualBondsSavings,
      annualCashSavings,
      inputValues['expectancy'],
      currentYear + (inputValues['retirement-age'] - currentAge),
      inputValues['expected-stocks'],
      inputValues['expected-bonds'],
      inputValues['expected-cash'],
      inputValues['expected-btc']
    );

    totalBalancesRoth = totalBalancesRothL;
    // console.log('Roth IRA selected, calculating for Roth', totalBalancesRoth);
  }

  const annualBudgetAtRetirement = getAnnualBudgetAtRetirement(annualCashExpenses, currentYear + (inputValues['retirement-age'] - currentAge));
  // console.log('Annual Budget: ', formatCurrency(annualBudgetAtRetirement), 'Monthly Budget: ', formatCurrency(annualBudgetAtRetirement / 12));

  const projectedPortfolioAtRetirement = getProjectedPortfolioAtRetirement(totalBalances, currentYear + (inputValues['retirement-age'] - currentAge));

  const projectedPortfolioAtDeath = getProjectedPortfolioAtDeath(totalBalances, currentYear - currentAge + inputValues['expectancy']);

  //------------------ Simulation
  const _runSimulation = () => {
    calcElementsAndRanges.forEach((calc) => {
      const selector = calc.selector;
      const minRange = calc.min;
      const maxRange = calc.max;
      const step = calc.step;
      // console.log(value, initialResultValue, selector, minRange, maxRange, step);

      // Simulation retirement age
      if (selector === 'retirement-age') {
        // Loop until we find the value where 0 occurs for the first time
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (i - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );

          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Age at retirement',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );
          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);
          if (portfolioAtDeathL > 0) {
            optimalValues['retirement-age'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['retirement-age'] = maxRange;
        }
        optimalValues['retirement-age-reversed'] = false;

        // Simulation expectancy
      } else if (selector === 'expectancy') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfDeathL = currentYear - currentAge + i;

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            true,
            false
          );

          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            i,
            currentYear + (inputValues['retirement-age'] - currentAge),
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, yearOfDeathL);
          // console.log(
          //   'yearOfDeathL',
          //   yearOfDeathL,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );
          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);
          if (portfolioAtDeathL <= 0) {
            optimalValues['expectancy'] = i - 1;
            break;
          }

          // If last loop and retirement never failed
          if (i >= maxRange) optimalValues['expectancy'] = maxRange;
        }
        optimalValues['expectancy-reversed'] = true;

        // Simulation expected stocks growth rate
      } else if (selector === 'expected-stocks') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            i,
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   "Stock's growth rate",
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL > 0) {
            optimalValues['expected-stocks'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['expected-stocks'] = maxRange;
        }
        optimalValues['expected-stocks-reversed'] = false;

        // Simulation expected bonds growth rate
      } else if (selector === 'expected-bonds') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            i,
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   "Bond's growth rate",
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL > 0) {
            optimalValues['expected-bonds'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['expected-bonds'] = maxRange;
        }
        optimalValues['expected-bonds-reversed'] = false;

        // Simulation expected cash growth rate
      } else if (selector === 'expected-cash') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            i,
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Cash growth rate',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL > 0) {
            optimalValues['expected-cash'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['expected-cash'] = maxRange;
        }
        optimalValues['expected-cash-reversed'] = false;

        // Simulation expected bitcoin growth rate
      } else if (selector === 'expected-btc') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            i
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   "Bitcoin's growth rate",
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL > 0) {
            optimalValues['expected-btc'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['expected-btc'] = maxRange;
        }
        optimalValues['expected-btc-reversed'] = false;

        // Simulation growth rate
      } else if (selector === 'growth-rate') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false,
            i
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false,
            i
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            i
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            i
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            i
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false,
            i
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Growth rate',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);
          if (portfolioAtDeathL > 0) {
            optimalValues['growth-rate'] = i;
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) optimalValues['growth-rate'] = maxRange;
        }
        optimalValues['growth-rate-reversed'] = false;

        // Simulation retirement-income
      } else if (selector === 'retirement-income') {
        for (let i = minRange; i <= maxRange; i += step * 2) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(i, yearOfRetirementL, inputValues['expectancy'], true, false);
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Income',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL > 0) {
            optimalValues['retirement-income'] = i;
            break;
          }
        }
        optimalValues['retirement-income-reversed'] = false;

        // Simulation retirement expenses
      } else if (selector === 'retirement-expenses') {
        for (let i = minRange; i <= maxRange; i += step * 2) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(i, yearOfRetirementL, inputValues['expectancy'], true, false);
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Expenses',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL <= 0) {
            optimalValues['retirement-expenses'] = i - 1;
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) optimalValues['retirement-expenses'] = maxRange;
        }
        optimalValues['retirement-expenses-reversed'] = true;

        // Simulation capital gains
      } else if (selector === 'capital-gains') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy'],
            i
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true
          );
          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Capital Gains',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL <= 0) {
            optimalValues['capital-gains'] = i - 1;
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) optimalValues['capital-gains'] = maxRange;
        }
        optimalValues['capital-gains-reversed'] = true;

        // Simulation inflation rate
      } else if (selector === 'inflation-rate') {
        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false,
            inputValues['growth-rate'],
            i
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(
            annualCashExpensesL,
            inputValues['btc-account'],
            yearOfRetirementL,
            inputValues['expectancy']
          );

          const annualOtherIncomeL = getAnnualSavingsOrExpenses(
            inputValues['retirement-income'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false,
            inputValues['growth-rate'],
            i
          );
          const annualBtcSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-btc'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            inputValues['growth-rate'],
            i
          );
          const annualStocksSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-stocks'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            inputValues['growth-rate'],
            i
          );

          const annualBondsSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-bonds'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            true,
            inputValues['growth-rate'],
            i
          );

          const annualCashSavingsL = getAnnualSavingsOrExpenses(
            inputValues['additional-other'],
            yearOfRetirementL,
            inputValues['expectancy'],
            false,
            false,
            inputValues['growth-rate'],
            i
          );

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCashSavingsL,
            inputValues['expectancy'],
            yearOfRetirementL,
            inputValues['expected-stocks'],
            inputValues['expected-bonds'],
            inputValues['expected-cash'],
            inputValues['expected-btc']
          );

          const portfolioAtDeathL = getProjectedPortfolioAtDeath(lastResultTestValue, currentYear - currentAge + inputValues['expectancy']);

          // console.log(
          //   'yearOfRetirementL',
          //   yearOfRetirementL,
          //   'Inflation Rate',
          //   i,
          //   'annualCashExpensesL',
          //   annualCashExpensesL,
          //   'annualWithdrawalsNeededL',
          //   annualWithdrawalsNeededL,
          //   'annualOtherIncomeL',
          //   annualOtherIncomeL,
          //   'annualBtcSavingsL',
          //   annualBtcSavingsL,
          //   'annualStocksSavingsL',
          //   annualStocksSavingsL,
          //   'annualBondsSavingsL',
          //   annualBondsSavingsL,
          //   'annualCashSavingsL',
          //   annualCashSavingsL,
          //   'lastResultTestValue',
          //   lastResultTestValue,
          //   'portfolioAtDeathL',
          //   portfolioAtDeathL
          // );

          // console.log(i, currentYear - currentAge + inputValues['expectancy'], portfolioAtDeathL);

          if (portfolioAtDeathL <= 0) {
            optimalValues['inflation-rate'] = i - 1;
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) optimalValues['inflation-rate'] = maxRange;
        }
        optimalValues['inflation-rate-reversed'] = true;
      }
    });
    // console.log('Optimal values:', optimalValues);
    updateAllRangesliders();
  };
  const runSimulation = _.throttle(_runSimulation, 100, { trailing: true });

  runSimulation();

  //------------------ End of Simulation

  updateSidebarResults(
    currentAge,
    btcBalance,
    btcPrices,
    annualBudgetAtRetirement,
    retirementSuccessStatus,
    projectedPortfolioAtDeath,
    projectedPortfolioAtRetirement
  );
  // updateAllRangesliders();
  updateMainChart(totalBalances, currentYear - currentAge + inputValues['expectancy'], currentAge, portfolio60_40, totalBalancesRoth);
};
