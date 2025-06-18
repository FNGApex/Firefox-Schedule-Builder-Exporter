// contentScript.js
function scrapeSchedule() {
  console.log("Scraping schedule data...");
}
function addExportButton() {
  // Grab the menu container
  const menuElement = document.querySelector(".menu.menu1.active");
  if (!menuElement) {
    console.warn("Schedule→Calendar: menu container not found");
    return;
  }

  // Don’t add twice
  if (document.getElementById("menu1_export_btn")) return;

  // Create a wrapper <div> to match the other menu items
  const exportWrapper = document.createElement("div");
  exportWrapper.id = "menu1_export_btn";
  exportWrapper.className = "inline"; // same styling hook as the others

  // Create the actual button
  const btn = document.createElement("button");
  btn.className = "btn btn-mini white-on-navyblue";
  btn.title = "Export schedule to Calendar";
  btn.textContent = "Export";

  // Hook up your click-handler here
  btn.addEventListener("click", async () => {
    const events = scrapeSchedule();
    if (!events || events.length === 0) {
      alert("No schedule data found to export.");
      return;
    }
    browser.runtime.sendMessage({ action: "PUSH_EVENTS", events });
  });

  exportWrapper.appendChild(btn);
  menuElement.appendChild(exportWrapper);
}

// 2. Wait for *everything* to be loaded…
if (document.readyState === "complete") {
  addExportButton();
} else {
  window.addEventListener("load", addExportButton);
}
