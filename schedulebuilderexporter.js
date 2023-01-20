let courses = document.body.getElementsByClassName(
  "CourseItem gray-shadow-border clearfix"
);
let meetingTimes;
for (let i = 0; i < courses.length; i++) {
  meetingTimes = courses[i].getElementsByClassName("data meeting-times")[0];
  for (let j = 0; j < meetingTimes.children.length; j++) {
    console.log("Type", meetingTimes.children[j].children[0].innerText);
    console.log("Date", meetingTimes.childNodes[j].children[1].innerText);
    console.log("Time", meetingTimes.childNodes[j].children[2].innerText);
    console.log("Location", meetingTimes.childNodes[j].children[3].innerText);
    console.log("##############");
  }
}
