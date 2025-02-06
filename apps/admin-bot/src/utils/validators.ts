export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && Number(value) > 0;
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidAssetCode(value: string): boolean {
  return /^[A-Z0-9]{1,12}$/.test(value);
}

export function isValidAddress(value: string): boolean {
  return /^[A-Z0-9]{56}$/.test(value);
}
