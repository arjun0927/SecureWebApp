
export const convertToNumber = (input) => {
  if (input === "" || input === null || input === undefined) return 0;

  // If input is already a number, return it directly
  if (typeof input === 'number') {
    return input;
  }

  // If input is a string, clean it up (remove commas and spaces)
  if (typeof input === 'string') {
    const cleanedStr = input.replace(/[, ]+/g, '');

    // Convert the cleaned string into a number
    const num = parseFloat(cleanedStr);

    // Check if the conversion is successful and return the number
    if (isNaN(num)) {
      return 0;
    }
    return num;
  }
  return 0;
};

export const checkNumberCondition = (value, condition, conditionValue) => {
  const numericValue = parseFloat(value);

  switch (String(condition)) {
    case 'is greater than':
      return numericValue > parseFloat(conditionValue);

    case 'is less than':
      return numericValue < parseFloat(conditionValue);

    case 'is equal to':
      return numericValue === parseFloat(conditionValue);

    case 'is not equal to':
      return numericValue !== parseFloat(conditionValue);

    case 'is between':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const [min, max] = conditionValue.map(parseFloat);
        return numericValue > min && numericValue < max;
      }
      return false;

    case 'is not between':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const [min, max] = conditionValue.map(parseFloat);
        return numericValue <= min || numericValue >= max;
      }
      return false;

    default:
      return false;
  }
};


export const checkStringCondition = (value, condition, conditionValue) => {
  // Fallback to empty string for null/undefined
  value = value == null ? "" : String(value).toLowerCase();
  conditionValue = conditionValue == null ? "" : String(conditionValue).toLowerCase();
  condition = String(condition).toLowerCase(); // <-- fix here

  switch (condition) {
    case 'contains':
      return value.includes(conditionValue);
    case 'does not contain':
      return !value.includes(conditionValue);
    case 'starts with':
      return value.startsWith(conditionValue);
    case 'ends with':
      return value.endsWith(conditionValue);
    case 'is equal to':
      return value === conditionValue;
    case 'is not equal to':
      return value !== conditionValue;
    default:
      return false;
  }
};


export const checkBooleanCondition = (value, condition) => {
  value = String(value).toLowerCase();
  condition = String(condition).toLowerCase();

  switch (condition) {
    case 'is true':
      return value === 'true';
    case 'is false':
      return value === 'false';
    default:
      return false;
  }
};


const parseDate = (str) => {
  if (str instanceof Date) return str;

  if (typeof str === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('-');
    return new Date(`${yyyy}-${mm}-${dd}`);
  }

  return new Date(str); // fallback for valid ISO strings like "2025-06-03"
};


export const checkDateCondition = (value, condition, conditionValue) => {
  const valueDate = parseDate(value);
  if (isNaN(valueDate.getTime())) return false;

  switch (condition) {
    case 'is before': {
      const dateValue = parseDate(conditionValue);
      return !isNaN(dateValue.getTime()) && valueDate < dateValue;
    }

    case 'is after': {
      const dateValue = parseDate(conditionValue);
      return !isNaN(dateValue.getTime()) && valueDate > dateValue;
    }

    case 'is on': {
      const dateValue = parseDate(conditionValue);
      return !isNaN(dateValue.getTime()) &&
             valueDate.toDateString() === dateValue.toDateString();
    }

    case 'is not on': {
      const dateValue = parseDate(conditionValue);
      return !isNaN(dateValue.getTime()) &&
             valueDate.toDateString() !== dateValue.toDateString();
    }

    case 'is between':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const startDate = parseDate(conditionValue[0]);
        const endDate = parseDate(conditionValue[1]);
        return (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          valueDate >= startDate &&
          valueDate <= endDate
        );
      }
      return false;

    case 'is not between':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const startDate = parseDate(conditionValue[0]);
        const endDate = parseDate(conditionValue[1]);
        return (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          (valueDate < startDate || valueDate > endDate)
        );
      }
      return false;

    default:
      return false;
  }
};


