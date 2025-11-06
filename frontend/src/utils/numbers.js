/**
 * Утилиты для работы с числами
 * PostgreSQL возвращает DECIMAL как строку, поэтому нужно преобразование
 */

/**
 * Безопасно форматирует число с фиксированным количеством знаков после запятой
 * @param {string|number} value - Значение для форматирования
 * @param {number} decimals - Количество знаков после запятой (по умолчанию 2)
 * @returns {string} Отформатированное число
 */
export function formatNumber(value, decimals = 2) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimals);
}

/**
 * Безопасно форматирует валюту (добавляет символ валюты)
 * @param {string|number} value - Значение для форматирования
 * @param {string} currency - Символ валюты (по умолчанию 'грн')
 * @returns {string} Отформатированная валюта
 */
export function formatCurrency(value, currency = 'грн') {
  return `${formatNumber(value)} ${currency}`;
}

/**
 * Безопасно преобразует значение в число
 * @param {string|number} value - Значение для преобразования
 * @param {number} defaultValue - Значение по умолчанию (по умолчанию 0)
 * @returns {number} Число
 */
export function toNumber(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}
