// Format HL7 datetime to FHIR datetime with timezone support and protection against incomplete dates
export function formatHL7DateTime(hl7DateTime: string): string | undefined {
  if (!hl7DateTime || hl7DateTime.length < 4) {
    return undefined;
  }

  // Handle timezone offset (e.g., 20240922103000+0500 or 20240922103000-0500)
  let timezoneOffset = '';
  let dateTimeStr = hl7DateTime;

  // Check for timezone offset at the end
  const timezoneMatch = hl7DateTime.match(/([+-]\d{4})$/);
  if (timezoneMatch) {
    timezoneOffset = timezoneMatch[1];
    dateTimeStr = hl7DateTime.substring(0, hl7DateTime.length - 5);
  }

  // Validate that we have at least a year
  if (dateTimeStr.length < 4) {
    return undefined;
  }

  const year = dateTimeStr.substring(0, 4);

  // Validate year is reasonable (1900-2100)
  const yearNum = parseInt(year, 10);
  if (yearNum < 1900 || yearNum > 2100) {
    return undefined;
  }

  let formatted = year;

  // Add month if available
  if (dateTimeStr.length >= 6) {
    const month = dateTimeStr.substring(4, 6);
    const monthNum = parseInt(month, 10);
    if (monthNum >= 1 && monthNum <= 12) {
      formatted += `-${month}`;
    } else {
      return `${year}-01`;
    }
  } else {
    return `${year}-01-01`;
  }

  // Add day if available
  if (dateTimeStr.length >= 8) {
    const day = dateTimeStr.substring(6, 8);
    const dayNum = parseInt(day, 10);
    if (dayNum >= 1 && dayNum <= 31) {
      formatted += `-${day}`;
    } else {
      formatted += '-01';
      console.warn(
        `Invalid day ${day} in HL7 datetime ${hl7DateTime}, defaulting to 01`,
      );
    }
  } else {
    formatted += '-01';
    console.warn(
      `Incomplete HL7 datetime ${hl7DateTime}, defaulting day to 01`,
    );
  }

  // Add time if available
  if (dateTimeStr.length >= 14) {
    const hour = dateTimeStr.substring(8, 10);
    const minute = dateTimeStr.substring(10, 12);
    const second = dateTimeStr.substring(12, 14);

    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    const secondNum = parseInt(second, 10);

    if (
      hourNum >= 0 &&
      hourNum <= 23 &&
      minuteNum >= 0 &&
      minuteNum <= 59 &&
      secondNum >= 0 &&
      secondNum <= 59
    ) {
      formatted += `T${hour}:${minute}:${second}`;
    } else {
      formatted += 'T00:00:00';
      console.warn(
        `Invalid time ${hour}:${minute}:${second} in HL7 datetime ${hl7DateTime}, defaulting to 00:00:00`,
      );
    }
  } else {
    formatted += 'T00:00:00';
    console.warn(
      `No time component in HL7 datetime ${hl7DateTime}, defaulting to 00:00:00`,
    );
  }

  // Add timezone offset or default to Z (UTC)
  if (timezoneOffset) {
    // Convert +0500 to +05:00 format for FHIR
    const offsetHours = timezoneOffset.substring(0, 3);
    const offsetMinutes = timezoneOffset.substring(3, 5);
    formatted += `${offsetHours}:${offsetMinutes}`;
  } else {
    formatted += 'Z';
  }

  return formatted;
}
