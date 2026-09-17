/**
 * TIME SLOT & NATURAL SPOKEN SCHEDULE PARSER
 *
 * Converts natural spoken time queries into structured schedule data:
 * - "I am free from 4 PM to 6 PM" -> startTime: "16:00", endTime: "18:00", durationMinutes: 120
 * - "I have one hour available at 7 PM" -> startTime: "19:00", endTime: "20:00", durationMinutes: 60
 * - "Add DSA practice tomorrow at 7:30 PM" -> title: "DSA practice", dueTime: "19:30"
 */

export interface ParsedTimeSlot {
  title?: string;
  startTime?: string; // 24-hour format "HH:MM"
  endTime?: string;   // 24-hour format "HH:MM"
  dueTime?: string;   // 24-hour format "HH:MM"
  durationMinutes?: number;
  timeSlotString?: string;
  hasTimeInfo: boolean;
}

/**
 * Convert 12-hour hour/minute string with AM/PM to "HH:MM" 24-hour string
 */
export function format24Hour(hourStr: string, minuteStr?: string, ampm?: string): string {
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
  const isPM = (ampm || '').toUpperCase() === 'PM';
  const isAM = (ampm || '').toUpperCase() === 'AM';

  if (isPM && hour < 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }

  const hStr = hour.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

/**
 * Parse natural spoken phrases to extract time intervals, durations, and activity names
 */
export function parseSpokenTimeSlot(transcript: string): ParsedTimeSlot {
  if (!transcript || !transcript.trim()) {
    return { hasTimeInfo: false };
  }

  const clean = transcript.trim();
  const result: ParsedTimeSlot = { hasTimeInfo: false };

  // 1. Range Pattern: "from 4(:00)? (am|pm) to 6(:00)? (am|pm)" or "4 (am|pm) - 6 (am|pm)"
  const rangeRegex = /(?:from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  const rangeMatch = clean.match(rangeRegex);

  if (rangeMatch) {
    const startH = rangeMatch[1];
    const startM = rangeMatch[2] || '00';
    let startAmpm = rangeMatch[3];
    const endH = rangeMatch[4];
    const endM = rangeMatch[5] || '00';
    const endAmpm = rangeMatch[6];

    // If start AM/PM omitted, default to end AM/PM
    if (!startAmpm && endAmpm) {
      startAmpm = endAmpm;
    }

    const startTime = format24Hour(startH, startM, startAmpm);
    const endTime = format24Hour(endH, endM, endAmpm);

    // Calculate duration in minutes
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; // Crosses midnight

    result.startTime = startTime;
    result.endTime = endTime;
    result.dueTime = startTime;
    result.durationMinutes = diff > 0 ? diff : 60;
    result.timeSlotString = `${startH}:${startM} ${startAmpm?.toUpperCase() || ''} - ${endH}:${endM} ${endAmpm.toUpperCase()}`;
    result.hasTimeInfo = true;
  }

  // 2. Single Time Point Pattern: "at 7(:00)? (am|pm)" or "7:30 pm"
  if (!result.startTime) {
    const singleTimeRegex = /(?:at|around|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
    const singleMatch = clean.match(singleTimeRegex);

    if (singleMatch) {
      const h = singleMatch[1];
      const m = singleMatch[2] || '00';
      const ampm = singleMatch[3];
      const time24 = format24Hour(h, m, ampm);

      result.dueTime = time24;
      result.startTime = time24;
      result.hasTimeInfo = true;
    }
  }

  // 3. Duration Pattern: "1 hour", "one hour", "2 hours", "two hours", "30 minutes", "45 mins", "1.5 hours"
  const wordToNum: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    half: 0.5,
    'a': 1,
    'an': 1
  };
  const durationRegex = /(\d+(?:\.\d+)?|one|two|three|four|five|six|half|a|an)\s*(?:an\s*)?(hours?|hrs?|minutes?|mins?)/i;
  const durMatch = clean.match(durationRegex);
  if (durMatch) {
    const rawVal = durMatch[1].toLowerCase();
    const val = wordToNum[rawVal] !== undefined ? wordToNum[rawVal] : parseFloat(rawVal);
    const unit = durMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      result.durationMinutes = Math.round(val * 60);
    } else {
      result.durationMinutes = Math.round(val);
    }
    result.hasTimeInfo = true;
  }

  // 4. Extract clean activity title by stripping time keywords
  const strippedTitle = clean
    .replace(/(?:from\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:to|-|until)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
    .replace(/(?:at|around|by)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
    .replace(/\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)/gi, '')
    .replace(/\b(i am free|i can study|i have|available|tomorrow|today|tonight|morning|evening|afternoon)\b/gi, '')
    .replace(/^[,.\s-]+|[,.\s-]+$/g, '')
    .trim();

  if (strippedTitle.length > 2) {
    result.title = strippedTitle.charAt(0).toUpperCase() + strippedTitle.slice(1);
  }

  return result;
}
