const CLIENT_ID = browser.runtime.getManifest().oauth2.client_id;
const SCOPES = browser.runtime.getManifest().oauth2.scopes;
const CAL_API_BASE = "https://www.googleapis.com/calendar/v3";

let cachedToken = null;

// 1) get a Google OAuth token (popup) via identity.getAuthToken
async function getToken() {
  if (cachedToken) return cachedToken;
  // Chrome-style getAuthToken (uses your manifest.oauth2 block)
  const token = await browser.identity.getAuthToken({ interactive: true });
  cachedToken = token;
  return token;
}

// 2) build a single event payload
function makeEvent(ev) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(ev.date); // you must fill ev.date in your scrape
  d.setHours(Math.floor(ev.start / 60), ev.start % 60, 0);
  const startIso = d.toISOString();
  d.setHours(Math.floor(ev.end / 60), ev.end % 60, 0);
  const endIso = d.toISOString();

  return {
    summary: `${ev.className} [${ev.meetingType}]`,
    location: ev.location,
    start: { dateTime: startIso },
    end: { dateTime: endIso },
  };
}

// 3) insert one event
async function insertEvent(token, eventPayload) {
  const resp = await fetch(`${CAL_API_BASE}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// 4) handle the incoming message
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== "PUSH_EVENTS") return;
  (async () => {
    try {
      const token = await getToken();
      for (let ev of msg.events.filter((e) => e.type === "class")) {
        // ensure each ev has a .date property (e.g. "2025-07-15")
        const payload = makeEvent(ev);
        await insertEvent(token, payload);
      }
      // optionally notify the page that you’re done:
      browser.tabs.sendMessage(sender.tab.id, { action: "PUSH_COMPLETE" });
    } catch (err) {
      console.error("Calendar insert error:", err);
      browser.tabs.sendMessage(sender.tab.id, {
        action: "PUSH_FAILED",
        error: err.message,
      });
    }
  })();
});
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "PUSH_COMPLETE") {
    alert("Schedule exported successfully!");
  }
  if (msg.action === "PUSH_FAILED") {
    alert("Export failed: " + msg.error);
  }
});
