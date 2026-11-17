# Temperature Converter

A vanilla HTML5 / CSS3 / JavaScript tool that converts between Celsius, Fahrenheit and Kelvin.

## Run it
Open `index.html` in any modern browser. No build step or dependencies.

## Files
- `index.html` – page structure and form
- `style.css` – layout and styling
- `script.js` – conversion formulas, validation, result display

## Formulas
- C to F: `F = C * 9/5 + 32`
- F to C: `C = (F - 32) * 5/9`
- C to K: `K = C + 273.15`  /  K to C: `C = K - 273.15`
All conversions go through Celsius.

## Validation
- Non-numeric input shows an error as you type.
- Values below absolute zero (-273.15 °C, -459.67 °F, 0 K) show a friendly message.
