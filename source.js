//------------------- Range sliders charting -------------------//
const chartHeight = 32;
let fixedBarCount = 49;
const optimalValues = {};
let displayGoldLine = false;
let goldLineEqual = false;
let annualCustomAsset1Savings = {};
let annualCustomAsset2Savings = {};
let annualCustomAsset3Savings = {};
let annualCustomAsset4Savings = {};
let annualCustomAsset5Savings = {};
let customBtcAssets = {};
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
const inputValues = {};

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

// URL for Blockchain.com ticker API
const getBitcoinPrice = async () => {
  try {
    const response = await fetch('https://blockchain.info/ticker');
    const data = await response.json();
    const usdPrice = data.USD.last;
    currentBtcPrice = usdPrice;
    console.log(`Current Bitcoin Price in USD: $${usdPrice}`);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
  }
};
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

const getBtcValueWithUsd = (usdValue, btcPriceAtRetirement) => usdValue / btcPriceAtRetirement;

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
        let value = slider.value;
        const inputElement = sliderContainer.querySelector(`#${selector}-i`);
        if (selector === 'retirement-age' && value < inputValues['current-age']) {
          value = inputValues['current-age'];
          slider.value = value;
        }
        inputValues[selector] = onlyNumbers(value);
        updateBars();
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
window.addEventListener('load', async () => {
  // Get current Bitcoin price
  await getBitcoinPrice();

  // Get saved values from URL
  const savedValues = {};

  const urlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlParams) {
    savedValues[key] = value;
  }

  if (window.innerWidth < 768) fixedBarCount = 35;
  initRangeSliders();

  // Custom rows and dropdowns

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
      // Set saved values if available
      if (savedValues[selector]) slider.value = savedValues[selector];

      slider.dispatchEvent(new Event('input'));
      runCalculations();
    }
  });

  // Age fields
  const ageInputs = document.querySelectorAll('.calc-field[is-age="true"]');
  const retirementAgeInput = document.querySelector('#retirement-age-i');
  ageInputs.forEach((input) => {
    const maxAge = +input.getAttribute('max-age');
    const minAge = +input.getAttribute('min-age');
    input.addEventListener('input', () => {
      input.value = onlyNumbers(input.value);
    });

    input.addEventListener('blur', () => {
      let value = onlyNumbers(input.value);
      if (value > maxAge) value = maxAge;
      if (value < minAge) value = minAge;
      if (input.id === 'retirement-age-i' && input.value < inputValues['current-age']) value = inputValues['current-age'];
      if (input.id === 'current-age' && input.value > inputValues['retirement-age']) {
        retirementAgeInput.value = value;
        retirementAgeInput.dispatchEvent(new Event('blur'));
      }
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
    input.value = savedValues[input.id] || input.getAttribute('init-value');
    input.dispatchEvent(new Event('blur'));
    runCalculations();
  });

  // "Plan type" radios, disabling corresponding range slider
  document.querySelectorAll(`.calc-radio input[name="plan-type"]`).forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedPlanType = document.querySelector('.calc-radio input[name="plan-type"]:checked').value;
      if (selectedPlanType === 'custom') document.querySelector('#expected-btc').classList.remove('is--disabled');
      else document.querySelector('#expected-btc').classList.add('is--disabled');
    });
  });

  // Set initial radio values
  document.querySelectorAll("input[type='radio'][radio-initial='true']").forEach((radio) => {
    const savedValue = savedValues[radio.name];
    const radioValue = radio.value;
    if (savedValue === radioValue) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Load saved value if available
      const savedValueRadio = radio.closest('.calc-layout__radios').querySelector(`input[value="${savedValue}"]`);
      if (savedValueRadio) {
        savedValueRadio.checked = true;
        savedValueRadio.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Fallback to default value
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    runCalculations();
  });

  // Share button
  document.querySelector('#share-btn').addEventListener('click', function () {
    const initialText = this.textContent;
    this.textContent = 'Copied!';
    setTimeout(() => (this.textContent = initialText), 2000);
    // Create URL string and copy to clipboard
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    const neededKeys = [
      'current-age',
      'retirement-age',
      'expectancy',
      'balance-stocks',
      'balance-bonds',
      'balance-btc',
      'additional-stocks',
      'additional-bonds',
      'additional-btc',
      'expected-stocks',
      'expected-bonds',
      'expected-btc',
      'plan-type',
      'expected-cash',
      'growth-rate',
      'retirement-income',
      'retirement-expenses',
      'capital-gains',
      'inflation-rate',
      'custom-additional-1',
      'custom-amount-1',
      'custom-asset-1',
      'custom-status-1',
      'custom-additional-2',
      'custom-amount-2',
      'custom-asset-2',
      'custom-status-2',
      'custom-additional-3',
      'custom-amount-3',
      'custom-asset-3',
      'custom-status-3',
      'custom-additional-4',
      'custom-amount-4',
      'custom-asset-4',
      'custom-status-4',
      'custom-additional-5',
      'custom-amount-5',
      'custom-asset-5',
      'custom-status-5',
    ];
    // neededKeys.forEach((key) => {
    //   console.log(key, inputValues[key]);
    // });

    neededKeys.forEach((key) => (inputValues[key] || inputValues[key] == 0) && params.append(key, inputValues[key]));

    url.search = params.toString();
    navigator.clipboard.writeText(url.toString());
  });

  // Reset button
  document.querySelector('#reset-btn').addEventListener('click', () => {
    // Input fields
    document.querySelectorAll('input[init-value]').forEach((input) => {
      input.value = input.getAttribute('init-value');
      input.dispatchEvent(new Event('blur'));
    });
    // Range sliders
    calcSelectors.forEach((selector) => {
      const slider = document.querySelector(`#${selector} .calc__slider-range`);
      if (slider) {
        slider.value = slider.getAttribute('value');
        slider.dispatchEvent(new Event('input'));
      }
    });
    // Radios
    document.querySelectorAll("input[type='radio'][radio-initial='true']").forEach((radio) => {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Dropdowns
    document.querySelectorAll('.calc-layout__custom__controls-icon.is--remove').forEach((removeButton) => removeCustomRow(removeButton));

    // Initial row dropdowns
    document.querySelectorAll('.calc-layout__custom[custom-value-order="1"] .calc-dropdown').forEach((dropdown, i) => {
      const toggleText = dropdown.querySelector('.calc-dropdown__toggle__text');
      const initialValue = dropdown.querySelector('.calc-dropdown__list__item[initial-value="true"]');
      toggleText.textContent = initialValue.textContent;
      i === 0 && (inputValues['custom-asset-1'] = initialValue.getAttribute('dropdown-value'));
      i === 1 && (inputValues['custom-status-1'] = initialValue.getAttribute('dropdown-value'));
    });

    runCalculations();
  });

  // Secondary popup
  const secondaryPopup = document.querySelector('.secondary-popup');
  const secondaryPopupClose = document.querySelector('.secondary-popup .popup__close');
  // const secondaryPopupOverlay = document.querySelector('.secondary-popup .popup__overlay');

  const closePopup = () => {
    secondaryPopup.classList.remove('fade');
    setTimeout(() => secondaryPopup.classList.remove('show'), 300);
  };

  let secondaryPopupClickCount = 0;
  let openOnNClick = 10;
  let secondaryPopupDisplayed = false;
  document.addEventListener('click', (e) => {
    if (secondaryPopupDisplayed) return;
    if (e.target.closest('.calc-layout__sidebar__chart')) return (openOnNClick += 10);
    secondaryPopupClickCount++;
    if (secondaryPopupClickCount === openOnNClick) {
      secondaryPopup.classList.add('show');
      setTimeout(() => secondaryPopup.classList.add('fade'), 10);
      secondaryPopupDisplayed = true;
    }
  });
  secondaryPopupClose.addEventListener('click', closePopup);
  // [secondaryPopupClose, secondaryPopupOverlay].forEach((element) => {
  //   element.addEventListener('click', () => {
  //     secondaryPopup.classList.remove('fade');
  //     setTimeout(() => secondaryPopup.classList.remove('show'), 300);
  //   });
  // });

  // Custom value rows
  let displayedRows = 1;
  const addCustomRow = () => {
    const addButton = document.querySelector('#add-asset-btn');
    // All rows
    const rows = document.querySelectorAll('.calc-layout__custom');
    // First non-active row
    const row = document.querySelector('.calc-layout__custom:not(.is--active)');
    if (!row) return;
    // Remove is--last from all
    rows.forEach((row) => row.classList.remove('is--last'));
    row.classList.add('is--active');
    //Active rows
    const activeRows = document.querySelectorAll('.calc-layout__custom.is--active');
    if (activeRows.length === 5) addButton.classList.add('hidden');
    // Set flex order to 1
    row.style.order = displayedRows;
    displayedRows++;
  };

  const removeCustomRow = (removeButton) => {
    const addButton = document.querySelector('#add-asset-btn');
    // Clicked row
    const row = removeButton.closest('.calc-layout__custom');
    const rowOrder = row.getAttribute('custom-value-order');
    // Reset values and toggle text
    row.querySelectorAll('.calc-dropdown__toggle__text').forEach((toggle) => (toggle.textContent = toggle.getAttribute('initial-toggle-text')));
    row.querySelectorAll('input.calc-field').forEach((input) => (input.value = '$' + input.getAttribute('init-value')));
    inputValues[`custom-asset-${rowOrder}`] = 0;
    inputValues[`custom-status-${rowOrder}`] = 0;
    inputValues[`custom-amount-${rowOrder}`] = 0;
    inputValues[`custom-additional-${rowOrder}`] = 0;

    // Remove is--active and is--last
    row.classList.remove('is--active', 'is--last');

    document.querySelectorAll('.calc-layout__custom').forEach((row) => row.classList.remove('is--last'));
    // Add is--last to last row to the last active row that has the highest order
    const allActiveRows = document.querySelectorAll('.calc-layout__custom.is--active');
    let highestOrder = -2;
    let lastActiveRow;
    allActiveRows.forEach((row) => {
      // Get style order
      const order = +row.style.order;
      if (order > highestOrder) {
        highestOrder = order;
        lastActiveRow = row;
      }
    });
    lastActiveRow.classList.add('is--last');
    addButton.classList.remove('hidden');
    runCalculations();
  };
  // Dropdowns
  document.querySelectorAll('.calc-dropdown__list.is--initial').forEach(function (list) {
    const customValueOrder = list.closest('.calc-layout__custom').getAttribute('custom-value-order');
    const toggleText = list.closest('.calc-dropdown').querySelector('.calc-dropdown__toggle__text');
    const customValueType = list.getAttribute('custom-value-type');
    // On click
    list.addEventListener('click', function (e) {
      if (!e.target.classList.contains('calc-dropdown__list__item')) return;
      toggleText && (toggleText.textContent = e.target.textContent);
      // Save value
      const customValue = e.target.getAttribute('dropdown-value');
      inputValues[`custom-${customValueType}-${customValueOrder}`] = customValue;
      $('.calc-dropdown').trigger('w-close');
      runCalculations();
    });
    const savedValue = savedValues[`custom-${customValueType}-${customValueOrder}`] || false;
    // console.log(`custom-${customValueType}-${customValueOrder}`, savedValue);

    // If it's the first one, set as initial
    if (customValueOrder === '1') {
      if (savedValue) {
        toggleText && (toggleText.textContent = list.querySelector(`.calc-dropdown__list__item[dropdown-value="${savedValue}"]`).textContent);
        inputValues[`custom-${customValueType}-1`] = savedValue;
      } else {
        toggleText && (toggleText.textContent = list.querySelector('.calc-dropdown__list__item[initial-value="true"]').textContent);
        inputValues[`custom-${customValueType}-1`] = list
          .querySelector('.calc-dropdown__list__item[initial-value="true"]')
          .getAttribute('dropdown-value');
      }
    } else {
      // console.log('Custom value order:', customValueOrder, 'Saved value:', savedValue, typeof savedValue);

      if (customValueOrder && savedValue && savedValue !== '0') {
        // Every second dropdown
        if (
          `custom-asset-${customValueOrder}` === `custom-${customValueType}-${customValueOrder}` &&
          `custom-${customValueType}-${customValueOrder}` !== false
        ) {
          addCustomRow();
        }

        const savedItem = list.querySelector(`.calc-dropdown__list__item[dropdown-value="${savedValue}"]`);
        if (savedItem && toggleText) {
          toggleText.textContent = savedItem.textContent;
          inputValues[`custom-${customValueType}-${customValueOrder}`] = savedValue;
        }
      }
    }
    list.classList.remove('is--initial');
  });

  document.querySelector('#add-asset-btn')?.addEventListener('click', addCustomRow);

  document.querySelectorAll('.calc-layout__custom__controls-icon.is--remove').forEach((removeButton) => {
    removeButton.addEventListener('click', function () {
      // runCalculations();
      removeCustomRow(removeButton);
    });
  });

  // const deselectRanges = () => {
  //   document.querySelectorAll('.calc__slider-range').forEach((range) => range.blur());
  // };
  // const isTouchDevice = 'ontouchstart' in document.documentElement;
  // // Safari bug fix for range sliders
  // if (isTouchDevice) {
  //   console.log('Is touch device');
  //   document.addEventListener('pointerup', deselectRanges);
  //   document.addEventListener('touchend', deselectRanges);
  // }

  // iOS fixes
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos) {
    let activeSlider = null;
    document.querySelectorAll('.calc__slider-range').forEach((slider) => {
      // let isDragging = false;
      // // Detect drag start
      // slider.addEventListener('pointerdown', (e) => {
      //   isDragging = true;
      //   e.preventDefault(); // Prevent the initial "jump"
      // });

      // // Detect drag end
      // document.addEventListener('pointerup', () => {
      //   isDragging = false;
      // });

      // // Prevent click interactions
      // slider.addEventListener('click', (e) => {
      //   if (!isDragging) {
      //     e.preventDefault();
      //     e.stopPropagation();
      //   }
      // });

      // // Prevent pointerdown from triggering value change if not dragging
      // slider.addEventListener('pointerdown', (e) => {
      //   if (!isDragging) {
      //     e.preventDefault();
      //     e.stopPropagation();
      //   }
      // });
      slider.addEventListener('mousedown', () => {
        activeSlider = slider;
      });
      slider.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      slider.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    secondaryPopupClose.addEventListener('touchend', closePopup);
    secondaryPopupClose.addEventListener('touchend', closePopup);
    secondaryPopupClose.addEventListener('pointerdown', closePopup);
    document.addEventListener('mousemove', (event) => {
      if (!activeSlider?.contains(event.target)) {
        event.preventDefault();
      }
    });
    document.addEventListener('mouseup', () => (activeSlider = null));

    //Popup closing
  }
  // document.addEventListener('pointerup', () => {
  //   const activeElement = document.activeElement;
  //   if (activeElement && activeElement.tagName === 'INPUT' && activeElement.type === 'range') {
  //     activeElement.blur();
  //   }
  // });
  // // Fallback for older mobile Safari
  // document.addEventListener('touchend', () => {
  //   const activeElement = document.activeElement;
  //   if (activeElement && activeElement.tagName === 'INPUT' && activeElement.type === 'range') {
  //     activeElement.blur();
  //   }
  // });

  //Mobile fixed nav
  const targetElement = document.querySelector('.calc-layout__right');
  const referenceElement = document.querySelector('.container.is--simple-nav');

  const handleMobileScroll = () => {
    if (targetElement && referenceElement) {
      const referenceHeight = referenceElement.offsetHeight;

      window.addEventListener('scroll', function mobileScrollHandler() {
        if (window.innerWidth < 992) {
          if (window.scrollY > referenceHeight) {
            targetElement.classList.add('is--fixed');
          } else targetElement.classList.remove('is--fixed');
        } else targetElement.classList.remove('is--fixed');
      });
    } else {
      console.error('Required elements are missing in the DOM.');
    }
  };

  const handleResize = () => {
    if (window.innerWidth >= 992) {
      if (targetElement) targetElement.classList.remove('is--fixed');
    } else handleMobileScroll();
  };

  if (window.innerWidth < 992) handleMobileScroll();
  window.addEventListener('resize', handleResize);

  window.dispatchEvent(new Event('resize'));

  //-------------- End of load event --------------//
});
//------------------ Calculations ------------------//
// Constants
const currentYear = new Date().getFullYear();
// Fallback variable, will be updated with the current BTC price
let currentBtcPrice = 65000;
//------------------ S2F Model prices
// prettier-ignore
// const btcPricesS2F = {2023:83667.67557239954,2024:686398.0127483337,2025:703741.9524243205,2026:721375.6236071566,2027:739301.4262968419,2028:5986997.015654025,2029:6060174.083947013,2030:6133945.0152537,2031:6208312.209574085,2032:49965761.24291532,2033:50266224.53526536,2034:50567889.953642786,2035:50870759.89804761,2036:408181178.5400824,2037:409398694.1478387,2038:410618628.40764976,2039:411840983.7195157,2040:3299624560.159754,2041:3304526099.867491,2042:3309432491.2793384,2043:3314343736.795295,2044:26534409444.738514,2045:26554078710.52289,2046:26573757694.115482,2047:26593446397.916298,2048:212826355165.1583,2049:212905158594.60263,2050:212983981474.06342,2051:213062823805.94064,2052:1704818018138.2832,2053:1705133484741.0745,2054:1705448990258.2983,2055:1705764534692.3552,2056:13647378572031.568,2057:13648640944365.16,2058:13649903394542.018,2059:13651165922564.541,2060:109214377726149.42,2061:109219428227481.05,2062:109224478884513.6,2063:109229529697249.48,2064:873856441296055.4,2065:873876645325528.8,2066:873896849666418.5,2067:873917054318726.8,2068:6991417254093309,2069:6991498074259649,2070:6991578895048836,2071:6991659716460872,2072:55933601019203670,2073:55933924307966080,2074:55934247597974184,2075:55934570889228010,2076:447477860282576500,2077:447479153453820400,2078:447480446627555650,2079:447481739803782400,2080:3579859091142640000,2081:3579864263860004400,2082:3579869436582351400,2083:3579874609309681000,2084:28639017565401715000,2085:28639038256335950000,2086:28639058947280150000,2087:28639079638234317000,2088:229112719869721100000,2089:229112802633587600000,2090:229112885397474000000,2091:229112968161380340000,2092:1.832904076346728e21,2093:1.832904407402453e21,2094:1.832904738458218e21,2095:1.832905069514023e21,2096:1.4663241880335521e22,2097:1.4663243204558938e22,2098:1.4663244528782437e22,2099:1.4663245853006015e22,2100:1.1730597212094267e23,2101:1.1730597741783739e23,2102:1.1730598271473226e23,2103:1.173059880116273e23,2104:9.384479252805988e23,2105:9.384479464681798e23,2106:9.38447967655761e23,2107:9.384479888433425e23,2108:7.507583995497068e24,2109:7.507584080247396e24,2110:7.507584164997724e24,2111:7.507584249748053e24,2112:6.006067433698574e25,2113:6.0060674675987065e25,2114:6.006067501498839e25,2115:6.006067535398971e25,2116:4.8048540418792296e26,2117:4.8048540554392825e26,2118:4.804854068999335e26,2119:4.804854082559388e26,2120:3.8438832714715317e27,2121:3.843883276895553e27,2122:3.8438832823195746e27,2123:3.843883287743595e27,2124:3.075106632364485e28,2125:3.075106634586495e28,2126:3.075106636808505e28,2127:3.075106639030515e28,2128:2.460085306062612e29,2129:2.460085306646612e29,2130:2.460085307230612e29,2131:2.460085307814612e29,2132:1.9680682457644896e30,2133:1.9680682458004896e30,2134:1.9680682458364896e30,2135:1.9680682458724896e30,2136:1.5744545966091917e31,2137:1.5744545966101917e31,2138:1.5744545966111917e31,2139:1.5744545966121917e31,2140:1.2595636772888455e32,2141:1.2595636772889455e32,2142:1.2595636772890455e32,2143:1.2595636772891455e32,2144:1.0076509418312764e33,2145:1.0076509418312864e33,2146:1.0076509418312964e33,2147:1.0076509418313064e33,2148:8.06120753465051e33,2149:8.06120753465052e33,2150:8.06120753465053e33,
// };
const btcPricesS2F = () => {
  const startYear = 2010;
  const numYears = 150;

  // Bitcoin halving schedule
  const initialBlockReward = 50;
  const blockTime = 10; // minutes
  const blocksPerYear = (365 * 24 * 60) / blockTime;
  const halvingInterval = 210000; // blocks
  const halvingYears = halvingInterval / blocksPerYear;

  // Historical S2F data for model calibration
  let historicalData = [
    { year: 2010, price: 0.06, sf: 1.5 },
    { year: 2011, price: 6, sf: 2.5 },
    { year: 2012, price: 12, sf: 4.5 },
    { year: 2013, price: 742, sf: 10.5 },
    { year: 2014, price: 318, sf: 12.5 },
    { year: 2015, price: 431, sf: 15.5 },
    { year: 2016, price: 967, sf: 21.5 },
    { year: 2017, price: 13900, sf: 25.5 },
    { year: 2018, price: 3688, sf: 27.5 },
    { year: 2019, price: 7185, sf: 28.5 },
    { year: 2020, price: 28997, sf: 56.0 },
    { year: 2021, price: 46155, sf: 56.2 },
    { year: 2022, price: 16663, sf: 56.4 },
    { year: 2023, price: 42297, sf: 56.6 },
    { year: 2024, price: 99968, sf: 119.7 },
  ];

  // Update current year price if provided
  if (currentBtcPrice) {
    const currentYearIndex = historicalData.findIndex((data) => data.year === currentYear);
    if (currentYearIndex !== -1) {
      // Update existing year's price
      historicalData[currentYearIndex].price = currentBtcPrice;
    } else {
      // Add new entry for current year
      const lastEntry = historicalData[historicalData.length - 1];
      historicalData.push({
        year: currentYear,
        price: currentBtcPrice,
        sf: lastEntry.sf, // Use the last known SF ratio
      });
    }
  }

  // Step 1: Convert to logarithmic scale and perform linear regression
  const logData = historicalData.map(({ sf, price }) => ({
    x: Math.log10(sf),
    y: Math.log10(price),
  }));

  // Calculate regression coefficients
  const n = logData.length;
  const sumX = logData.reduce((sum, point) => sum + point.x, 0);
  const sumY = logData.reduce((sum, point) => sum + point.y, 0);
  const sumXY = logData.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumX2 = logData.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate S2F ratio for any year
  const calculateSF = (yearsSinceStart) => {
    const halvings = Math.floor(yearsSinceStart / halvingYears);
    const currentBlockReward = initialBlockReward / Math.pow(2, halvings);
    const annualProduction = currentBlockReward * blocksPerYear;
    const totalSupply = calculateTotalSupply(yearsSinceStart);
    return totalSupply / annualProduction;
  };

  // Helper function to calculate total supply
  const calculateTotalSupply = (yearsSinceStart) => {
    let supply = 0;
    let currentBlockReward = initialBlockReward;

    for (let y = 0; y < yearsSinceStart; y++) {
      const halvings = Math.floor(y / halvingYears);
      currentBlockReward = initialBlockReward / Math.pow(2, halvings);
      supply += currentBlockReward * blocksPerYear;
    }

    return supply;
  };

  // Generate predictions in the same format as Power Law model
  const predictions = {};
  for (let i = 0; i < numYears; i++) {
    const year = startYear + i;
    if (year === currentYear && currentBtcPrice) {
      predictions[year] = currentBtcPrice;
    } else {
      const sf = calculateSF(i);
      const logPrice = slope * Math.log10(sf) + intercept;
      predictions[year] = Math.pow(10, logPrice);
    }
  }

  return predictions;
};

//---------------- Power law
const btcPricesPowerLaw = () => {
  const startYear = 2010;
  const numYears = 150;
  const historicalData = [
    { time: 1, price: 0.03 },
    { time: 2, price: 1.17 },
    { time: 3, price: 9.91 },
    { time: 4, price: 45.2 },
    { time: 5, price: 146.7 },
    { time: 6, price: 383.87 },
    { time: 7, price: 865.75 },
    { time: 8, price: 1751.3 },
    { time: 9, price: 3260.17 },
    { time: 10, price: 5684.04 },
    { time: 11, price: 9398.21 },
    { time: 12, price: 14873.64 },
    { time: 13, price: 22689.36 },
    { time: 14, price: 33545.07 },
    { time: 15, price: currentBtcPrice || 99636.1 }, // Use provided current price or default
  ];

  // Step 1: Convert time and price to logarithmic scale
  const logData = historicalData.map(({ time, price }) => ({
    x: Math.log(time),
    y: Math.log(price),
  }));

  // Step 2: Perform linear regression on log-transformed data
  const n = logData.length;
  const sumX = logData.reduce((sum, point) => sum + point.x, 0);
  const sumY = logData.reduce((sum, point) => sum + point.y, 0);
  const sumXY = logData.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumX2 = logData.reduce((sum, point) => sum + point.x * point.x, 0);

  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);

  // Step 3: Calculate adjustment factor to match current price
  const yearsSinceStart = currentYear - startYear + 1;
  const modelPrediction = a * Math.pow(yearsSinceStart, b);
  const adjustmentFactor = currentBtcPrice / modelPrediction;

  // Step 4: Generate predictions with adjustment
  const predictions = {};
  for (let i = 0; i < numYears; i++) {
    const year = startYear + i;
    const basePrediction = a * Math.pow(i + 1, b);

    // Apply graduated adjustment that diminishes over time
    const yearDiff = Math.abs(year - currentYear);
    const adjustmentWeight = Math.exp(-yearDiff / 10); // Decay factor of 10 years
    const finalAdjustment = 1 + (adjustmentFactor - 1) * adjustmentWeight;

    predictions[year] = basePrediction * finalAdjustment;
  }

  return predictions;
};

//------------------ Saylor' s 2024 Bitcoin Model prices
const btcPricesBtc24 = () => {
  const startYear = currentYear;
  const startingPercent = 50;
  const minPercent = 20;
  const percentDecrement = 2.5;
  const prices = { [startYear]: currentBtcPrice };

  for (let i = 1; i <= 150; i++) {
    const percent = Math.max(startingPercent - (i - 1) * percentDecrement, minPercent);
    const previousPrice = prices[startYear + (i - 1)];
    const currentYear = startYear + i;
    prices[currentYear] = previousPrice * (1 + percent / 100);
  }

  return prices;
};

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
  const requiredInputs = ['current-age','balance-stocks','balance-bonds','balance-btc','additional-stocks','additional-bonds','additional-btc','retirement-age','expectancy','expected-stocks','expected-bonds','expected-cash','expected-btc','growth-rate','retirement-income','retirement-expenses','capital-gains','inflation-rate','plan-type',/*'retirement-strategy-sell', 'retirement-strategy-order', */
   ];

  const missingInputs = requiredInputs.filter((input) => !inputValues[input] && inputValues[input] !== 0);
  if (missingInputs.length > 0) {
    // console.log(`Missing input values: ${missingInputs.join(', ')}`);
    // window.alert('Please fill in all required fields');
    return;
  }

  const currentAge = inputValues['current-age'];

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

  //------------------- Calculate custom roth and non-roth annual savings
  const getAllRothAndNonRothContributions = () => {
    let startingValue = 0;
    for (i = 1; i <= 5; i++) {
      startingValue += +inputValues[`custom-additional-${i}`] || 0;
    }

    const annualSavings = getAnnualSavingsOrExpenses(
      startingValue,
      currentYear + inputValues['retirement-age'] - currentAge,
      inputValues['expectancy'],
      false,
      true
    );
    return annualSavings;
  };

  //------------------ Get custom asset balance
  const getCustomAssetBalance = (assetType, previousYearValue, currentYearSavings, currentYearSold, btcGrowthFactor) => {
    switch (assetType) {
      case 'stocks':
        return (previousYearValue || 0) * (1 + inputValues['expected-stocks'] / 100) + (currentYearSavings || 0) + (currentYearSold || 0);
      case 'bonds':
        return (previousYearValue || 0) * (1 + inputValues['expected-bonds'] / 100) + (currentYearSavings || 0) + (currentYearSold || 0);
      case 'btc':
        return (previousYearValue || 0) * btcGrowthFactor + (currentYearSavings || 0) + (currentYearSold || 0);
      case 'other':
        return (previousYearValue || 0) * (1 + inputValues['expected-cash'] / 100) + (currentYearSavings || 0) + (currentYearSold || 0);
      default:
        return previousYearValue;
    }
  };
  const getGrowthFactor = (assetType, btcGrowthFactor) => {
    switch (assetType) {
      case 'stocks':
        return 1 + inputValues['expected-stocks'] / 100;
      case 'bonds':
        return 1 + inputValues['expected-bonds'] / 100;
      case 'btc':
        return btcGrowthFactor;
      case 'other':
        return 1 + inputValues['expected-cash'] / 100;
      default:
        return 1;
    }
  };

  //------------------ All BTC balances
  const getAllBtcBalances = (expectedBtc) => {
    const btcBalances = {};
    btcBalances[currentYear] = inputValues['balance-btc'];
    if (inputValues['plan-type'] === 'btc24') return btcPricesBtc24();
    else if (inputValues['plan-type'] === 'power-law') return btcPricesPowerLaw();
    else if (inputValues['plan-type'] === 'custom') return btcPricesCustom(expectedBtc);
    else return btcPricesS2F();
  };

  //------------------ Withdrawals needed
  const getWithdrawalsNeeded = (expenses, yearOfRetirement, expectancy, capitalGains = inputValues['capital-gains']) => {
    const withdrawalsNeeded = {};
    for (let i = 1; i <= expectancy; i++) {
      const localCurrentYear = currentYear + i;
      // Get user age in local year
      const localAge = currentAge + i;
      // Capital gains tax doesn't apply for "roth" after year 60
      // const formattedCapitalGains = localAge >= 60 && accountType === 'roth' ? 0 : capitalGains;

      if (localCurrentYear > yearOfRetirement) {
        // let withdrawal;
        // if (accountType === 'none') withdrawal = expenses[localCurrentYear] / (1 - formattedCapitalGains / 100);
        // else withdrawal = expenses[localCurrentYear];

        // withdrawal = expenses[localCurrentYear] / (1 - formattedCapitalGains / 100);
        // console.log('accountType', accountType, 'Year', localCurrentYear, 'Age', localAge, 'Capital gains', formattedCapitalGains);

        withdrawalsNeeded[localCurrentYear] = expenses[localCurrentYear] / (1 - capitalGains / 100);
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
    cashBalances[currentYear] = inputValues['balance-cash'];
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
      const retirementYear = currentYear + (inputValues['retirement-age'] - currentAge);
      const btcPriceAtRetirement = getBitcoinPriceAtRetirement(btcPrices, retirementYear);
      const customBtcBalanceAtRetirement = getBtcValueWithUsd(customBtcAssets[retirementYear] || 0, btcPriceAtRetirement);
      const btcBalanceAtRetirement = getBtcBalanceAtRetirement(btcBalance, retirementYear) / btcPriceAtRetirement;
      console.log('customBtcBalanceAtRetirement', customBtcBalanceAtRetirement, 'btcBalanceAtRetirement', btcBalanceAtRetirement);

      sidebarElements.retireBy && (sidebarElements.retireBy.value = inputValues['retirement-age']);
      sidebarElements.portfolioAtRetirement && (sidebarElements.portfolioAtRetirement.value = formatCurrency(projectedPortfolioAtRetirement));
      sidebarElements.btcAtRetirement &&
        (sidebarElements.btcAtRetirement.value = '₿' + formatCurrency(btcBalanceAtRetirement + customBtcBalanceAtRetirement, 3).replace('$', ''));
      sidebarElements.btcPriceAtRetirement && (sidebarElements.btcPriceAtRetirement.value = formatCurrency(btcPriceAtRetirement));
      sidebarElements.monthlyBudget && (sidebarElements.monthlyBudget.value = formatCurrency(annualBudgetAtRetirement / 12));
      sidebarElements.annualBudget && (sidebarElements.annualBudget.value = formatCurrency(annualBudgetAtRetirement));
      sidebarElements.yearsOfWithdrawals &&
        (sidebarElements.yearsOfWithdrawals.value = formatToFixed(
          getYearsOfSustainableWithdrawals(retirementSuccessStatus, retirementYear, currentYear - currentAge + inputValues['expectancy']),
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
    annualCustomSavings,
    expectancy,
    yearOfRetirement,
    expectedStocksGrowthRate,
    expectedBondsGrowthRate,
    expectedCashGrowthRate,
    expectedBtcGrowthRate,
    logResultsF = false,
    isSimulation = false
  ) => {
    const totalBalances = {};
    const btcBalance = {};
    const btcSold = {};
    const stocksBalance = {};
    const stocksSold = {};
    const bondsBalance = {};
    const bondsSold = {};
    const btcPrices = getAllBtcBalances(expectedBtcGrowthRate);
    const retirementSuccessStatus = {};
    const portfolio60_40 = {};
    const portfolio60_40Stocks = {};
    const portfolio60_40Bonds = {};

    const stocksGrowthRate = expectedStocksGrowthRate;
    const bondsGrowthRate = expectedBondsGrowthRate;
    const cashGrowthRate = expectedCashGrowthRate;

    // console.log(expectancy, yearOfRetirement, stocksGrowthRate, bondsGrowthRate, cashGrowthRate);

    const initialStocksBalance = inputValues['balance-stocks'];
    const initialBondsBalance = inputValues['balance-bonds'];
    const initialBtcBalance = inputValues['balance-btc'];

    let isTaxPenalty = false;

    // Custom assets
    const customAsset1 = inputValues['custom-amount-1'] || 0;
    const customAsset2 = inputValues['custom-amount-2'] || 0;
    const customAsset3 = inputValues['custom-amount-3'] || 0;
    const customAsset4 = inputValues['custom-amount-4'] || 0;
    const customAsset5 = inputValues['custom-amount-5'] || 0;
    // Custom asset types (stocks, bonds, btc, other)
    let customAsset1Type = inputValues['custom-asset-1'];
    let customAsset2Type = inputValues['custom-asset-2'];
    let customAsset3Type = inputValues['custom-asset-3'];
    let customAsset4Type = inputValues['custom-asset-4'];
    let customAsset5Type = inputValues['custom-asset-5'];
    // Custom asset statuses (roth, traditional, none)
    let customAsset1Status = inputValues['custom-status-1'];
    let customAsset2Status = inputValues['custom-status-2'];
    let customAsset3Status = inputValues['custom-status-3'];
    let customAsset4Status = inputValues['custom-status-4'];
    let customAsset5Status = inputValues['custom-status-5'];
    // Custom asset balances
    const customAsset1Balance = {};
    const customAsset2Balance = {};
    const customAsset3Balance = {};
    const customAsset4Balance = {};
    const customAsset5Balance = {};
    // Custom assets sold
    const customAsset1Sold = {};
    const customAsset2Sold = {};
    const customAsset3Sold = {};
    const customAsset4Sold = {};
    const customAsset5Sold = {};

    if (isSimulation) {
      // Override asset statuses for simulation
      customAsset1Status =
        (customAsset1Status === 'traditional' && customAsset1Type === 'btc') || (customAsset1Status !== 'none' && customAsset1Type !== 'btc')
          ? 'roth'
          : inputValues['custom-status-1'];

      customAsset2Status =
        (customAsset2Status === 'traditional' && customAsset2Type === 'btc') || (customAsset2Status !== 'none' && customAsset2Type !== 'btc')
          ? 'roth'
          : inputValues['custom-status-2'];

      customAsset3Status =
        (customAsset3Status === 'traditional' && customAsset3Type === 'btc') || (customAsset3Status !== 'none' && customAsset3Type !== 'btc')
          ? 'roth'
          : inputValues['custom-status-3'];
      customAsset4Status =
        (customAsset4Status === 'traditional' && customAsset4Type === 'btc') || (customAsset4Status !== 'none' && customAsset4Type !== 'btc')
          ? 'roth'
          : inputValues['custom-status-4'];

      customAsset5Status =
        (customAsset5Status === 'traditional' && customAsset5Type === 'btc') || (customAsset5Status !== 'none' && customAsset5Type !== 'btc')
          ? 'roth'
          : inputValues['custom-status-5'];

      // Override asset types for simulation
      customAsset1Type = customAsset1Status === 'roth' ? 'btc' : inputValues['custom-asset-1'];
      customAsset2Type = customAsset2Status === 'roth' ? 'btc' : inputValues['custom-asset-2'];
      customAsset3Type = customAsset3Status === 'roth' ? 'btc' : inputValues['custom-asset-3'];
      customAsset4Type = customAsset4Status === 'roth' ? 'btc' : inputValues['custom-asset-4'];
      customAsset5Type = customAsset5Status === 'roth' ? 'btc' : inputValues['custom-asset-5'];
    }
    if (!isSimulation) {
      let totalBtcRoth =
        (customAsset1Status === 'roth' && customAsset1Type === 'btc' ? customAsset1 : 0) +
        (customAsset2Status === 'roth' && customAsset2Type === 'btc' ? customAsset2 : 0) +
        (customAsset3Status === 'roth' && customAsset3Type === 'btc' ? customAsset3 : 0) +
        (customAsset4Status === 'roth' && customAsset4Type === 'btc' ? customAsset4 : 0) +
        (customAsset5Status === 'roth' && customAsset5Type === 'btc' ? customAsset5 : 0);
      let totalCustomAssets = customAsset1 + customAsset2 + customAsset3 + customAsset4 + customAsset5;
      let assetsThatWillConvertInSim =
        ((customAsset1Status === 'traditional' && customAsset1Type === 'btc') || (customAsset1Status !== 'none' && customAsset1Type !== 'btc')
          ? customAsset1 === 0
            ? 1
            : customAsset1
          : 0) +
        ((customAsset2Status === 'traditional' && customAsset2Type === 'btc') || (customAsset2Status !== 'none' && customAsset2Type !== 'btc')
          ? customAsset2 === 0
            ? 1
            : customAsset2
          : 0) +
        ((customAsset3Status === 'traditional' && customAsset3Type === 'btc') || (customAsset3Status !== 'none' && customAsset3Type !== 'btc')
          ? customAsset3 === 0
            ? 1
            : customAsset3
          : 0) +
        ((customAsset4Status === 'traditional' && customAsset4Type === 'btc') || (customAsset4Status !== 'none' && customAsset4Type !== 'btc')
          ? customAsset4 === 0
            ? 1
            : customAsset4
          : 0) +
        ((customAsset5Status === 'traditional' && customAsset5Type === 'btc') || (customAsset5Status !== 'none' && customAsset5Type !== 'btc')
          ? customAsset5 === 0
            ? 1
            : customAsset5
          : 0);
      // If gold line is equal to normal, have are custom assets and are in BTC Roth(dashed line)
      if (totalCustomAssets > 0 && totalBtcRoth === assetsThatWillConvertInSim) goldLineEqual = displayGoldLine = true;
      // Some assets will convert to BTC Roth
      else if (assetsThatWillConvertInSim > 0) {
        goldLineEqual = false;
        displayGoldLine = true;
      } else {
        goldLineEqual = false;
        displayGoldLine = false;
      }
    }

    // Initialize first year
    totalBalances[currentYear] =
      initialBondsBalance + initialStocksBalance + initialBtcBalance + customAsset1 + customAsset2 + customAsset3 + customAsset4 + customAsset5;

    btcBalance[currentYear] = initialBtcBalance;
    stocksBalance[currentYear] = initialStocksBalance;
    bondsBalance[currentYear] = initialBondsBalance;
    customAsset1Balance[currentYear] = customAsset1;
    customAsset2Balance[currentYear] = customAsset2;
    customAsset3Balance[currentYear] = customAsset3;
    customAsset4Balance[currentYear] = customAsset4;
    customAsset5Balance[currentYear] = customAsset5;
    // Reset customBtc assets and add starting balance
    if (!isSimulation) {
      customBtcAssets = {};
      customBtcAssets[currentYear] =
        (customAsset1Type === 'btc' ? customAsset1 : 0) +
        (customAsset2Type === 'btc' ? customAsset2 : 0) +
        (customAsset3Type === 'btc' ? customAsset3 : 0) +
        (customAsset4Type === 'btc' ? customAsset4 : 0) +
        (customAsset5Type === 'btc' ? customAsset5 : 0);
    }

    // Starting balances for 60/40 portfolio
    portfolio60_40[currentYear] = totalBalances[currentYear];
    portfolio60_40Stocks[currentYear] = totalBalances[currentYear] * 0.6;
    portfolio60_40Bonds[currentYear] = totalBalances[currentYear] * 0.4;

    for (let i = 1; i <= expectancy; i++) {
      const localCurrentYear = currentYear + i;
      const localAge = currentAge + i;
      const btcPrice = btcPrices[localCurrentYear];
      const previousTotalBalance = totalBalances[localCurrentYear - 1] || 0;
      // console.log('In year', localCurrentYear);
      const logResults = logResultsF && localAge <= inputValues['expectancy'];

      let yearBtcSold = 0;
      let yearStocksSold = 0;
      let yearBondsSold = 0;
      let yearCustomAsset1Sold = 0;
      let yearCustomAsset2Sold = 0;
      let yearCustomAsset3Sold = 0;
      let yearCustomAsset4Sold = 0;
      let yearCustomAsset5Sold = 0;
      const netWithdrawal = Math.max(withdrawalsNeeded[localCurrentYear] - otherIncome[localCurrentYear - 1] || 0, 0);

      const surplusWithdrawal = Math.max(otherIncome[localCurrentYear - 1] - withdrawalsNeeded[localCurrentYear], 0);

      // In retirement and has balance
      if (localCurrentYear > yearOfRetirement && previousTotalBalance > 0) {
        // Calculate the difference between needed withdrawals and other income

        if (netWithdrawal !== 0) {
          const previousBtcBalance = btcBalance[localCurrentYear - 1] || 0;
          const previousStocksBalance = stocksBalance[localCurrentYear - 1] || 0;
          const previousBondsBalance = bondsBalance[localCurrentYear - 1] || 0;
          const previousCustomAsset1Balance = customAsset1Balance[localCurrentYear - 1] || 0;
          const previousCustomAsset2Balance = customAsset2Balance[localCurrentYear - 1] || 0;
          const previousCustomAsset3Balance = customAsset3Balance[localCurrentYear - 1] || 0;
          const previousCustomAsset4Balance = customAsset4Balance[localCurrentYear - 1] || 0;
          const previousCustomAsset5Balance = customAsset5Balance[localCurrentYear - 1] || 0;

          const nonRothAssets = Math.max(
            previousTotalBalance -
              (customAsset1Status === 'roth' ? previousCustomAsset1Balance : 0) -
              (customAsset2Status === 'roth' ? previousCustomAsset2Balance : 0) -
              (customAsset3Status === 'roth' ? previousCustomAsset3Balance : 0) -
              (customAsset4Status === 'roth' ? previousCustomAsset4Balance : 0) -
              (customAsset5Status === 'roth' ? previousCustomAsset5Balance : 0),
            0
          );
          const rothAssets = Math.max(previousTotalBalance - nonRothAssets, 0);

          if (logResults) {
            // console.log(`Age ${localAge} before selling:
            // Total balance: ${formatCurrency(previousTotalBalance)}
            // Non-roth assets: ${formatCurrency(nonRothAssets)}
            // Roth assets: ${formatCurrency(rothAssets)}
            // Withdrawal: ${formatCurrency(netWithdrawal)}`);
          }

          // Sell proportionally
          if (localAge >= 60 || (localAge < 60 && nonRothAssets >= netWithdrawal)) {
            isTaxPenalty = false;
            if (logResults) {
              // console.log(
              //   'Age >= 60 or age < 60 and enough non-roth assets, no penalty, sell proportionally. Selling roth assets only after age 60.'
              // );
            }
            let remainingWithdrawal = netWithdrawal;

            //  filtering out undefined balances
            const assets = [
              { balance: previousBtcBalance || 0, proportion: 0, sold: 0 },
              { balance: previousStocksBalance || 0, proportion: 0, sold: 0 },
              { balance: previousBondsBalance || 0, proportion: 0, sold: 0 },
              { balance: previousCustomAsset1Balance || 0, proportion: 0, sold: 0, include: customAsset1Status !== 'roth' || localAge >= 60 },
              { balance: previousCustomAsset2Balance || 0, proportion: 0, sold: 0, include: customAsset2Status !== 'roth' || localAge >= 60 },
              { balance: previousCustomAsset3Balance || 0, proportion: 0, sold: 0, include: customAsset3Status !== 'roth' || localAge >= 60 },
              { balance: previousCustomAsset4Balance || 0, proportion: 0, sold: 0, include: customAsset4Status !== 'roth' || localAge >= 60 },
              { balance: previousCustomAsset5Balance || 0, proportion: 0, sold: 0, include: customAsset5Status !== 'roth' || localAge >= 60 },
            ].filter((asset) => asset.balance > 0 && asset.include !== false);

            // Calculate total available balance
            const totalAvailable = assets.reduce((sum, asset) => sum + asset.balance, 0);

            if (totalAvailable > 0) {
              // Calculate initial proportions
              assets.forEach((asset) => {
                asset.proportion = asset.balance / totalAvailable;
              });

              // Calculate ideal proportional sales
              assets.forEach((asset) => {
                const targetSale = remainingWithdrawal * asset.proportion;
                asset.sold = Math.min(targetSale, asset.balance);
              });

              // Distribute any remaining withdrawal needed
              const totalSold = assets.reduce((sum, asset) => sum + asset.sold, 0);
              if (totalSold < remainingWithdrawal) {
                const remaining = remainingWithdrawal - totalSold;

                // Find assets that still have available balance
                const availableAssets = assets.filter((asset) => asset.sold < asset.balance);

                if (availableAssets.length > 0) {
                  const remainingTotal = availableAssets.reduce((sum, asset) => sum + (asset.balance - asset.sold), 0);

                  availableAssets.forEach((asset) => {
                    const proportion = (asset.balance - asset.sold) / remainingTotal;
                    const additional = Math.min(remaining * proportion, asset.balance - asset.sold);
                    asset.sold += additional;
                  });
                }
              }
            }

            // Assign results back to variables
            yearBtcSold = assets.find((a) => a.balance === previousBtcBalance)?.sold || 0;
            yearStocksSold = assets.find((a) => a.balance === previousStocksBalance)?.sold || 0;
            yearBondsSold = assets.find((a) => a.balance === previousBondsBalance)?.sold || 0;
            yearCustomAsset1Sold = assets.find((a) => a.balance === previousCustomAsset1Balance)?.sold || 0;
            yearCustomAsset2Sold = assets.find((a) => a.balance === previousCustomAsset2Balance)?.sold || 0;
            yearCustomAsset3Sold = assets.find((a) => a.balance === previousCustomAsset3Balance)?.sold || 0;
            yearCustomAsset4Sold = assets.find((a) => a.balance === previousCustomAsset4Balance)?.sold || 0;
            yearCustomAsset5Sold = assets.find((a) => a.balance === previousCustomAsset5Balance)?.sold || 0;

            // If we need to withdraw (positive netWithdrawal)
            if (netWithdrawal > 0) {
              yearBtcSold = Math.min(yearBtcSold, previousBtcBalance);
              yearStocksSold = Math.min(yearStocksSold, previousStocksBalance);
              yearBondsSold = Math.min(yearBondsSold, previousBondsBalance);
              yearCustomAsset1Sold = Math.min(yearCustomAsset1Sold, customAsset1Balance[localCurrentYear - 1]);
              yearCustomAsset2Sold = Math.min(yearCustomAsset2Sold, customAsset2Balance[localCurrentYear - 1]);
              yearCustomAsset3Sold = Math.min(yearCustomAsset3Sold, customAsset3Balance[localCurrentYear - 1]);
              yearCustomAsset4Sold = Math.min(yearCustomAsset4Sold, customAsset4Balance[localCurrentYear - 1]);
              yearCustomAsset5Sold = Math.min(yearCustomAsset5Sold, customAsset5Balance[localCurrentYear - 1]);
            }
          } else {
            if (logResults) {
              // console.log('Age < 60 and not enough non-roth assets, tax penalty, sell all non-roth assets and roth assets proportionally');
            }
            isTaxPenalty = true;
            // Step 1: Initialize assets with their status
            const assets = [
              { name: 'btc', balance: previousBtcBalance || 0, isRoth: false },
              { name: 'stocks', balance: previousStocksBalance || 0, isRoth: false },
              { name: 'bonds', balance: previousBondsBalance || 0, isRoth: false },
              { name: 'custom1', balance: previousCustomAsset1Balance || 0, isRoth: customAsset1Status === 'roth' },
              { name: 'custom2', balance: previousCustomAsset2Balance || 0, isRoth: customAsset2Status === 'roth' },
              { name: 'custom3', balance: previousCustomAsset3Balance || 0, isRoth: customAsset3Status === 'roth' },
              { name: 'custom4', balance: previousCustomAsset4Balance || 0, isRoth: customAsset4Status === 'roth' },
              { name: 'custom5', balance: previousCustomAsset5Balance || 0, isRoth: customAsset5Status === 'roth' },
            ].filter((asset) => asset.balance > 0);

            let remainingWithdrawal = netWithdrawal;
            assets.forEach((asset) => (asset.sold = 0));

            // Sell only what we need from non-Roth assets
            const nonRothAssets = assets.filter((asset) => !asset.isRoth);
            const totalNonRothBalance = nonRothAssets.reduce((sum, asset) => sum + asset.balance, 0);

            if (totalNonRothBalance > 0) {
              const amountToSell = Math.min(remainingWithdrawal, totalNonRothBalance);
              nonRothAssets.forEach((asset) => {
                const proportion = asset.balance / totalNonRothBalance;
                asset.sold = Math.min(amountToSell * proportion, asset.balance);
              });
              remainingWithdrawal -= nonRothAssets.reduce((sum, asset) => sum + asset.sold, 0);
            }

            // If more withdrawal needed, calculate tax-adjusted amount for Roth assets
            if (remainingWithdrawal > 0) {
              const rothWithdrawal = remainingWithdrawal * 1.3; // Apply 30% tax+penalty adjustment
              const rothAssets = assets.filter((asset) => asset.isRoth);
              const totalRothBalance = rothAssets.reduce((sum, asset) => sum + asset.balance, 0);

              if (totalRothBalance > 0) {
                const amountToSell = Math.min(rothWithdrawal, totalRothBalance);
                rothAssets.forEach((asset) => {
                  const proportion = asset.balance / totalRothBalance;
                  asset.sold = Math.min(amountToSell * proportion, asset.balance);
                });
              }
            }

            // Assign results back to variables
            yearBtcSold = assets.find((a) => a.name === 'btc')?.sold || 0;
            yearStocksSold = assets.find((a) => a.name === 'stocks')?.sold || 0;
            yearBondsSold = assets.find((a) => a.name === 'bonds')?.sold || 0;
            yearCustomAsset1Sold = assets.find((a) => a.name === 'custom1')?.sold || 0;
            yearCustomAsset2Sold = assets.find((a) => a.name === 'custom2')?.sold || 0;
            yearCustomAsset3Sold = assets.find((a) => a.name === 'custom3')?.sold || 0;
            yearCustomAsset4Sold = assets.find((a) => a.name === 'custom4')?.sold || 0;
            yearCustomAsset5Sold = assets.find((a) => a.name === 'custom5')?.sold || 0;

            if (logResults) {
              // console.log(`Selling with tax penalty:
              // Remaining withdrawal for roth assets: ${formatCurrency(netWithdrawal - nonRothAssets)}
              // Remaining withdrawal for roth assets with tax penalty: ${formatCurrency(remainingWithdrawal)}
              // BTC: ${formatCurrency(yearBtcSold)}
              // Stocks: ${formatCurrency(yearStocksSold)}
              // Bonds: ${formatCurrency(yearBondsSold)}
              // Custom 1: ${formatCurrency(yearCustomAsset1Sold)}
              // Custom 2: ${formatCurrency(yearCustomAsset2Sold)}
              // Custom 3: ${formatCurrency(yearCustomAsset3Sold)}
              // Custom 4: ${formatCurrency(yearCustomAsset4Sold)}
              // Custom 5: ${formatCurrency(yearCustomAsset5Sold)}
              // Total sold: ${formatCurrency(
              //   yearBtcSold +
              //     yearStocksSold +
              //     yearBondsSold +
              //     yearCustomAsset1Sold +
              //     yearCustomAsset2Sold +
              //     yearCustomAsset3Sold +
              //     yearCustomAsset4Sold +
              //     yearCustomAsset5Sold
              // )}`);
            }

            // If we need to withdraw (positive netWithdrawal)
            if (netWithdrawal > 0) {
              yearBtcSold = Math.min(yearBtcSold, previousBtcBalance);
              yearStocksSold = Math.min(yearStocksSold, previousStocksBalance);
              yearBondsSold = Math.min(yearBondsSold, previousBondsBalance);
              yearCustomAsset1Sold = Math.min(yearCustomAsset1Sold, customAsset1Balance[localCurrentYear - 1]);
              yearCustomAsset2Sold = Math.min(yearCustomAsset2Sold, customAsset2Balance[localCurrentYear - 1]);
              yearCustomAsset3Sold = Math.min(yearCustomAsset3Sold, customAsset3Balance[localCurrentYear - 1]);
              yearCustomAsset4Sold = Math.min(yearCustomAsset4Sold, customAsset4Balance[localCurrentYear - 1]);
              yearCustomAsset5Sold = Math.min(yearCustomAsset5Sold, customAsset5Balance[localCurrentYear - 1]);
            }
          }
        }
      } else {
        // if not retired yet and netWithdrawal > expenses, add to total balance
        if (netWithdrawal > 0 && previousTotalBalance > 0) {
          // console.log('Adding surplus to total balance', Math.abs(netWithdrawal));
          // totalBalances[localCurrentYear] = previousTotalBalance + Math.abs(netWithdrawal);
        }
      }
      // console.log('previousTotalBalance', previousTotalBalance);
      if (previousTotalBalance > 0) {
        // Record the withdrawals/additions
        btcSold[localCurrentYear] = -yearBtcSold;
        stocksSold[localCurrentYear] = -yearStocksSold;
        bondsSold[localCurrentYear] = -yearBondsSold;
        customAsset1Sold[localCurrentYear] = -yearCustomAsset1Sold;
        customAsset2Sold[localCurrentYear] = -yearCustomAsset2Sold;
        customAsset3Sold[localCurrentYear] = -yearCustomAsset3Sold;
        customAsset4Sold[localCurrentYear] = -yearCustomAsset4Sold;
        customAsset5Sold[localCurrentYear] = -yearCustomAsset5Sold;

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

        // Custom assets
        customAsset1Balance[localCurrentYear] =
          (customAsset1Balance[localCurrentYear - 1] || 0) * getGrowthFactor(customAsset1Type, btcGrowthFactor) +
          (annualCustomAsset1Savings[localCurrentYear] || 0) +
          customAsset1Sold[localCurrentYear];

        customAsset2Balance[localCurrentYear] =
          (customAsset2Balance[localCurrentYear - 1] || 0) * getGrowthFactor(customAsset2Type, btcGrowthFactor) +
          (annualCustomAsset2Savings[localCurrentYear] || 0) +
          customAsset2Sold[localCurrentYear];

        customAsset3Balance[localCurrentYear] =
          (customAsset3Balance[localCurrentYear - 1] || 0) * getGrowthFactor(customAsset3Type, btcGrowthFactor) +
          (annualCustomAsset3Savings[localCurrentYear] || 0) +
          customAsset3Sold[localCurrentYear];

        customAsset4Balance[localCurrentYear] =
          (customAsset4Balance[localCurrentYear - 1] || 0) * getGrowthFactor(customAsset4Type, btcGrowthFactor) +
          (annualCustomAsset4Savings[localCurrentYear] || 0) +
          customAsset4Sold[localCurrentYear];

        customAsset5Balance[localCurrentYear] =
          (customAsset5Balance[localCurrentYear - 1] || 0) * getGrowthFactor(customAsset5Type, btcGrowthFactor) +
          (annualCustomAsset5Savings[localCurrentYear] || 0) +
          customAsset5Sold[localCurrentYear];
        // if (!isSimulation) console.log(getGrowthFactor(customAsset1Type, btcGrowthFactor));
        // if (!isSimulation) {
        //   console.log(
        //     `${localCurrentYear}, Custom asset 1:
        //     Previous balance: ${formatCurrency(customAsset1Balance[localCurrentYear - 1])},
        //     Growth factor: ${getGrowthFactor(customAsset1Type, btcGrowthFactor)},
        //     Savings: ${annualCustomAsset1Savings[localCurrentYear]},
        //     Sold: ${customAsset1Sold[localCurrentYear]},
        //     Previous year with growth: ${formatCurrency(
        //       customAsset1Balance[localCurrentYear - 1] * getGrowthFactor(customAsset1Type, btcGrowthFactor)
        //     )},
        //       Previuos year with savings: ${formatCurrency(customAsset1Balance[localCurrentYear - 1] + annualCustomAsset1Savings[localCurrentYear])},
        //       Current year: ${formatCurrency(customAsset1Balance[localCurrentYear])}`
        //   );
        // }

        // customAsset1Balance[localCurrentYear] = getCustomAssetBalance(
        //   customAsset1Type,
        //   customAsset1Balance[localCurrentYear - 1],
        //   annualCustomAsset1Savings[localCurrentYear],
        //   customAsset1Sold[localCurrentYear],
        //   btcGrowthFactor
        // );
        // customAsset2Balance[localCurrentYear] = getCustomAssetBalance(
        //   customAsset2Type,
        //   customAsset2Balance[localCurrentYear - 1],
        //   annualCustomAsset2Savings[localCurrentYear],
        //   customAsset2Sold[localCurrentYear],
        //   btcGrowthFactor
        // );
        // customAsset3Balance[localCurrentYear] = getCustomAssetBalance(
        //   customAsset3Type,
        //   customAsset3Balance[localCurrentYear - 1],
        //   annualCustomAsset3Savings[localCurrentYear],
        //   customAsset3Sold[localCurrentYear],
        //   btcGrowthFactor
        // );
        // customAsset4Balance[localCurrentYear] = getCustomAssetBalance(
        //   customAsset4Type,
        //   customAsset4Balance[localCurrentYear - 1],
        //   annualCustomAsset4Savings[localCurrentYear],
        //   customAsset4Sold[localCurrentYear],
        //   btcGrowthFactor
        // );
        // customAsset5Balance[localCurrentYear] = getCustomAssetBalance(
        //   customAsset5Type,
        //   customAsset5Balance[localCurrentYear - 1],
        //   annualCustomAsset5Savings[localCurrentYear],
        //   customAsset5Sold[localCurrentYear],
        //   btcGrowthFactor
        // );

        // Custom BTC balance
        if (!isSimulation) {
          customBtcAssets[localCurrentYear] =
            (customAsset1Type === 'btc' ? customAsset1Balance[localCurrentYear] : 0) +
            (customAsset2Type === 'btc' ? customAsset2Balance[localCurrentYear] : 0) +
            (customAsset3Type === 'btc' ? customAsset3Balance[localCurrentYear] : 0) +
            (customAsset4Type === 'btc' ? customAsset4Balance[localCurrentYear] : 0) +
            (customAsset5Type === 'btc' ? customAsset5Balance[localCurrentYear] : 0);
        }

        if (previousTotalBalance > netWithdrawal) {
          totalBalances[localCurrentYear] = Math.max(
            btcBalance[localCurrentYear] +
              stocksBalance[localCurrentYear] +
              bondsBalance[localCurrentYear] +
              customAsset1Balance[localCurrentYear] +
              customAsset2Balance[localCurrentYear] +
              customAsset3Balance[localCurrentYear] +
              customAsset4Balance[localCurrentYear] +
              customAsset5Balance[localCurrentYear]
          );
          // if (previousTotalBalance > netWithdrawal) {
          //   totalBalances[localCurrentYear] = Math.max(
          //     btcBalance[localCurrentYear] +
          //       stocksBalance[localCurrentYear] +
          //       bondsBalance[localCurrentYear] +
          //       customAsset1Balance[localCurrentYear] +
          //       customAsset2Balance[localCurrentYear] +
          //       customAsset3Balance[localCurrentYear] +
          //       customAsset4Balance[localCurrentYear] +
          //       customAsset5Balance[localCurrentYear] -
          //       Math.max(netWithdrawal, 0),
          //     0
          //   );

          if (logResults) {
            // console.log(`
            //   totalBalances: ${formatCurrency(totalBalances[localCurrentYear])}
            //    calculated totalBalances: ${formatCurrency(
            //      btcBalance[localCurrentYear] +
            //        stocksBalance[localCurrentYear] +
            //        bondsBalance[localCurrentYear] +
            //        customAsset1Balance[localCurrentYear] +
            //        customAsset2Balance[localCurrentYear] +
            //        customAsset3Balance[localCurrentYear] +
            //        customAsset4Balance[localCurrentYear] +
            //        customAsset5Balance[localCurrentYear]
            //    )}
            //   previousTotalBalance: ${formatCurrency(previousTotalBalance)}
            //   calculated previousTotalBalance: ${formatCurrency(
            //     btcBalance[localCurrentYear - 1] +
            //       stocksBalance[localCurrentYear - 1] +
            //       bondsBalance[localCurrentYear - 1] +
            //       customAsset1Balance[localCurrentYear - 1] +
            //       customAsset2Balance[localCurrentYear - 1] +
            //       customAsset3Balance[localCurrentYear - 1] +
            //       customAsset4Balance[localCurrentYear - 1] +
            //       customAsset5Balance[localCurrentYear - 1]
            //   )}
            //   netWithdrawal: ${formatCurrency(netWithdrawal)}
            //   calculated netWithdrawal: ${formatCurrency(
            //     btcSold[localCurrentYear] +
            //       stocksSold[localCurrentYear] +
            //       bondsSold[localCurrentYear] +
            //       customAsset1Sold[localCurrentYear] +
            //       customAsset2Sold[localCurrentYear] +
            //       customAsset3Sold[localCurrentYear] +
            //       customAsset4Sold[localCurrentYear] +
            //       customAsset5Sold[localCurrentYear]
            //   )}
            //   `);
          }
        } else {
          totalBalances[localCurrentYear] = 0;
        }

        // console.log('Total balance:', totalBalances[localCurrentYear]);
      } else {
        // If there's no previous balance, set everything to 0
        btcBalance[localCurrentYear] = 0;
        stocksBalance[localCurrentYear] = 0;
        bondsBalance[localCurrentYear] = 0;
        totalBalances[localCurrentYear] = 0;
        customAsset1Balance[localCurrentYear] = 0;
        customAsset2Balance[localCurrentYear] = 0;
        customAsset3Balance[localCurrentYear] = 0;
        customAsset4Balance[localCurrentYear] = 0;
        customAsset5Balance[localCurrentYear] = 0;
      }

      // Retirement success status
      if (previousTotalBalance > netWithdrawal) retirementSuccessStatus[localCurrentYear] = true;
      else retirementSuccessStatus[localCurrentYear] = false;

      // Add retirement income if in retirement
      // if (localCurrentYear > yearOfRetirement) portfolio60_40[localCurrentYear] += netWithdrawal;

      // Calculate new 60/40 values with growth
      const currentStocksValue = portfolio60_40Stocks[localCurrentYear - 1];
      const currentBondsValue = portfolio60_40Bonds[localCurrentYear - 1];
      const portfolioValue = currentStocksValue + currentBondsValue;
      const stockProportion = currentStocksValue / portfolioValue;
      const bondProportion = currentBondsValue / portfolioValue;

      // Sell equal proportions of stocks and bonds
      const stocksWithdrawal = netWithdrawal * stockProportion;
      const bondsWithdrawal = netWithdrawal * bondProportion;

      // Start selling 60_40 portfolio after retirement
      if (localCurrentYear > yearOfRetirement) {
        // Withdraw from 60/40 portfolio
        if (portfolio60_40[localCurrentYear - 1] > 0 && netWithdrawal < portfolioValue) {
          portfolio60_40Stocks[localCurrentYear] = currentStocksValue * (1 + stocksGrowthRate / 100) - stocksWithdrawal;
          portfolio60_40Bonds[localCurrentYear] = currentBondsValue * (1 + bondsGrowthRate / 100) - bondsWithdrawal;
          // Calculate new total portfolio value
          portfolio60_40[localCurrentYear] = Math.max(portfolio60_40Stocks[localCurrentYear] + portfolio60_40Bonds[localCurrentYear], 0);
        } else {
          portfolio60_40[localCurrentYear] = 0;
        }
      } else {
        portfolio60_40Stocks[localCurrentYear] = currentStocksValue * (1 + stocksGrowthRate / 100);
        portfolio60_40Bonds[localCurrentYear] = currentBondsValue * (1 + bondsGrowthRate / 100);
        portfolio60_40[localCurrentYear] = Math.max(portfolio60_40Stocks[localCurrentYear] + portfolio60_40Bonds[localCurrentYear], 0);
      }
      // Add validation and logging
      if (isNaN(totalBalances[localCurrentYear])) {
        console.error('NaN detected in year:', localCurrentYear, {
          btcBalance: btcBalance[localCurrentYear],
          stocksBalance: stocksBalance[localCurrentYear],
          bondsBalance: bondsBalance[localCurrentYear],
          totalBalance: totalBalances[localCurrentYear],
          btcPrice,
          previousBtcPrice: btcPrices[localCurrentYear - 1],
          previousTotalBalance,
          netWithdrawal,
          withdrawals: {
            btc: btcSold[localCurrentYear],
            stocks: stocksSold[localCurrentYear],
            bonds: bondsSold[localCurrentYear],
            custom1: customAsset1Sold[localCurrentYear],
            custom2: customAsset2Sold[localCurrentYear],
            custom3: customAsset3Sold[localCurrentYear],
            custom4: customAsset4Sold[localCurrentYear],
            custom5: customAsset5Sold[localCurrentYear],
          },
        });
      }
      if (false) {
        // if (logResults) {
        console.log(`Year ${localCurrentYear}, Age: ${inputValues['current-age'] + i}
        Balance: ${formatCurrency(totalBalances[localCurrentYear])}, Other income: ${formatCurrency(otherIncome[localCurrentYear - 1])} 
        Withdrawal needed: ${formatCurrency(withdrawalsNeeded[localCurrentYear])}, Net withdrawal: ${formatCurrency(netWithdrawal)}
        Withdrawed: ${formatCurrency(
          btcSold[localCurrentYear] +
            stocksSold[localCurrentYear] +
            bondsSold[localCurrentYear] +
            customAsset1Sold[localCurrentYear] +
            customAsset2Sold[localCurrentYear] +
            customAsset3Sold[localCurrentYear] +
            customAsset4Sold[localCurrentYear] +
            customAsset5Sold[localCurrentYear]
        )}
        Roth tax penalty: ${isTaxPenalty}
        Custom asset 1: ${formatCurrency(customAsset1Balance[localCurrentYear])}, withdrawal: ${formatCurrency(customAsset1Sold[localCurrentYear])}
        Custom asset 2: ${formatCurrency(customAsset2Balance[localCurrentYear])}, withdrawal: ${formatCurrency(customAsset2Sold[localCurrentYear])}
        Custom asset 3: ${formatCurrency(customAsset3Balance[localCurrentYear])}, withdrawal: ${formatCurrency(customAsset3Sold[localCurrentYear])}
        Custom asset 4: ${formatCurrency(customAsset4Balance[localCurrentYear])}, withdrawal: ${formatCurrency(customAsset4Sold[localCurrentYear])}
        Custom asset 5: ${formatCurrency(customAsset5Balance[localCurrentYear])}, withdrawal: ${formatCurrency(customAsset5Sold[localCurrentYear])}
        BTC Balance: ${formatCurrency(btcBalance[localCurrentYear])}, withdrawal: ${formatCurrency(
          btcSold[localCurrentYear],
          2
        )}, price: ${formatCurrency(btcPrice)}
        Stocks Balance: ${formatCurrency(stocksBalance[localCurrentYear])}, withdrawal: ${formatCurrency(stocksSold[localCurrentYear])}
        Bonds Balance: ${formatCurrency(bondsBalance[localCurrentYear])}, withdrawal: ${formatCurrency(bondsSold[localCurrentYear])}
        Retirement Success: ${retirementSuccessStatus[localCurrentYear] ? 'Yes' : 'No'}
        Surplus withdrawal: ${formatCurrency(surplusWithdrawal)}
        _____________________________________________________
        60/40 Stocks: ${formatCurrency(currentStocksValue)}, withdrawal: ${formatCurrency(stocksWithdrawal)}
        60/40 Bonds: ${formatCurrency(currentBondsValue)}, withdrawal: ${formatCurrency(bondsWithdrawal)}
        60/40 Portfolio: ${formatCurrency(portfolio60_40[localCurrentYear])}
        Total withdrawal: ${formatCurrency(stocksWithdrawal + bondsWithdrawal)}

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
    inputValues['additional-cash'],
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

  //------------------ Custom assets annual contributions
  const annualCustomSavings = getAllRothAndNonRothContributions();

  // Asset 1 annual savings
  annualCustomAsset1Savings = {};
  annualCustomAsset1Savings = getAnnualSavingsOrExpenses(
    inputValues['custom-additional-1'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );

  // Asset 2 annual savings
  annualCustomAsset2Savings = {};
  annualCustomAsset2Savings = getAnnualSavingsOrExpenses(
    inputValues['custom-additional-2'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );

  // Asset 3 annual savings
  annualCustomAsset3Savings = {};
  annualCustomAsset3Savings = getAnnualSavingsOrExpenses(
    inputValues['custom-additional-3'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );

  // Asset 4 annual savings
  annualCustomAsset4Savings = {};
  annualCustomAsset4Savings = getAnnualSavingsOrExpenses(
    inputValues['custom-additional-4'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );

  // Asset 5 annual savings
  annualCustomAsset5Savings = {};
  annualCustomAsset5Savings = getAnnualSavingsOrExpenses(
    inputValues['custom-additional-5'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );

  //------------------ Annual bitcoin savings contribution
  const annualBtcSavings = getAnnualSavingsOrExpenses(
    inputValues['additional-btc'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    false,
    true
  );
  //------------------ Other annual income
  const annualOtherIncome = getAnnualSavingsOrExpenses(
    inputValues['retirement-income'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expectancy'],
    true,
    false
  );
  // console.log('Annual Bitcoin Savings: ', annualBtcSavings);

  // console.log('Annual Other Income: ', annualOtherIncome);

  //------------------ Cash balances
  // const annualCashBalances = getCashBalances(annualCashSavings, inputValues['expectancy']);
  // console.log('Cash Balances: ', cashBalances);

  //------------------ Annual withdrawals needed
  const annualWithdrawalsNeeded = getWithdrawalsNeeded(
    annualCashExpenses,
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
    btcPrices,
    retirementSuccessStatus,
    portfolio60_40,
  } = getAllBalancesAndSold(
    annualWithdrawalsNeeded,
    annualOtherIncome,
    annualBtcSavings,
    annualStocksSavings,
    annualBondsSavings,
    annualCustomSavings,
    inputValues['expectancy'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expected-stocks'],
    inputValues['expected-bonds'],
    inputValues['expected-cash'],
    inputValues['expected-btc'],
    true,
    false
  );
  // console.log('btcPrices', btcPrices);

  //------------------ Calculate gold line(move all custom assets to btc with roth)
  let totalBalancesRoth = {};

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
    annualWithdrawalsNeeded,
    annualOtherIncome,
    annualBtcSavings,
    annualStocksSavings,
    annualBondsSavings,
    annualCustomSavings,
    inputValues['expectancy'],
    currentYear + (inputValues['retirement-age'] - currentAge),
    inputValues['expected-stocks'],
    inputValues['expected-bonds'],
    inputValues['expected-cash'],
    inputValues['expected-btc'],
    false,
    true
  );

  totalBalancesRoth = totalBalancesRothL;
  // console.log('Roth line', totalBalancesRoth);

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
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (i - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['retirement-age-reversed'] = false;

        // Simulation expectancy
      } else if (selector === 'expectancy') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfDeathL = currentYear - currentAge + i;

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            currentYear + (inputValues['retirement-age'] - currentAge),
            i,
            true,
            false
          );

          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, currentYear + (inputValues['retirement-age'] - currentAge), i);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i - 1;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) greenLabel.classList.add('is--gray');
            break;
          }

          // If last loop and retirement never failed
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.add('is--gray');
            greenLabel.classList.remove('is--gray');
          }
        }
        optimalValues['expectancy-reversed'] = true;

        // Simulation expected stocks growth rate
      } else if (selector === 'expected-stocks') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');

            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['expected-stocks-reversed'] = false;

        // Simulation expected bonds growth rate
      } else if (selector === 'expected-bonds') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['expected-bonds-reversed'] = false;

        // Simulation expected cash growth rate
      } else if (selector === 'expected-cash') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['expected-cash-reversed'] = false;

        // Simulation expected bitcoin growth rate
      } else if (selector === 'expected-btc') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['expected-btc-reversed'] = false;

        // Simulation growth rate
      } else if (selector === 'growth-rate') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

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
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['growth-rate-reversed'] = false;

        // Simulation retirement-income
      } else if (selector === 'retirement-income') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step * 2) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) redLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement was never successful
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.remove('is--gray');
            greenLabel.classList.add('is--gray');
          }
        }
        optimalValues['retirement-income-reversed'] = false;

        // Simulation retirement expenses
      } else if (selector === 'retirement-expenses') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step * 2) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(i, yearOfRetirementL, inputValues['expectancy'], true, false);
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i - 1;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) greenLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.add('is--gray');
            greenLabel.classList.remove('is--gray');
          }
        }
        optimalValues['retirement-expenses-reversed'] = true;

        // Simulation capital gains
      } else if (selector === 'capital-gains') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

        for (let i = minRange; i <= maxRange; i += step) {
          const yearOfRetirementL = currentYear + (inputValues['retirement-age'] - currentAge);

          const annualCashExpensesL = getAnnualSavingsOrExpenses(
            inputValues['retirement-expenses'],
            yearOfRetirementL,
            inputValues['expectancy'],
            true,
            false
          );
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy'], i);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i - 1;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) greenLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.add('is--gray');
            greenLabel.classList.remove('is--gray');
          }
        }
        optimalValues['capital-gains-reversed'] = true;

        // Simulation inflation rate
      } else if (selector === 'inflation-rate') {
        const redLabel = document.querySelector(`#${selector} .calc-range__info-text.is--red`);
        const greenLabel = document.querySelector(`#${selector} .calc-range__info-text.is--green`);

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
          const annualWithdrawalsNeededL = getWithdrawalsNeeded(annualCashExpensesL, yearOfRetirementL, inputValues['expectancy']);

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

          const annualCustomSavingsL = getAllRothAndNonRothContributions();

          const { totalBalances: lastResultTestValue } = getAllBalancesAndSold(
            annualWithdrawalsNeededL,
            annualOtherIncomeL,
            annualBtcSavingsL,
            annualStocksSavingsL,
            annualBondsSavingsL,
            annualCustomSavingsL,
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
            optimalValues[selector] = i - 1;
            greenLabel.classList.remove('is--gray');
            redLabel.classList.remove('is--gray');
            if (i === minRange) greenLabel.classList.add('is--gray');
            break;
          }

          // If last loop and the retirement never failed
          if (i >= maxRange) {
            optimalValues[selector] = maxRange;
            redLabel.classList.add('is--gray');
            greenLabel.classList.remove('is--gray');
          }
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

  //-------- End of runSimulation function
};

//------------------ Main and sidebar chart ------------------
let chartInited = false;
let chart;
let overviewChart;
let chartElements = {};

const updateMainChart = (totalBalances, yearOfDeath, currentAge, portfolio60_40, totalBalancesRoth) => {
  const isMobileView = window.innerWidth < 991;
  if (!chartInited) {
    chartElements.chartWrap = document.querySelector('.popup__chart-content.is--main .chart-wrap');
    chartElements.resultsWrap = document.querySelector('.chart-wrap .chart-info');
    chartElements.resultAge = document.querySelector('#chart-res-age');
    chartElements.resultBtc = document.querySelector('#chart-res-btc');
    chartElements.result60_40 = document.querySelector('#chart-res-6040');
    chartElements.resultRoth = document.querySelector('#chart-res-roth');
    chartElements.rothWrap = document.querySelector('.chart-info #roth-wrap');
    chartElements.resultDifference = document.querySelector('#chart-res-diff');
  }

  const labels = [];
  // Populate the labels array from current year to year of death
  for (let year = currentYear; year <= yearOfDeath; year++) {
    const age = currentAge + (year - currentYear);
    // Display age at every 10-year milestone, or at the year of death
    if ((year - currentYear) % 10 === 0 || year === yearOfDeath) {
      labels.push(age.toString());
    } else {
      labels.push('');
    }
  }

  const filteredTotalBalances = Object.fromEntries(Object.entries(totalBalances).filter(([year]) => Number(year) <= yearOfDeath));
  const filteredPortfolio60_40 = Object.fromEntries(Object.entries(portfolio60_40).filter(([year]) => Number(year) <= yearOfDeath));

  const totalBalancesData = {
    data: Object.values(filteredTotalBalances),
    borderColor: '#399E6A',
    fill: false,
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 0,
  };

  const portfolio60_40Data = {
    data: Object.values(filteredPortfolio60_40),
    borderColor: '#0095D6',
    backgroundColor: '#CDEFFF33',
    fill: true,
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 0,
  };

  let rothData = {};

  if (displayGoldLine) {
    const filteredTotalBalancesRoth = Object.fromEntries(Object.entries(totalBalancesRoth).filter(([year]) => Number(year) <= yearOfDeath));
    rothData = {
      data: Object.values(filteredTotalBalancesRoth),
      borderColor: '#db9905',
      fill: false,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    };
    chartElements.rothWrap.classList.remove('hidden');
  } else {
    chartElements.rothWrap.classList.add('hidden');
  }
  if (goldLineEqual) totalBalancesData.borderDash = [10, 10];
  else totalBalancesData.borderDash = [0, 0];

  const ctx = document.querySelector('.calculator-chart').getContext('2d');
  const overviewCtx = document.querySelector('.overview-chart').getContext('2d');
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.font.weight = 600;

  // const corsairPlugin = {
  //   id: 'corsair',
  //   defaults: {
  //     width: 1,
  //     color: '#CCEAF7',
  //     dash: [3, 3],
  //   },
  //   afterInit: (chart, args, opts) => {
  //     chart.corsair = {
  //       x: 0,
  //       y: 0,
  //     };
  //   },
  //   afterEvent: (chart, args) => {
  //     const { inChartArea } = args;
  //     const { type, x, y } = args.event;
  //     chart.corsair = { x, y, draw: inChartArea };
  //     chart.draw();
  //   },
  //   beforeDatasetsDraw: (chart, args, opts) => {
  //     const { ctx } = chart;
  //     const { top, bottom } = chart.chartArea;
  //     const { x, draw } = chart.corsair;
  //     if (!draw) return;

  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.lineWidth = opts.width;
  //     ctx.strokeStyle = opts.color;
  //     ctx.moveTo(x, bottom);
  //     ctx.lineTo(x, top);
  //     ctx.stroke();
  //     ctx.restore();
  //   },
  // };
  // const corsairPlugin = {
  //   id: 'corsair',
  //   defaults: {
  //     width: 2,
  //     color: '#CCEAF7',
  //     dash: [0, 0],
  //   },
  //   afterInit: (chart, args, opts) => {
  //     chart.corsair = {
  //       x: 0,
  //       y: 0,
  //     };
  //   },
  //   afterEvent: (chart, args) => {
  //     const { inChartArea } = args;
  //     const { x, y } = args.event;

  //     // Get the nearest data point
  //     const points = chart.getElementsAtEventForMode(args.event, 'index', { intersect: false });

  //     if (points.length > 0) {
  //       // Get x position from the nearest point
  //       const meta = chart.getDatasetMeta(0);
  //       const element = meta.data[points[0].index];
  //       chart.corsair = { x: element.x, y, draw: inChartArea };
  //     } else {
  //       chart.corsair = { x, y, draw: false };
  //     }

  //     chart.draw();
  //   },
  //   beforeDatasetsDraw: (chart, args, opts) => {
  //     const { ctx } = chart;
  //     const { top, bottom } = chart.chartArea;
  //     const { x, draw } = chart.corsair;
  //     if (!draw) return;

  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.lineWidth = opts.width;
  //     ctx.strokeStyle = opts.color;
  //     ctx.setLineDash(opts.dash);
  //     ctx.moveTo(x, bottom);
  //     ctx.lineTo(x, top);
  //     ctx.stroke();
  //     ctx.restore();
  //   },
  // };
  const corsairPlugin = {
    id: 'corsair',
    defaults: {
      width: 2,
      color: '#CCEAF7',
      dash: [0, 0],
    },
    afterInit: (chart, args, opts) => {
      chart.corsair = {
        x: 0,
        y: 0,
      };
    },
    afterEvent: (chart, args) => {
      const { inChartArea } = args;
      const { x, y } = args.event;

      // Get the nearest data point
      const points = chart.getElementsAtEventForMode(args.event, 'index', { intersect: false });

      if (points.length > 0) {
        // Get x position from the nearest point
        const meta = chart.getDatasetMeta(0);
        const element = meta.data[points[0].index];
        chart.corsair = { x: element.x, y, draw: inChartArea };

        // Update results display
        const dataIndex = points[0].index;
        const age = inputValues['current-age'] + dataIndex;
        const btcStrat = chart.data.datasets[0].data[dataIndex];
        const portfolioStrat = chart.data.datasets[1].data[dataIndex];
        const rothStrat = chart.data.datasets[2]?.data[dataIndex] || 0;

        chartElements.resultAge.textContent = age;
        chartElements.resultBtc.textContent = formatCurrency(btcStrat);
        chartElements.result60_40.textContent = formatCurrency(portfolioStrat);
        chartElements.resultRoth.textContent = formatCurrency(rothStrat);
        chartElements.resultDifference.textContent = formatCurrency(btcStrat - portfolioStrat);

        chartElements.resultsWrap.classList.remove('is--inactive');
      } else {
        chart.corsair = { x, y, draw: false };
        chartElements.resultsWrap.classList.add('is--inactive');
      }

      chart.draw();
    },
    beforeDatasetsDraw: (chart, args, opts) => {
      const { ctx } = chart;
      const { top, bottom } = chart.chartArea;
      const { x, draw } = chart.corsair;
      if (!draw) return;

      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = opts.width;
      ctx.strokeStyle = opts.color;
      ctx.setLineDash(opts.dash);
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, top);
      ctx.stroke();
      ctx.restore();
    },
  };
  // const dotPlugin = {
  //   id: 'dotPlugin',
  //   afterDraw: (chart) => {
  //     const activeElements = chart.getActiveElements();

  //     if (activeElements.length > 0) {
  //       const { ctx } = chart;
  //       const hoveredIndex = activeElements[0].index;

  //       chart.data.datasets.forEach((dataset, datasetIndex) => {
  //         const meta = chart.getDatasetMeta(datasetIndex);
  //         const element = meta.data[hoveredIndex];

  //         if (element) {
  //           ctx.save();

  //           // Draw white border
  //           ctx.beginPath();
  //           ctx.arc(element.x, element.y, 7, 0, Math.PI * 2);
  //           ctx.fillStyle = 'white';
  //           ctx.fill();
  //           ctx.closePath();

  //           // Draw colored dot
  //           ctx.beginPath();
  //           ctx.arc(element.x, element.y, 5, 0, Math.PI * 2);
  //           ctx.fillStyle = dataset.borderColor;
  //           ctx.fill();
  //           ctx.closePath();

  //           ctx.restore();
  //         }
  //       });
  //     }
  //   },
  // };
  const dotPlugin = {
    id: 'dotPlugin',
    afterDraw: (chart) => {
      const activeElements = chart.getActiveElements();

      if (activeElements.length > 0) {
        const { ctx } = chart;
        const hoveredIndex = activeElements[0].index;

        // Draw regular hover dots
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          const element = meta.data[hoveredIndex];

          if (element) {
            ctx.save();

            // Draw white border
            ctx.beginPath();
            ctx.arc(element.x, element.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();

            // Draw colored dot
            ctx.beginPath();
            ctx.arc(element.x, element.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = dataset.borderColor;
            ctx.fill();
            ctx.closePath();

            ctx.restore();
          }
        });

        // Draw target age dot at the top
        const meta = chart.getDatasetMeta(0); // Get first dataset meta for x position
        const element = meta.data[hoveredIndex];

        if (element) {
          ctx.save();

          // Calculate position (use element's x, but fixed y at top)
          const x = element.x;
          const y = chart.chartArea.top;

          // Draw white border
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.closePath();

          // Draw dark blue dot
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#002851';
          ctx.fill();
          ctx.closePath();

          // Add "Target Age" text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#002851';
          ctx.font = 'bold 12px Inter';
          ctx.fillText('Target Age', x, y - 8);

          ctx.restore();
        }
      }
    },
  };

  const mainChartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [totalBalancesData, portfolio60_40Data],
    },
    options: {
      responsive: true,
      // responsive: false,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 0,
        },
      },
      scales: {
        x: {
          beginAtZero: false,
          border: {
            display: true,
            color: '#0A5999',
            width: 2,
          },
          grid: {
            display: false,
            drawOnChartArea: false,
            drawBorder: false,
            drawTicks: false,
            offset: false,
          },
          // clip: true,
          // offset: true,
          title: {
            display: true,
            text: 'AGE',
            color: '#0A5999',
            font: {
              size: isMobileView ? 12 : 16,
              weight: 'bold',
            },
          },
          ticks: {
            color: '#0A5999',
            size: 12,
            weight: 'bold',
            family: 'Inter',
            autoSkip: false,
            padding: isMobileView ? 10 : 18,

            rotation: 0, // Force horizontal alignment
            minRotation: 0, // Prevent automatic rotation
            maxRotation: 0, // Prevent automatic rotation
            align: 'start', // Align text to the end (right side)
            crossAlign: 'far', // Position the text away from the axis
          },
        },
        y: {
          beginAtZero: false,
          grid: {
            display: true,
            color: '#CCEAF7',
            drawBorder: false,
            drawTicks: false,
            offset: false,
          },
          border: {
            display: true,
            color: '#0A5999',
            width: 2,
          },
          ticks: {
            padding: 0,
            color: '#0A5999',
            size: isMobileView ? 10 : 12,
            weight: 'bold',
            family: 'Inter',
            callback: (value) => formatCurrencyShort(value),
            padding: 8,
          },
          title: {
            display: false,
          },
        },
      },
      layout: {
        // padding: isMobileView ? 0 : 10,
        padding: {
          top: 24,
          bottom: isMobileView ? 0 : 10,
          left: isMobileView ? 0 : 10,
          right: isMobileView ? 0 : 10,
        },
      },
    },
    plugins: [corsairPlugin, dotPlugin],
  };

  const overviewChartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [totalBalancesData, portfolio60_40Data],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],

      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 0,
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
        enabled: true,
      },
      scales: {
        x: {
          beginAtZero: false,
          border: {
            display: true,
            color: '#0A5999',
            width: 2,
          },
          grid: {
            display: false,
            drawOnChartArea: false,
            drawBorder: false,
            drawTicks: false,
            offset: false,
          },
          // clip: true,
          // offset: true,
          title: {
            display: true,
            text: 'AGE',
            color: '#0A5999',
            padding: 10,
            font: {
              size: 8,
              weight: 'bold',
            },
          },
          ticks: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          grid: {
            display: true,
            color: '#CCEAF7',
            drawBorder: false,
            drawTicks: false,
            offset: false,
          },
          border: {
            display: true,
            color: '#0A5999',
            width: 2,
          },
          ticks: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      },
      layout: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 1,
        },
      },
    },
  };

  if (displayGoldLine) {
    mainChartConfig.data.datasets.push(rothData);
    overviewChartConfig.data.datasets.push(rothData);
  }

  if (chartInited) {
    // Update existing chart
    chart.data.labels = labels;
    chart.data.datasets = mainChartConfig.data.datasets;
    chart.options = mainChartConfig.options; // Update options to ensure scale settings are applied
    chart.update('none'); // Use 'none' animation mode for immediate update

    overviewChart.data.labels = labels;
    overviewChart.data.datasets = overviewChartConfig.data.datasets;
    overviewChart.options = overviewChartConfig.options;
    overviewChart.update('none');
  } else {
    // Create new chart
    chart = new Chart(ctx, mainChartConfig);
    overviewChart = new Chart(overviewCtx, overviewChartConfig);

    // Add hover event listener after chart is created
    // ctx.canvas.addEventListener('mousemove', (event) => {
    //   const points = chart.getElementsAtEventForMode(event, 'index', { intersect: false });
    //   if (points.length) {
    //     const firstPoint = points[0];
    //     const dataIndex = firstPoint.index;
    //     const age = inputValues['current-age'] + dataIndex;
    //     const btcStrat = chart.data.datasets[0].data[dataIndex];
    //     const portfolioStrat = chart.data.datasets[1].data[dataIndex];
    //     const rothStrat = chart.data.datasets[2]?.data[dataIndex] || 0;

    //     chartElements.resultAge.textContent = age;
    //     chartElements.resultBtc.textContent = formatCurrency(btcStrat);
    //     chartElements.result60_40.textContent = formatCurrency(portfolioStrat);
    //     chartElements.resultRoth.textContent = formatCurrency(rothStrat);
    //     chartElements.resultDifference.textContent = formatCurrency(btcStrat - portfolioStrat);

    //     chartElements.resultsWrap.classList.remove('is--inactive');
    //   } else chartElements.resultsWrap.classList.add('is--inactive');
    // });

    // ctx.canvas.addEventListener('mouseleave', () => {
    //   chartElements.resultsWrap.classList.add('is--inactive');
    // });

    chartInited = true;
  }
};
