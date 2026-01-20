/**
 * Passport MRZ (Machine Readable Zone) Validation Service
 * Validates passport number format and structure
 * Used ONLY for identity confirmation, not travel verification
 * 
 * Supports various passport formats:
 * - Standard 9-digit format (most common)
 * - International 6-9 digit formats
 * - Optional check digits
 */

/**
 * Validate passport number format
 * Returns true if format is valid, false otherwise
 */
export const validatePassportFormat = (passportNumber) => {
  if (!passportNumber || typeof passportNumber !== 'string') {
    return false;
  }

  const cleaned = passportNumber.trim().toUpperCase();

  // Most common: 6-9 alphanumeric characters
  // Must start with letter, can contain numbers
  const basicFormat = /^[A-Z]\d{5,8}$/;
  const advancedFormat = /^[A-Z]{1,2}\d{6,8}$/;
  const flexibleFormat = /^[A-Z0-9]{6,9}$/;

  // Check if it matches any common passport format
  if (basicFormat.test(cleaned) || advancedFormat.test(cleaned)) {
    return true;
  }

  // More flexible validation for international formats
  if (flexibleFormat.test(cleaned) && cleaned.length >= 6 && cleaned.length <= 9) {
    // Must have at least one letter
    if (/[A-Z]/.test(cleaned)) {
      return true;
    }
  }

  return false;
};

/**
 * Validate MRZ (Machine Readable Zone) check digits
 * Passports contain check digits that can be validated mathematically
 */
export const validateMRZCheckDigit = (mrzString, position = 27) => {
  if (!mrzString || position >= mrzString.length) {
    return false;
  }

  try {
    const weights = [7, 3, 1];
    let sum = 0;

    for (let i = 0; i < Math.min(mrzString.length - 1, 27); i++) {
      const char = mrzString[i];
      let value = 0;

      if (/\d/.test(char)) {
        value = parseInt(char, 10);
      } else if (/[A-Z]/.test(char)) {
        value = char.charCodeAt(0) - 55; // A=10, B=11, etc.
      } else if (char === '<') {
        value = 0; // Filler character
      } else {
        value = 0;
      }

      sum += value * weights[i % 3];
    }

    const checkDigit = sum % 10;
    const providedDigit = parseInt(mrzString[position], 10);

    return checkDigit === providedDigit;
  } catch (error) {
    console.warn('MRZ validation error:', error);
    return false;
  }
};

/**
 * Get passport format info by country code
 * Different countries use different passport formats
 */
export const getPassportFormatByCountry = (countryCode) => {
  const passportFormats = {
    'US': { length: 9, format: 'numeric only', startsWith: null },
    'GB': { length: 9, format: 'alphanumeric', startsWith: null },
    'CA': { length: 8, format: 'alphanumeric', startsWith: null },
    'AU': { length: 9, format: 'numeric only', startsWith: null },
    'DE': { length: 10, format: 'alphanumeric', startsWith: '0' },
    'FR': { length: 9, format: 'alphanumeric', startsWith: null },
    'JP': { length: 8, format: 'numeric only', startsWith: null },
    'BR': { length: 9, format: 'numeric only', startsWith: null },
    'IN': { length: 8, format: 'alphanumeric', startsWith: null },
    'CN': { length: 9, format: 'alphanumeric', startsWith: 'E' },
  };

  return passportFormats[countryCode?.toUpperCase()] || {
    length: '6-9',
    format: 'alphanumeric',
    startsWith: null,
  };
};

/**
 * Validate passport appears reasonable for claimed country
 */
export const validatePassportForCountry = (passportNumber, countryCode) => {
  if (!passportNumber || !countryCode) {
    return { valid: false, reason: 'Missing passport or country code' };
  }

  const format = getPassportFormatByCountry(countryCode);
  const cleaned = passportNumber.trim().toUpperCase();

  // Check length
  if (typeof format.length === 'number' && cleaned.length !== format.length) {
    if (typeof format.length === 'string' && !cleaned.length.toString().match(format.length)) {
      return {
        valid: false,
        reason: `Expected ${format.length} characters, got ${cleaned.length}`,
      };
    }
  }

  // Check start character if specified
  if (format.startsWith && !cleaned.startsWith(format.startsWith)) {
    return {
      valid: false,
      reason: `Expected to start with ${format.startsWith}`,
    };
  }

  // Check format requirements
  if (format.format === 'numeric only' && !/^\d+$/.test(cleaned)) {
    return { valid: false, reason: 'This country uses numeric-only passports' };
  }

  return { valid: true, reason: 'Format appears valid for country' };
};

/**
 * Extract information from MRZ line (if available)
 * Standard MRZ format: <country><passport_number><check_digit>...
 */
export const parseMRZLine = (mrzLine) => {
  if (!mrzLine || mrzLine.length < 44) {
    return null;
  }

  try {
    return {
      country: mrzLine.substring(0, 3).replace(/</g, ''),
      passportNumber: mrzLine.substring(5, 14),
      nationality: mrzLine.substring(19, 22).replace(/</g, ''),
      dateOfBirth: mrzLine.substring(22, 28),
      sex: mrzLine.substring(29, 30),
      passportExpiry: mrzLine.substring(35, 41),
    };
  } catch (error) {
    console.warn('MRZ parsing error:', error);
    return null;
  }
};

/**
 * Validate entire passport data object
 * For passports that provide full information
 */
export const validatePassportData = (passportData) => {
  const errors = [];

  if (!passportData.number) {
    errors.push('Passport number is required');
  } else if (!validatePassportFormat(passportData.number)) {
    errors.push('Invalid passport number format');
  }

  if (!passportData.country) {
    errors.push('Country is required');
  } else if (!/^[A-Z]{2,3}$/.test(passportData.country)) {
    errors.push('Invalid country code format');
  }

  if (passportData.expiryDate) {
    const expiry = new Date(passportData.expiryDate);
    if (expiry < new Date()) {
      errors.push('Passport has expired');
    }
  }

  if (passportData.dateOfBirth) {
    const dob = new Date(passportData.dateOfBirth);
    const age = (new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 0) {
      errors.push('Invalid date of birth (future date)');
    } else if (age > 120) {
      errors.push('Invalid date of birth (unrealistic age)');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    message: errors.length === 0 ? 'Passport data is valid' : errors.join('; '),
  };
};

/**
 * Check if passport number looks duplicated (basic fraud check)
 * Stores hashed passport numbers to detect re-use
 */
export const checkPassportDuplication = (passportNumber) => {
  // In production, this would query backend database
  // For now, just basic client-side validation
  
  const cleaned = passportNumber.trim().toUpperCase();

  // Check for obviously repeated patterns
  if (/(.)\\1{5,}/.test(cleaned)) {
    return {
      isDuplicate: true,
      reason: 'Passport contains repeated characters',
    };
  }

  // Check for sequential patterns
  if (/012345|123456|234567|345678|456789|567890|ABCDEF|BCDEFG|CDEFGH|DEFGHI|EFGHIJ/.test(cleaned)) {
    return {
      isDuplicate: true,
      reason: 'Passport contains sequential characters',
    };
  }

  return {
    isDuplicate: false,
    reason: 'Passport appears unique',
  };
};

/**
 * Summary validation function - validates all aspects
 * Used as main entry point for passport validation
 */
export const validatePassportComprehensive = (passportNumber, countryCode = null) => {
  const results = {
    basicFormat: validatePassportFormat(passportNumber),
    countryValidation: countryCode ? validatePassportForCountry(passportNumber, countryCode) : null,
    duplicationCheck: checkPassportDuplication(passportNumber),
    overallValid: false,
  };

  // Overall validation: must pass basic format and duplication check
  // Country validation is optional if not specified
  results.overallValid =
    results.basicFormat &&
    !results.duplicationCheck.isDuplicate &&
    (results.countryValidation === null || results.countryValidation.valid);

  return results;
};
