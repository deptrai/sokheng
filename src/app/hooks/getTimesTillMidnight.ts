export function getTimesTillMidnight() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  let startHour = currentHour;

  if (currentMinutes > 0) {
    startHour += 1;
  }

  const times = [];
  const timesNoDots = [];
  for (let hour = startHour + 1; hour <= 23; hour++) {
    let time = `${hour.toString().padStart(2, "0")}:00`;
    let timeNoDots = `${hour.toString().padStart(2, "0")}00`;
    times.push(time);
    timesNoDots.push(timeNoDots);
  }

  return { times, timesNoDots };
}

export function isRestaurantOpen(openTime?: string, closeTime?: string, currentDate?: Date): boolean {
  if (!openTime || !closeTime) {
    return false;
  }

  const now = currentDate || new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Parse open and close times
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  // Check if restaurant operates overnight (closes next day)
  if (closeTimeInMinutes <= openTimeInMinutes) {
    // Overnight operation: open from openTime to midnight, then midnight to closeTime
    // Restaurant is open if current time is >= openTime OR <= closeTime
    return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
  } else {
    // Normal same-day operation
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  }
}
