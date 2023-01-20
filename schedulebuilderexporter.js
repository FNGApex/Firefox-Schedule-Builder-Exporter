let courses = document.body.getElementsByClassName(
  "CourseItem gray-shadow-border clearfix"
);
for (let i = 0; i < courses.length; i++) {
  let meetingTimes = courses[i].getElementsByClassName("data meetings-times");
  for (let j = 0; j < meetingTimes.length; j++) {
    console.log(meetingTimes);
    if (meetingTimes[j].length == 1) {
      break;
    } else {
      console.log(["Type", meetingTimes.childNodes[0]]);
      console.log(["Date", meetingTimes.childNodes[1]]);
      console.log(["Time", meetingTimes.childNodes[2]]);
      console.log(["Location", meetingTimes.childNodes[3]]);
    }
  }
  console.log("##############");
}
