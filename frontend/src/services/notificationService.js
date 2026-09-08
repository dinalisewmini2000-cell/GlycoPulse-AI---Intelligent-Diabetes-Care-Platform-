/**
 * GlycoPulse AI - Web Push Notifications & Medication Scheduler Service
 * 
 * Implements standard browser Web Notification API (Notification.requestPermission())
 * and a local scheduler to trigger push notifications for scheduled insulin/medication doses
 * and hydration reminders.
 */

let schedulerIntervalId = null;
let lastNotifiedMinute = '';

/**
 * Requests permission for Web Push Notifications from the browser.
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[Notification API]: Browser does not support Web Notifications.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notification Permission State]:', permission);
    return permission;
  } catch (err) {
    console.error('[Notification Permission Request Error]:', err);
    return 'denied';
  }
}

/**
 * Returns current notification permission state
 */
export function getNotificationPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Displays a desktop Web Push notification
 */
export function sendPushNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    console.warn('[Notification API]: Cannot send notification. Permission is not granted.');
    return false;
  }

  try {
    const defaultOptions = {
      body: 'Time for your scheduled glycemic health action.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('[Send Push Notification Error]:', err);
    return false;
  }
}

/**
 * Starts the local background scheduler for medication & hydration alerts
 */
export function startNotificationScheduler(getMedicationsList, getIsEnabled) {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
  }

  schedulerIntervalId = setInterval(() => {
    if (typeof getIsEnabled === 'function' && !getIsEnabled()) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const timeString24 = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
    
    // 12-hour formatted time (e.g. "08:00 AM")
    const ampm = currentHours >= 12 ? 'PM' : 'AM';
    const hours12 = currentHours % 12 || 12;
    const timeString12 = `${String(hours12).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')} ${ampm}`;

    const minuteKey = `${now.toISOString().split('T')[0]}_${timeString24}`;

    if (lastNotifiedMinute === minuteKey) {
      return; // Already triggered notifications for this minute
    }

    lastNotifiedMinute = minuteKey;

    // Check Medication Reminders
    if (typeof getMedicationsList === 'function') {
      const meds = getMedicationsList() || [];
      meds.forEach(med => {
        const timeStr = med.time || med.scheduledTime || '';
        if (timeStr.includes(timeString12) || timeStr.includes(timeString24) || isMatchTime(timeStr, currentHours, currentMinutes)) {
          sendPushNotification(`💊 Time to take ${med.medicationName || med.name}`, {
            body: `Dose: ${med.dosage || '1 Tablet'}. Remaining Stock: ${med.totalPillsCount || 0} pills.`,
            tag: `med-${med.id}-${minuteKey}`
          });
        }
      });
    }

    // Hydration Reminder check (every 2 hours at :00 minutes between 8 AM and 8 PM)
    if (currentMinutes === 0 && currentHours >= 8 && currentHours <= 20 && currentHours % 2 === 0) {
      sendPushNotification('💧 Hydration Reminder - Drink Water', {
        body: 'Staying hydrated helps support renal clearance of excess blood glucose. Have a glass of water now.',
        tag: `hydration-${minuteKey}`
      });
    }

  }, 15000); // Check every 15 seconds

  console.log('[Notification Scheduler Started]');
}

export function stopNotificationScheduler() {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }
}

function isMatchTime(scheduledStr, currentH, currentM) {
  if (!scheduledStr) return false;
  const normalized = scheduledStr.toLowerCase().trim();
  const times = normalized.split(',').map(t => t.trim());

  for (const t of times) {
    if (t.includes('morning') && currentH === 8 && currentM === 0) return true;
    if (t.includes('afternoon') && currentH === 13 && currentM === 0) return true;
    if (t.includes('night') && currentH === 20 && currentM === 0) return true;
  }
  return false;
}
