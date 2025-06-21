// contentScript.js
function scrapeSchedule() {
  let classDetails = [];
  quarter = document.getElementById("TermSelectorText1").innerText[1];
  if (quarter == "a") {
    quarter = "Fall";
  } else if (quarter == "i") {
    quarter = "Winter";
  } else if (quarter == "p") {
    quarter = "Spring";
  } else if (quarter == "u") {
    quarter = "Summer";
  }
  //console.log("Found quarter:", quarter);
  savedScheduleElement = document.getElementById("SavedSchedules");
  classes = savedScheduleElement.getElementsByClassName(
    "CourseItem gray-shadow-border clearfix"
  );
  for (let i = 0; i < classes.length; i++) {
    const className = classes[i]
      .querySelector("div:not([class]):not([id])")
      .getElementsByTagName("div")[0]
      .getElementsByTagName("div")[0];

    //console.log("Found class:", className);
    title = className.getElementsByClassName("classTitle height-justified")[0]
      .innerText;
    //console.log("Class title:", title);
    const classNameDetails = className
      .getElementsByTagName("div")[3]
      .getElementsByClassName("data clearfix")[0];
    let isRegistered = true;
    if (
      classNameDetails
        .getElementsByClassName("status-section clearfix")[0]
        .getElementsByClassName("statusIndicator")[0].innerText ==
      "Not Registered"
    ) {
      isRegistered = false;
    }
    //console.log("Is registered:", isRegistered);
    if (isRegistered) {
      let classDetailsInternal = className.getElementsByTagName("div")[3];
      //console.log("Class details internal:", classDetailsInternal);

      meetingTypes = classDetailsInternal
        .querySelector("div.data.meeting-times")
        .getElementsByClassName("meeting clearfix");
      for (let j = 0; j < meetingTypes.length; j++) {
        //console.log("Meeting type:", meetingTypes[j]);

        const meeting = meetingTypes[j].getElementsByTagName("div");
        const meetingType = meeting[0].innerText.trim();
        const classDays = meeting[2].innerText.trim();
        const classLocation = meeting[3].innerText.trim();
        let classTime = meeting[1].innerText;
        function parseTimeToMinutes(str) {
          let [time, mod] = str.trim().split(" "); // ["3:10", "PM"]
          let [h, m] = time.split(":").map(Number); // [3, 10]
          if (mod === "PM" && h < 12) h += 12;
          if (mod === "AM" && h === 12) h = 0;
          return h * 60 + m; // e.g. 3:10PM → 910
        }

        const [startStr, endStr] = classTime.split(" - ");
        const startMinutes = parseTimeToMinutes(startStr); // 910
        const endMinutes = parseTimeToMinutes(endStr); // 1030
        classDetails.push({
          type: "class",
          meetingType: meetingType,
          className: title,
          location: classLocation,
          start: startMinutes,
          end: endMinutes,
          days: classDays,
        });
      }
    }
  }

  //console.log("Scraped class details:", classDetails);

  classDetails.push({ type: "quarter", quarter: quarter });
  return classDetails;
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
