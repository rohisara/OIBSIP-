(function () {
  'use strict';

  // ---- Constants ----
  const KELVIN_OFFSET = 273.15;
  const ABSOLUTE_ZERO_C = -273.15;
  const EPSILON = 1e-9; // guards against floating point noise (e.g. -459.67 °F)

  // ---- Elements ----
  const form = document.getElementById('converter-form');
  const input = document.getElementById('temp-input');
  const errorEl = document.getElementById('input-error');
  const resultsSection = document.querySelector('.results');
  const emptyMsg = document.getElementById('results-empty');
  const list = document.getElementById('results-list');
  const mercury = document.getElementById('mercury');
  const bulb = document.getElementById('bulb');
  const out = {
    C: document.getElementById('out-c'),
    F: document.getElementById('out-f'),
    K: document.getElementById('out-k')
  };
  const unitNames = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' };
  const absoluteZeroText = {
    C: '-273.15 °C',
    F: '-459.67 °F',
    K: '0 K'
  };

  // ---- Conversion formulas ----
  function toCelsius(value, unit) {
    if (unit === 'F') return (value - 32) * 5 / 9;
    if (unit === 'K') return value - KELVIN_OFFSET;
    return value;
  }

  function fromCelsius(c) {
    return {
      C: c,
      F: c * 9 / 5 + 32,
      K: c + KELVIN_OFFSET
    };
  }

  // ---- Helpers ----
  function selectedUnit() {
    return form.querySelector('input[name="unit"]:checked').value;
  }

  function formatNumber(n) {
    // Round to 2 decimals, drop trailing zeros, avoid "-0"
    const rounded = Math.round(n * 100) / 100;
    const value = Object.is(rounded, -0) ? 0 : rounded;
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  // Returns { ok: true, value } or { ok: false, message }
  function validate() {
    const raw = input.value.trim();

    if (raw === '') {
      return { ok: false, message: 'Enter a temperature to convert.', quiet: true };
    }
    // Digits with an optional sign and optional decimal part (".5", "-3.", "12.34")
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(raw)) {
      return { ok: false, message: 'Enter a number only, such as 25 or -3.5. Letters and symbols are not allowed.' };
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || Math.abs(value) > 1e12) {
      return { ok: false, message: 'That number is too large. Enter a value below 1,000,000,000,000.' };
    }

    const unit = selectedUnit();
    if (toCelsius(value, unit) < ABSOLUTE_ZERO_C - EPSILON) {
      return {
        ok: false,
        absoluteZero: true,
        message: 'Temperatures below absolute zero (' + absoluteZeroText[unit] +
          ') are not physically possible. Enter a higher value.'
      };
    }
    return { ok: true, value: value, unit: unit };
  }

  function showError(message) {
    errorEl.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function resetResults() {
    resultsSection.classList.remove('has-error');
    const notice = resultsSection.querySelector('.notice');
    if (notice) notice.remove();
    list.hidden = true;
    emptyMsg.hidden = false;
  }

  function updateThermometer(celsius) {
    // Scale: -50 °C (empty) to 150 °C (full)
    const pct = Math.min(1, Math.max(0.04, (celsius + 50) / 200)) * 100;
    // Hue runs from blue (cold) to red (hot)
    const t = Math.min(1, Math.max(0, (celsius + 20) / 80));
    const hue = 210 - t * 202;
    const color = 'hsl(' + hue.toFixed(0) + ', 75%, 48%)';
    mercury.style.height = pct + '%';
    mercury.style.backgroundColor = color;
    bulb.style.backgroundColor = color;
  }

  // ---- Real-time validation (as the user types or changes unit) ----
  function liveValidate() {
    const result = validate();
    if (result.ok || result.quiet) {
      showError('');
    } else {
      showError(result.message);
    }
    resetResults();
  }

  input.addEventListener('input', liveValidate);
  form.querySelectorAll('input[name="unit"]').forEach(function (radio) {
    radio.addEventListener('change', liveValidate);
  });

  // ---- Convert button (also fires on Enter) ----
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const result = validate();

    if (!result.ok) {
      showError(result.message);
      resetResults();
      if (result.absoluteZero) {
        // Also show the friendly message in the result area
        emptyMsg.hidden = true;
        resultsSection.classList.add('has-error');
        list.hidden = false;
        let notice = resultsSection.querySelector('.notice');
        if (!notice) {
          notice = document.createElement('p');
          notice.className = 'notice';
          list.after(notice);
        }
        notice.textContent = result.message;
      }
      input.focus();
      return;
    }

    showError('');
    resetResults();

    const celsius = toCelsius(result.value, result.unit);
    const converted = fromCelsius(celsius);
    // Kelvin can never be below zero; clamp tiny floating point error
    if (converted.K < 0) converted.K = 0;

    ['C', 'F', 'K'].forEach(function (u) {
      out[u].textContent = formatNumber(converted[u]);
      list.querySelector('[data-unit="' + u + '"]')
        .classList.toggle('is-input', u === result.unit);
    });

    emptyMsg.hidden = true;
    list.hidden = false;
    updateThermometer(celsius);
  });
})();
