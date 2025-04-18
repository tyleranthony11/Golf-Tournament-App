import {
  courseData,
  courseNames,
  scorecardData,
  courseLocations,
  supportedCountries
} from "./courses.js";
import { formatDate } from "./utils.js";
import {
  saveTournamentToHistory,
  updateHistoryTab,
  saveGolfers,
  loadGolfers,
  saveRounds,
  loadRounds,
  saveHandicaps,
  loadHandicaps,
} from "./storage.js";
import { setupCourseSearch, fetchAndTransformCourse, fetchAndTransformCourseTournament } from "./api.js";

const golferSelect = document.getElementById("golfer-name-dropdown");
const roundsList = document.getElementById("rounds-list");
const scoreForm = document.getElementById("score-form");
const newGolferInput = document.getElementById("new-golfer-input");
const submitNewGolferBtn = document.getElementById("submit-new-golfer");
const newGolferNameInput = document.getElementById("new-golfer-name");
const golferList = document.getElementById("golfer-list");
const registeredGolfersDiv = document.getElementById("golfer-list-container");
const courseDropdown = document.getElementById("course");
const teesDropdown = document.getElementById("tees");
const postScoreBtn = document.getElementById("post-score-btn");
const postScoreForm = document.getElementById("post-score-form");
const createTournamentBtn = document.getElementById("create-tournament-btn");
const startTournamentBtn = document.getElementById("start-tournament-btn");
const tournamentForm = document.getElementById("tournament-form");
const tournamentCourseDropdown = document.getElementById("tournament-course");
const tournamentTeesDropdown = document.getElementById("tournament-tees");
const leaderboardContainer = document.getElementById("leaderboard-container");
const scorecardContainer = document.getElementById("scorecard-container");
const handicapRankingsContainer = document.getElementById(
  "handicap-rankings-container"
);
const slides = document.querySelectorAll(".carousel-slide");
const emptyHandicapRankings = document.getElementById(
  "empty-handicap-rankings"
);
const emptyLeaderboard = document.getElementById("empty-leaderboard");

let tournamentScores = {};
let rounds = [];
let golfers = [];
let golferHandicaps = [];

document
  .getElementById("homeTab")
  .addEventListener("click", (event) => switchTab("home", event));
document
  .getElementById("postRoundTab")
  .addEventListener("click", (event) => switchTab("post-round", event));
document
  .getElementById("handicapRankingsTab")
  .addEventListener("click", (event) => switchTab("handicap-rankings", event));
document
  .getElementById("tournamentScorecardTab")
  .addEventListener("click", (event) =>
    switchTab("tournament-scorecard", event)
  );
document
  .getElementById("tournamentLeaderboardTab")
  .addEventListener("click", (event) =>
    switchTab("tournament-leaderboard", event)
  );
document
  .getElementById("historyTab")
  .addEventListener("click", (event) => switchTab("history", event));

document
  .getElementById("start-tournament-link")
  .addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("tournamentScorecardTab").click();
  });
document
  .getElementById("post-score-link")
  .addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("postRoundTab").click();
  });

function switchTab(tabName, event) {
  event.preventDefault();

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.classList.remove("tab-active");
  });

  const links = document.querySelectorAll(".topnav a");
  links.forEach((link) => {
    link.classList.remove("active");
  });

  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add("tab-active");
  }

  const selectedLink = event.target;
  selectedLink.classList.add("active");
}

document.getElementById("hamburgerMenu").addEventListener("click", function () {
  document.getElementById("navLinks").classList.toggle("show");
});

document.addEventListener("click", function (event) {
  if (
    !navLinks.contains(event.target) &&
    !document.getElementById("hamburgerMenu").contains(event.target)
  ) {
    navLinks.classList.remove("show");
  }
});
const navLinks = document.getElementById("navLinks");
const links = navLinks.getElementsByTagName("a");

for (let link of links) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("show");
  });
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add("show");
      slide.style.opacity = 1;
    } else {
      slide.classList.remove("show");
      slide.style.opacity = 0;
    }
  });
}
let currentIndex = 0;
function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}
showSlide(currentIndex);
setInterval(nextSlide, 8000);

document
  .getElementById("country-selection")
  .addEventListener("change", function () {
    const country = this.value;
    const courseContainer = document.getElementById("course-container");
    const courseDropdown = document.getElementById("course");

    courseDropdown.innerHTML = "";

    if (country === supportedCountries.canada) {
      courseDropdown.innerHTML = "<option value=''>Select a Course</option>";
      populateCourseDropdown(courseDropdown);
      courseDropdown.style.display = "block";
      courseContainer.innerHTML = "";
    } else if (country === supportedCountries.usa) {
      courseContainer.innerHTML = `
      <input type="text" id="course-search" placeholder="Search for a US course..." autocomplete="off">
      <div id="course-results" class="dropdown-results"></div>
      `;

      setupCourseSearch();
      courseDropdown.style.display = "none";
    }
  });

document
  .getElementById("tournament-country-selection")
  .addEventListener("change", function () {
    const country = this.value;
    const tournamentCourseContainer = document.getElementById(
      "tournament-course-container"
    );
    const tournamentCourseDropdown =
      document.getElementById("tournament-course");

    tournamentCourseDropdown.innerHTML = "";

    if (country === supportedCountries.canada) {
      tournamentCourseDropdown.innerHTML =
        "<option value=''>Select a Course</option>";
      populateCourseDropdown(tournamentCourseDropdown);
      tournamentCourseDropdown.style.display = "block";
      tournamentCourseContainer.innerHTML = "";
    } else if (country === supportedCountries.usa) {
      tournamentCourseContainer.innerHTML = `
    <input type="text" id="course-search" placeholder="Search for a US course..." autocomplete="off">
    <div id="course-results" class="dropdown-results"></div>
  `;
      setupCourseSearch();
      tournamentCourseDropdown.style.display = "none";
    }
  });

// Populates Course dropdown in Post-Score form with Canadian courses
function populateCourseDropdown(dropdown) {
  dropdown.innerHTML = '<option value="">Select a Course</option>';
  Object.keys(courseData).forEach((courseKey) => {
    const option = document.createElement("option");
    option.value = courseKey;
    option.textContent = courseNames[courseKey]; // Display-friendly name 
    dropdown.appendChild(option);
  });
}

//  Popualates tees for Canadian coruses
function populateTeesDropdown(courseDropdown, teesDropdown) {
  teesDropdown.innerHTML = "<option value=''>Select Tees Played </option>";
  const selectedCourse = courseDropdown.value;

  const courseInfo = courseData[selectedCourse];
  for (const teeName in courseInfo.tees) {
    const teeData = courseInfo.tees[teeName];
    const newOption = document.createElement("option");
    newOption.value = teeName;
    newOption.textContent = `${teeName} (${teeData.yardage} yds) - Par ${teeData.par}, Rating ${teeData.courseRating}, Slope ${teeData.slopeRating}`;
    teesDropdown.appendChild(newOption);
  }
}


export function populateTeesDropdownUSA(course) {
  const teesDropdown = document.getElementById("tees");
  teesDropdown.innerHTML = "<option value=''>Select Tees Played</option>";

  if (course.tees) {
    for (const gender in course.tees) {
      course.tees[gender].forEach((tee) => {
        const newOption = document.createElement("option");
        newOption.value = tee.tee_name;
        newOption.textContent = `${tee.tee_name} (${tee.total_yards} yds) - Par ${tee.par_total}, Rating ${tee.course_rating}, Slope ${tee.slope_rating}`;
        teesDropdown.appendChild(newOption);
      });
    }
  }
}

export function populateTournamentTeesDropdownUSA(course) {
  const tournamentTeesDropdown = document.getElementById("tournament-tees");
  tournamentTeesDropdown.innerHTML =
    "<option value=''>Select Tees Played</option>";

  if (course.tees) {
    for (const gender in course.tees) {
      course.tees[gender].forEach((tee) => {
        const newOption = document.createElement("option");
        newOption.value = tee.tee_name;
        newOption.textContent = `${tee.tee_name} (${tee.total_yards} yds) - Par ${tee.par_total}, Rating ${tee.course_rating}, Slope ${tee.slope_rating}`;
        tournamentTeesDropdown.appendChild(newOption);
      });
    }
  }
}


courseDropdown.addEventListener("change", () => {
  populateTeesDropdown(courseDropdown, teesDropdown);
});

tournamentCourseDropdown.addEventListener("change", () => {
  populateTeesDropdown(tournamentCourseDropdown, tournamentTeesDropdown);
});


// updates dropdowns when new golfers are added
function updateGolferDropdowns() {
  const golferContainer = document.getElementById(
    "tournament-golfers-container"
  );
  golferContainer.innerHTML = "";
  golferSelect.innerHTML = `<option value="" aria-required="">Select Golfer</option>`;

  golfers.forEach((golfer) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = golfer;
    checkbox.classList.add("golfer-checkbox");

    const label = document.createElement("label");
    label.style.display = "flex";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${golfer}`));

    golferContainer.appendChild(label);

    const option = document.createElement("option");
    option.value = golfer;
    option.textContent = golfer;
    golferSelect.appendChild(option);
  });
}

function addGolfer(golferName) {
  if (!golfers.includes(golferName)) {
    golfers.push(golferName);
    updateGolferHandicap(golferName);
    updateGolferDropdowns();
    updateGolferList();
    checkGolfers();
    saveGolfers(golfers);
  } else {
    alert("This golfer already exists. Please enter a new golfer.");
  }
}
function updateGolferList() {
  golferList.innerHTML = "";

  golfers.forEach((golfer, index) => {
    const golferItem = document.createElement("li");
    golferItem.textContent = golfer;

    const deleteGolferBtn = document.createElement("img");
    deleteGolferBtn.src = "images/delete.png";
    deleteGolferBtn.alt = "Delete";
    deleteGolferBtn.classList.add("delete-golfer-btn");

    deleteGolferBtn.addEventListener("click", () => {
      deleteGolfer(index);
    });

    golferItem.appendChild(deleteGolferBtn);

    golferList.appendChild(golferItem);
  });
}

function deleteGolfer(index) {
  golfers.splice(index, 1);

  updateGolferList();
  updateGolferDropdowns();
  checkGolfers();

  saveGolfers();
}

// Prevents adding duplicate golfer names
function checkGolfers() {
  if (golferList.children.length > 0) {
    registeredGolfersDiv.style.display = "block";
  } else {
    registeredGolfersDiv.style.display = "none";
  }
}

newGolferNameInput.addEventListener("input", () => {
  if (newGolferNameInput.value.trim() === "") {
    submitNewGolferBtn.disabled = true;
  } else {
    submitNewGolferBtn.disabled = false;
  }
});

submitNewGolferBtn.addEventListener("click", () => {
  const golferName = newGolferNameInput.value;
  if (golferName) {
    addGolfer(golferName);
    newGolferInput.value = "";
  }
  newGolferNameInput.value = "";
  newGolferNameInput.dispatchEvent(new Event("input"));
});

postScoreBtn.addEventListener("click", () => {
  if (postScoreForm.style.display === "none") {
    postScoreForm.style.display = "block";
    postScoreBtn.textContent = "Cancel";
  } else {
    postScoreForm.style.display = "none";
    postScoreBtn.textContent = "Post Score";
  }
});

async function calculateHandicap(golferName) {
  const golferRounds = rounds.filter(
    (round) => round.golferName === golferName
  );
  golferRounds.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
  const recentRounds = golferRounds.slice(0, 20);

  const differentials = [];

  for (const round of recentRounds) {
    const { score, courseValue, tees } = round;
    let courseInfo;

    if (courseData[courseValue]) {
      courseInfo = courseData[courseValue];
    } else {
      const transformedCourse = await fetchAndTransformCourse(courseValue);
      if (!transformedCourse) continue;
      courseInfo = transformedCourse[courseValue];
    }

    const teeInfo = courseInfo.tees[tees];
    if (!teeInfo) continue;

    const { courseRating, slopeRating } = teeInfo;

    const differential = (113 / slopeRating) * (score - courseRating);
    differentials.push(differential);
  }

  differentials.sort((a, b) => a - b);
  const lowestDifferentials = differentials.slice(0, 8);

  let total = 0;
  for (let i = 0; i < lowestDifferentials.length; i++) {
    total += lowestDifferentials[i];
  }

  const averageDifferential = total / lowestDifferentials.length;

  return averageDifferential.toFixed(1);
}

// updates the handicap ranking table when new scores are posted
function updateRankingsTable() {
  const rankingsTable = document.getElementById("rankings-table-body");

  const validGolferHandicaps = golferHandicaps.filter(
    (golfer) => !isNaN(golfer.handicap)
  );

  if (validGolferHandicaps.length > 0) {
    emptyHandicapRankings.style.display = "none";
    rankingsTable.innerHTML = "";

    validGolferHandicaps.sort((a, b) => a.handicap - b.handicap);

    validGolferHandicaps.forEach((golfer, index) => {
      let existingRow = rankingsTable.querySelector(
        `[data-golfer="${golfer.name}"]`
      );

      if (existingRow) {
        existingRow.cells[2].textContent = golfer.handicap;
      } else {
        const row = document.createElement("tr");
        row.setAttribute("data-golfer", golfer.name);
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${golfer.name}</td>
          <td>${golfer.handicap}</td>
        `;
        rankingsTable.appendChild(row);
      }
    });

    handicapRankingsContainer.style.display = "block";
    handicapRankingsContainer.classList.add("visible");
  } else {
    emptyHandicapRankings.style.display = "block";
  }
}

async function updateGolferHandicap(golferName) {
  const handicap = await calculateHandicap(golferName);

  if (isNaN(handicap) || !isFinite(handicap)) {
    return;
  }

  const golferIndex = golferHandicaps.findIndex(
    (golfer) => golfer.name === golferName
  );

  if (golferIndex !== -1) {
    golferHandicaps[golferIndex].handicap = handicap;
  } else {
    golferHandicaps.push({ name: golferName, handicap });
  }
  saveHandicaps(golferHandicaps);
  updateRankingsTable();
}

// takes inputs from post score form and creates list of recently played rounds 
scoreForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const country = document.getElementById("country-selection").value;
  const golferName = document.getElementById("golfer-name-dropdown").value;
  const datePlayed = document.getElementById("date-played").value;
  const formattedDatePlayed = formatDate(datePlayed);
  const score = Number(document.getElementById("score").value);
  let roundItem, round;

  if (country === supportedCountries.canada) {
    const courseValue = document.getElementById("course").value;
    const course = courseNames[courseValue];
    const tees =
      document.getElementById("tees").value.charAt(0).toUpperCase() +
      document.getElementById("tees").value.slice(1);

    const courseKey = document.getElementById("course").value;
    const selectedCourseData = courseData[courseKey];
    const selectedTeeData = selectedCourseData.tees[tees];
    const strokesAbovePar = score - selectedTeeData.par;

    roundItem = document.createElement("li");
    roundItem.innerHTML = `
                <strong>Golfer:</strong> ${golferName}<br>
                <strong>Date Played:</strong> ${formattedDatePlayed}<br>
                <strong>Course:</strong> ${course}<br>
                <strong>Tees:</strong> ${tees}<br>
                <strong>Score:</strong> ${score} (${
      strokesAbovePar > 0
        ? "+" + strokesAbovePar
        : strokesAbovePar < 0
        ? strokesAbovePar
        : "E"
    })`;

    round = { golferName, datePlayed, courseValue, tees, score };
  } else if (country === supportedCountries.usa) {
    const courseInput = document.getElementById("course-search").value;
    const courseName = courseInput.split(" - ")[0].trim();

    const transformedCourse = await fetchAndTransformCourse(courseName);
    const tees = document.getElementById("tees").value;
    const selectedTeeData = transformedCourse[courseName].tees[tees];
    const strokesAbovePar = score - selectedTeeData.par;

    roundItem = document.createElement("li");
    roundItem.innerHTML = `
              <strong>Golfer:</strong> ${golferName}<br>
              <strong>Date Played:</strong> ${formattedDatePlayed}<br>
              <strong>Course:</strong> ${courseName}<br>
              <strong>Tees:</strong> ${tees}<br>
              <strong>Score:</strong> ${score} (${
      strokesAbovePar > 0
        ? "+" + strokesAbovePar
        : strokesAbovePar < 0
        ? strokesAbovePar
        : "E"
    })`;

    round = { golferName, datePlayed, courseValue: courseName, tees, score };
  }

  const deleteBtn = document.createElement("img");
  deleteBtn.src = "images/delete.png";
  deleteBtn.alt = "Delete";
  deleteBtn.classList.add("delete-btn");

  const index = rounds.length;
  deleteBtn.addEventListener("click", () => deleteRound(index, golferName));

  roundItem.appendChild(deleteBtn);
  roundsList.appendChild(roundItem);

  const roundsDisplay = document.getElementById("rounds-display");
  if (roundsDisplay.style.display === "none") {
    roundsDisplay.style.display = "block";
  }

  rounds.push(round);
  updateGolferHandicap(golferName);
  updateRankingsTable();
  saveRounds(rounds);
  saveHandicaps(golferHandicaps);
  scoreForm.reset();
});

createTournamentBtn.addEventListener("click", () => {
  if (!areAllRoundsSubmitted()) {
    const confirmDelete = confirm(
      "Warning: You have a tournament in progess. If you create a new tournament, all current progess will be lost. Do you want to continue?"
    );

    if (!confirmDelete) {
      return;
    }
  }
  tournamentForm.style.display = "flex";
  const weatherContainer = document.querySelector(".weather-column");
  weatherContainer.style.display = "";
});

async function generateScorecard(
  courseName,
  teeColor,
  golfers,
  roundNumber,
  country
) {
  let course, tee;

  if (country === supportedCountries.canada) {
    course = scorecardData[courseName];
    tee = course[teeColor];
  } else if (country === supportedCountries.usa) {
    course = await fetchAndTransformCourseTournament(courseName);
    tee = course[teeColor];
    console.log("Fetching and transforming USA course data");
  }

  const scorecardContainer = document.createElement("div");
  scorecardContainer.classList.add("scorecard-container");

  const scrollableTableContainer = document.createElement("div");
  scrollableTableContainer.classList.add("scrollable-table-container");

  const table = document.createElement("table");
  table.classList.add("scorecard-table");

  const headerRow = document.createElement("tr");
  const holes = [
    "HOLE",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "OUT",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "IN",
    `R${roundNumber}`,
    "TOTAL",
  ];
  holes.forEach((hole) => {
    const th = document.createElement("th");
    th.textContent = hole;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const yardageRow = document.createElement("tr");
  yardageRow.classList.add("yardage-row");
  yardageRow.innerHTML = `<td>YDS</td>`;

  // adds yardage data for 18 holes, in, out and total
  for (let i = 0; i < tee.length; i++) {
    const td = document.createElement("td");
    td.textContent = tee[i].yardage;
    yardageRow.appendChild(td);
  }

  table.appendChild(yardageRow);

  const parRow = document.createElement("tr");
  parRow.classList.add("par-row");
  parRow.innerHTML = `<td>PAR</td>`;

  // adds yardage data for 18 holes, in, out and total
  for (let i = 0; i < tee.length; i++) {
    const td = document.createElement("td");
    td.textContent = tee[i].par;
    parRow.appendChild(td);
  }

  table.appendChild(parRow);

  golfers.forEach((golfer) => {
    const golferRow = document.createElement("tr");
    golferRow.classList.add("golfer-row");
    golferRow.innerHTML = `<td>${golfer}</td>`;

    // adds input element for 18 holes
    for (let i = 1; i <= 18; i++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.classList.add("hole-score");
      input.dataset.hole = i;
      input.dataset.golfer = golfer;
      input.dataset.round = roundNumber;
      input.disabled = roundNumber > 1;
      input.addEventListener("input", (event) => {
        updateTotals(event, tee);
        const allInputs = document.querySelectorAll(
          `input[data-golfer="${golfer}"][data-round="${roundNumber}"]`
        );
        const index = Array.from(allInputs).indexOf(event.target);
        const value = event.target.value;
        if (value.length === 1 && value === "1") {
          return;
        }
        if (
          parseInt(value, 10) >= 2 &&
          index !== -1 &&
          index < allInputs.length - 1
        ) {
          allInputs[index + 1].focus();
        }
      });

      td.appendChild(input);
      golferRow.appendChild(td);
      if (i === 9 || i === 18) {
        const totalTd = document.createElement("td");
        totalTd.classList.add(i === 9 ? "out-total" : "in-total");
        totalTd.dataset.golfer = golfer;
        totalTd.dataset.round = roundNumber;
        totalTd.textContent = "0";
        golferRow.appendChild(totalTd);
      }
    }

    const roundTotal = document.createElement("td");
    roundTotal.classList.add("round-total");
    roundTotal.dataset.golfer = golfer;
    roundTotal.dataset.round = roundNumber;
    roundTotal.textContent = "0";
    golferRow.appendChild(roundTotal);

    const tournamentTotal = document.createElement("td");
    tournamentTotal.classList.add("tournament-total");
    tournamentTotal.dataset.golfer = golfer;
    tournamentTotal.textContent = "0";
    golferRow.appendChild(tournamentTotal);

    table.appendChild(golferRow);
  });

  const submitButton = document.createElement("button");
  submitButton.textContent = `Submit Round ${roundNumber}`;
  submitButton.classList.add("submit-round-btn");
  submitButton.dataset.round = roundNumber;

  submitButton.addEventListener("click", function () {
    let allScoresFilled = true;
    let allScoresValid = true;

    Object.keys(tournamentScores).forEach((golfer) => {
      document
        .querySelectorAll(
          `input[data-round="${roundNumber}"][data-golfer="${golfer}"]`
        )
        .forEach((input) => {
          if (!input.value || input.value === "") {
            allScoresFilled = false;
          }

          const score = input.value.trim();
          if (!/^\d+$/.test(score)) {
            allScoresValid = false;
          }
        });
    });

    if (!allScoresFilled) {
      alert("Please enter score for all holes before submitting the round.");
      return;
    }

    if (!allScoresValid) {
      alert(
        "Please enter valid scores. Negative or decimal numbers are not allowed."
      );
      return;
    }

    localStorage.setItem(
      `tournamentScores_round${roundNumber}`,
      JSON.stringify(tournamentScores)
    );

    let tournamentStrokesAbovePar = 0;

    Object.keys(tournamentScores).forEach((golfer) => {
      document
        .querySelectorAll(
          `input[data-round="${roundNumber}"][data-golfer="${golfer}"]`
        )
        .forEach((input) => {
          const hole = input.dataset.hole;
          const score = parseInt(input.value, 10) || "-";
          const golfer = input.dataset.golfer;

          if (!tournamentScores[golfer]) tournamentScores[golfer] = {};
          if (!tournamentScores[golfer][roundNumber])
            tournamentScores[golfer][roundNumber] = [];
          tournamentScores[golfer][roundNumber][hole - 1] = score;

          let holeIndex = parseInt(hole, 10) - 1;
          if (hole >= 10) {
            holeIndex = parseInt(hole, 10);
          }
          const par = parseInt(tee[holeIndex].par, 10);

          const span = document.createElement("span");
          span.textContent = score;
          span.classList.add("final-score");

          if (score !== "-") {
            const scoreDifference = score - par;

            if (scoreDifference <= -3) {
              span.classList.add("albatross");
            } else if (scoreDifference === -2) {
              span.classList.add("eagle");
            } else if (scoreDifference === -1) {
              span.classList.add("birdie");
            } else if (scoreDifference === 0) {
              span.classList.add("par");
            } else if (scoreDifference === 1) {
              span.classList.add("bogey");
            } else if (scoreDifference === 2) {
              span.classList.add("double-bogey");
            } else {
              span.classList.add("triple-bogey");
            }
          }

          input.parentNode.replaceChild(span, input);
        });

      const outTotalElement = document.querySelector(
        `.out-total[data-round="${roundNumber}"][data-golfer="${golfer}"]`
      );
      const inTotalElement = document.querySelector(
        `.in-total[data-round="${roundNumber}"][data-golfer="${golfer}"]`
      );
      const roundTotalElement = document.querySelector(
        `.round-total[data-round="${roundNumber}"][data-golfer="${golfer}"]`
      );

      if (outTotalElement) {
        outTotalElement.textContent += ` (${outTotalElement.dataset.strokesAbovePar})`;
      }
      if (inTotalElement) {
        inTotalElement.textContent += ` (${inTotalElement.dataset.strokesAbovePar})`;
      }
      if (roundTotalElement) {
        roundTotalElement.textContent += ` (${roundTotalElement.dataset.strokesAbovePar})`;
      }

      Object.keys(tournamentScores).forEach((golfer) => {
        document
          .querySelectorAll(
            `.tournament-total[data-golfer="${golfer}"] .hidden-strokes`
          )
          .forEach((span) => {
            span.classList.remove("hidden-strokes");
          });
      });

      document
        .querySelectorAll(
          `.round-total[data-round="${roundNumber}"][data-golfer="${golfer}"]`
        )
        .forEach((roundElement) => {
          tournamentStrokesAbovePar +=
            parseInt(roundElement.dataset.strokesAbovePar) || 0;
        });

      submitButton.disabled = true;
      submitButton.textContent = "Round Submitted";
      submitButton.classList.add("submitted");
      const nextRoundInputs = document.querySelectorAll(
        `input[data-round="${roundNumber + 1}"]`
      );
      nextRoundInputs.forEach((input) => (input.disabled = false));

      updateLeaderboard();

      emptyLeaderboard.style.display = "none";
      leaderboardContainer.style.display = "block";
    });

    if (areAllRoundsSubmitted()) {
      saveTournamentToHistory();
    }
  });
  scrollableTableContainer.appendChild(table);
  scorecardContainer.appendChild(scrollableTableContainer);
  scorecardContainer.appendChild(submitButton);

  return scorecardContainer;
}

// Calculates the total score and strokes above par in scorecard
function updateTotals(event, tee) {
  const input = event.target;
  const hole = parseInt(input.dataset.hole) - 1;
  const golfer = input.dataset.golfer;
  const round = input.dataset.round;
  const score = parseInt(input.value) || 0;

  tournamentScores[golfer][round][hole] = score;

  const outPar = tee[9].par;
  const inPar = tee[19].par;
  const totalPar = tee[20].par;

  const outTotal = Object.values(tournamentScores[golfer][round])
    .slice(0, 9)
    .reduce((sum, val) => sum + (val || 0), 0);

  const inTotal = tournamentScores[golfer][round]
    .slice(9, 18)
    .reduce((sum, val) => sum + val, 0);

  const roundTotal = outTotal + inTotal;

  const outStrokesAbovePar = outTotal - outPar;
  const inStrokesAbovePar = inTotal - inPar;
  const roundStrokesAbovePar = roundTotal - totalPar;

  const outTotalElement = document.querySelector(
    `.out-total[data-golfer="${golfer}"][data-round="${round}"]`
  );
  if (outTotalElement) {
    outTotalElement.textContent = `${outTotal}`;
  }

  const inTotalElement = document.querySelector(
    `.in-total[data-golfer="${golfer}"][data-round="${round}"]`
  );
  if (inTotalElement) {
    inTotalElement.textContent = `${inTotal}`;
  }

  const roundTotalElement = document.querySelector(
    `.round-total[data-golfer="${golfer}"][data-round="${round}"]`
  );
  if (roundTotalElement) {
    roundTotalElement.textContent = `${roundTotal}`;
  }

  outTotalElement.dataset.strokesAbovePar =
    outStrokesAbovePar === 0
      ? "E"
      : outStrokesAbovePar >= 0
      ? `+${outStrokesAbovePar}`
      : outStrokesAbovePar;
  inTotalElement.dataset.strokesAbovePar =
    inStrokesAbovePar === 0
      ? "E"
      : inStrokesAbovePar >= 0
      ? `+${inStrokesAbovePar}`
      : inStrokesAbovePar;
  roundTotalElement.dataset.strokesAbovePar =
    roundStrokesAbovePar === 0
      ? "E"
      : roundStrokesAbovePar >= 0
      ? `+${roundStrokesAbovePar}`
      : roundStrokesAbovePar;

  let tournamentTotal = 0;
  let tournamentStrokesAbovePar = 0;

  for (let roundKey in tournamentScores[golfer]) {
    const roundScores = tournamentScores[golfer][roundKey];

    // Prevents round submission with incomplete scorecard
    if (isRoundComplete(roundScores)) {
      const roundTotal = roundScores.reduce((sum, val) => sum + val, 0);
      tournamentTotal += roundTotal;

      const roundStrokesAbovePar =
        document.querySelector(
          `.round-total[data-golfer="${golfer}"][data-round="${roundKey}"]`
        )?.dataset.strokesAbovePar || 0;

      tournamentStrokesAbovePar += parseFloat(roundStrokesAbovePar) || 0;
    }
  }

  document
    .querySelectorAll(`.tournament-total[data-golfer="${golfer}"]`)
    .forEach((element) => {
      if (element) {
        element.textContent = `${tournamentTotal}`;
        const strokesSpan = document.createElement("span");
        strokesSpan.classList.add("hidden-strokes");
        strokesSpan.textContent =
          tournamentStrokesAbovePar === 0
            ? " (E)"
            : tournamentStrokesAbovePar > 0
            ? ` (+${tournamentStrokesAbovePar})`
            : ` (${tournamentStrokesAbovePar})`;
        element.appendChild(strokesSpan);
      }
    });
}
function isRoundComplete(roundScores) {
  return (
    roundScores.length === 18 &&
    roundScores.every(
      (score) => !isNaN(score) && roundScores.every((score) => score !== null)
    )
  );
}

async function createTournament() {
  scorecardContainer.innerHTML = "";
  const tournamentName = document.getElementById("tournament-name").value;
  const golfers = Array.from(
    document.querySelectorAll(
      "#tournament-golfers-container .golfer-checkbox:checked"
    )
  ).map((checkbox) => checkbox.value);
  const tees = document.getElementById("tournament-tees").value;
  const rounds = parseInt(document.getElementById("tournament-rounds").value);
  const country = document.getElementById("tournament-country-selection").value;
  let course;

  if (country === supportedCountries.canada) {
    course = document.getElementById("tournament-course").value;
  } else if (country === supportedCountries.usa) {
    course = document.getElementById("course-search").value.split(" - ")[0];
  }

  golfers.forEach((golfer) => {
    if (!tournamentScores[golfer]) tournamentScores[golfer] = {};
    for (let i = 1; i <= rounds; i++) {
      tournamentScores[golfer][i] = new Array(18).fill(0);
    }
  });

  const tournamentTitle = document.createElement("h2");
  tournamentTitle.textContent = tournamentName;
  scorecardContainer.appendChild(tournamentTitle);

  for (let i = 1; i <= rounds; i++) {
    const roundHeading = document.createElement("h3");
    roundHeading.textContent = `Round ${i}:`;
    roundHeading.classList.add("round-heading");
    const scorecard = await generateScorecard(
      course,
      tees,
      golfers,
      i,
      country
    );
    scorecardContainer.appendChild(roundHeading);
    scorecardContainer.appendChild(scorecard);
  }
  scorecardContainer.style.display = "block";
  tournamentForm.classList.toggle("hidden");
}

startTournamentBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  const selectedGolfers = document.querySelectorAll("#tournament-golfers-container .golfer-checkbox:checked");
  if (selectedGolfers.length === 0){
    alert("Please select at least one golfer.");
    return;
  }

  if (tournamentForm.checkValidity()) {
    const weatherColumn = document.querySelector(".weather-column");

    if (weatherColumn.style.display !== "none") {
      weatherColumn.style.display = "none";
    } else {
      weatherColumn.style.display = "flex";
    }

    resetScorecard();
    createTournament();
    tournamentForm.style.display = "none";
    createTournamentBtn.style.display = "block";
  } else {
    tournamentForm.reportValidity();
  }
});

function updateLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-container");
  leaderboardContainer.innerHTML = "";
  const tournamentName = document.getElementById("tournament-name").value;

  const leaderboardTitle = document.createElement("h2");
  leaderboardTitle.textContent = tournamentName;
  leaderboardContainer.appendChild(leaderboardTitle);

  let leaderboard = [];
  let totalRounds = 0;

  for (let golfer in tournamentScores) {
    let totalScore = 0;
    let roundScores = [];
    let strokesAbovePar = [];

    for (let round in tournamentScores[golfer]) {
      let roundTotal = tournamentScores[golfer][round].reduce(
        (sum, score) => sum + score,
        0
      );
      let roundStrokesAbovePar =
        document.querySelector(
          `.round-total[data-golfer="${golfer}"][data-round="${round}"]`
        ).dataset.strokesAbovePar || 0;

      roundScores.push(roundTotal || 0);
      strokesAbovePar.push(roundStrokesAbovePar);
      totalScore += roundTotal || 0;
    }

    totalRounds = roundScores.length;
    leaderboard.push({ golfer, roundScores, strokesAbovePar, totalScore });
  }

  leaderboard.sort((a, b) => a.totalScore - b.totalScore);

  const table = document.createElement("table");
  table.classList.add("leaderboard-table");

  let headerRow = table.insertRow();
  headerRow.innerHTML = "<th>Rank</th><th>Golfer</th>";

  for (let i = 1; i <= totalRounds; i++) {
    headerRow.innerHTML += `<th>R${i}</th>`;
  }

  headerRow.innerHTML += "<th>Total</th>";

  leaderboard.forEach((entry, index) => {
    let row = table.insertRow();
    row.innerHTML = `<td>${index + 1}</td><td>${entry.golfer}</td>`;

    entry.roundScores.forEach((score, i) => {
      let strokesAbovePar = entry.strokesAbovePar[i];
      row.innerHTML += `<td>${score} (${
        strokesAbovePar >= 0 ? `${strokesAbovePar}` : strokesAbovePar
      })</td>`;
    });
    let totalStrokesAbovePar = entry.strokesAbovePar.reduce((a, b) => {
      return (parseFloat(a) || 0) + (parseFloat(b) || 0);
    }, 0);
    row.innerHTML += `<td>${entry.totalScore} (${
      totalStrokesAbovePar === 0
        ? "E"
        : totalStrokesAbovePar > 0
        ? `+${totalStrokesAbovePar}`
        : totalStrokesAbovePar
    })</td>`;
  });

  leaderboardContainer.appendChild(table);
}

function resetScorecard() {
  if (scorecardContainer) {
    scorecardContainer.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", updateHistoryTab);

function areAllRoundsSubmitted() {
  const submitButtons = document.querySelectorAll(".submit-round-btn");
  return (
    submitButtons.length > 0 &&
    Array.from(submitButtons).every((button) => button.disabled)
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadGolfers(addGolfer);
  loadRounds(rounds, displayRound);
});

function displayRound(round, index) {
  const roundsDisplay = document.getElementById("rounds-display");
  const roundsList = document.getElementById("rounds-list");

  let course, selectedCourseData, selectedTeeData;

  if (courseNames[round.courseValue]) {
    course = courseNames[round.courseValue];
    selectedCourseData = courseData[round.courseValue];
    selectedTeeData = selectedCourseData?.tees[round.tees];
  } else {
    const transformedCourse = JSON.parse(
      localStorage.getItem("transformedCourses") || "{}"
    );
    if (transformedCourse[round.courseValue]) {
      course = round.courseValue;
      selectedCourseData = transformedCourse[round.courseValue];
      selectedTeeData = selectedCourseData?.tees[round.tees];
    }
  }

  if (!selectedTeeData) {
    console.error(`Missing tee data for course: ${course}`);
    return;
  }

  const strokesAbovePar = round.score - selectedTeeData.par;
  const formattedDate = formatDate(round.datePlayed);

  const roundItem = document.createElement("li");
  roundItem.innerHTML = `
    <strong>Golfer:</strong> ${round.golferName}<br>
    <strong>Date Played:</strong> ${formattedDate}<br>
    <strong>Course:</strong> ${course}<br>
    <strong>Tees:</strong> ${round.tees}<br>
    <strong>Score:</strong> ${round.score} (${
    strokesAbovePar > 0
      ? "+" + strokesAbovePar
      : strokesAbovePar < 0
      ? strokesAbovePar
      : "E"
  })`;

  const deleteBtn = document.createElement("img");
  deleteBtn.src = "images/delete.png";
  deleteBtn.alt = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () =>
    deleteRound(index, round.golferName)
  );

  roundItem.appendChild(deleteBtn);
  roundsList.appendChild(roundItem);

  if (roundsDisplay) {
    roundsDisplay.style.display = "block";
  }
}

function deleteRound(index, golferName) {
  if (
    !confirm(
      "Are you sure you want to delete this round? This action cannot be undone."
    )
  )
    return;

  rounds.splice(index, 1);

  saveRounds(rounds);

  updateGolferHandicap(golferName);

  updateRankingsTable();

  refreshRoundsDisplay();
}

function refreshRoundsDisplay() {
  const roundsList = document.getElementById("rounds-list");
  roundsList.innerHTML = "";

  rounds.forEach((round, index) => {
    displayRound(round, index);
  });

  if (rounds.length === 0) {
    document.getElementById("rounds-display").style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHandicaps(golferHandicaps, updateRankingsTable);
});


document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("weather-course");
  const autocompleteList = document.getElementById("autocomplete-list");

  const manualCourses = Object.values(courseNames);
  let timeout;

  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      autocompleteList.innerHTML = "";
      return;
    }

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      let matches = manualCourses.filter((course) =>
        course.toLowerCase().includes(query)
      );

      fetch("https://golf-api-backend.vercel.app/courses")
        .then((response) => response.json())
        .then((data) => {
          if (data.courses) {
            const apiCourses = data.courses.map((c) => c.club_name);
            matches = matches.concat(
              apiCourses.filter((course) =>
                course.toLowerCase().includes(query)
              )
            );
          }

          matches = matches.slice(0, 5);

          autocompleteList.innerHTML = "";

          matches.forEach((course) => {
            const div = document.createElement("div");
            div.innerHTML = course;
            div.addEventListener("click", function () {
              input.value = course;
              autocompleteList.innerHTML = "";
            });
            autocompleteList.appendChild(div);
          });
        })
        .catch((error) => {
          console.error("Error fetching courses from API:", error);
        });
    }, 1000);
  });

  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.innerHTML = "";
    }
  });
});

document.getElementById("get-weather").addEventListener("click", function () {
  const courseName = document.getElementById("weather-course").value.trim();
  const date = document.getElementById("weather-date").value;
  const weatherTool = document.getElementById("weather-tool");
  const weatherResult = document.getElementById("weather-result");

  if (!courseName || !date) {
    alert("Please enter both a course and a date.");
    return;
  }

  const today = new Date();
  const maxDate = new Date();
  const minDate = new Date();
  maxDate.setDate(today.getDate() + 3);
  minDate.setDate(today.getDate() - 3);

  const selectedDate = new Date(date);

  if (selectedDate > maxDate) {
    alert("You can only check the weather forecast up to 3 days ahead.");
    return;
  }

  if (selectedDate < minDate) {
    alert("You can only check the weather forecast up to 2 days in the past.");
    return;
  }

  const formattedDate = formatDate(date);

  if (courseLocations[courseName]) {
    const { city, province, country } = courseLocations[courseName];

    const weatherApiUrl = `https://golf-api-backend.vercel.app/weather?city=${encodeURIComponent(
      city
    )}&province=${encodeURIComponent(province)}&country=${encodeURIComponent(
      country
    )}&date=${date}`;

    fetch(weatherApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          weatherResult.innerHTML = `Error: ${data.error.message}`;
        } else {
          const temp = data.temperature.celsius;
          const condition = data.condition.text;
          const iconUrl = data.condition.icon;
          const wind = data.wind_speed.kph;
      
          const weatherInfo = `
            <h3 style="text-align: center;">Weather Forecast for ${city} on ${formattedDate}</h3>
            <div style="text-align: center;">
              <img src="${iconUrl}" alt="${condition}" style="width: 100px; height: 100px;">
            </div>
            <div style="text-align: center; font-size: 48px; font-weight: bold;">
              ${temp} <sup>°C</sup>
            </div>
            <p style="text-align: center;">${condition}</p>
            <p style="text-align: center;"><strong>Wind Speed:</strong> ${wind} km/h</p>
            <button id="search-new-weather">Search for New Course Weather</button>
          `;
      
          weatherResult.innerHTML = weatherInfo;
          weatherResult.style.display = "block";
          weatherTool.style.display = "none";
      
          document
            .getElementById("search-new-weather")
            .addEventListener("click", function () {
              weatherResult.innerHTML = "";
              weatherTool.style.display = "block";
              weatherResult.style.display = "none";
            });
        }
      })
      .catch((error) => {
        weatherResult.innerHTML = `Error fetching weather data: ${error.message}`;
      });

    return;
  }

  const courseApiUrl = `https://golf-api-backend.vercel.app/courses`;

  fetch(courseApiUrl)
    .then((response) => response.json())
    .then((courseData) => {
      if (courseData.courses) {
        const course = courseData.courses.find(
          (c) => c.club_name === courseName
        );

        if (!course) {
          alert("Course not found.");
          return;
        }

        const city = course.location.city;
        const province = course.location.state;
        const country = course.location.country;

        if (!city) {
          alert("Course weather information not available for this course.");
          return;
        }

        const weatherApiUrl = `https://golf-api-backend.vercel.app/weather?city=${encodeURIComponent(
          city
        )}&province=${encodeURIComponent(province)}&country=${encodeURIComponent(
          country
        )}&date=${date}`;

        fetch(weatherApiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              weatherResult.innerHTML = `Error: ${data.error.message}`;
            } else {
              const temp = data.temperature.celsius;
              const condition = data.condition.text;
              const iconUrl = data.condition.icon;
              const wind = data.wind_speed.kph;
          
              const weatherInfo = `
                <h3 style="text-align: center;">Weather Forecast for ${city} on ${formattedDate}</h3>
                <div style="text-align: center;">
                  <img src="${iconUrl}" alt="${condition}" style="width: 100px; height: 100px;">
                </div>
                <div style="text-align: center; font-size: 48px; font-weight: bold;">
                  ${temp} <sup>°C</sup>
                </div>
                <p style="text-align: center;">${condition}</p>
                <p style="text-align: center;"><strong>Wind Speed:</strong> ${wind} km/h</p>
                <button id="search-new-weather">Search for New Course Weather</button>
              `;
          
              weatherResult.innerHTML = weatherInfo;
              weatherResult.style.display = "block";
              weatherTool.style.display = "none";
          
              document
                .getElementById("search-new-weather")
                .addEventListener("click", function () {
                  weatherResult.innerHTML = "";
                  weatherTool.style.display = "block";
                  weatherResult.style.display = "none";
                });
            }
          })
          .catch((error) => {
            weatherResult.innerHTML = `Error fetching weather data: ${error.message}`;
          });
      }
    });
});

document
  .getElementById("weather-result")
  .addEventListener("click", function (event) {
    if (event.target && event.target.id === "search-new-weather") {
      document.getElementById("weather-tool").style.display = "block";
      document.getElementById("weather-result").style.display = "none";
    }
  });
