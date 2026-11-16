/* BHARAT SHIELD - EDUCATIONAL FRONTEND SIMULATION */

const $ = (id) => document.getElementById(id);

const STORAGE = {
  reports: "bharatShieldCommanderReports",
  bugs: "bharatShieldBugReports",
  settings: "bharatShieldSettings",
  notifications: "bharatShieldNotifications"
};

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let commanderReports = readStore(STORAGE.reports, []);
let bugReports = readStore(STORAGE.bugs, []);
let notifications = readStore(STORAGE.notifications, []);

let settings = readStore(STORAGE.settings, {
  theme: "dark",
  notifications: true,
  compact: false,
  sound: false
});

let isAdmin = false;

/* TOAST MESSAGE */

function toast(message) {
  const region = $("toastRegion");
  const item = document.createElement("div");

  item.className = "toast";
  item.textContent = message;

  region.appendChild(item);

  setTimeout(() => item.remove(), 3800);
}

/* NOTIFICATIONS */

function addNotification(message) {
  if (!settings.notifications) return;

  notifications.unshift({
    message,
    time: new Date().toLocaleString("en-IN")
  });

  notifications = notifications.slice(0, 30);

  writeStore(STORAGE.notifications, notifications);

  renderNotifications();

  if (settings.sound) {
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.frequency.value = 660;
      gain.gain.value = 0.035;

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.12);

      oscillator.onended = () => audio.close();
    } catch (error) {
      console.log("Sound unavailable");
    }
  }
}

function renderNotifications() {
  $("notificationCount").textContent = notifications.length;

  const list = $("notificationList");
  list.replaceChildren();

  if (!notifications.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No notifications yet.";

    list.appendChild(empty);
    return;
  }

  notifications.forEach(notification => {
    const card = document.createElement("div");
    card.className = "record-card";
    card.textContent = notification.message;

    const small = document.createElement("small");
    small.textContent = notification.time;

    card.appendChild(small);
    list.appendChild(card);
  });
}

/* LIVE CLOCK */

function updateClock() {
  $("clock").textContent = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium"
  });
}

updateClock();
setInterval(updateClock, 1000);

/* INDIA MAP AND SATELLITE IMAGERY */

let map;
let streetLayer;
let satelliteLayer;

if (window.L && $("indiaMap")) {

  map = L.map("indiaMap").setView([22.8, 79.0], 4.6);

  streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }
  );

  satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 18,
      attribution: "Tiles &copy; Esri"
    }
  );

  streetLayer.addTo(map);

  const demoPoints = [
    ["New Delhi · demo marker", 28.6139, 77.2090],
    ["Jaipur · demo marker", 26.9124, 75.7873],
    ["Guwahati · demo marker", 26.1445, 91.7362],
    ["Bhubaneswar · demo marker", 20.2961, 85.8245],
    ["Ahmedabad · demo marker", 23.0225, 72.5714]
  ];

  demoPoints.forEach(([name, lat, lng], i) => {

    L.circleMarker([lat, lng], {
      radius: 7,
      color: i === 2 ? "#ffbf69" : "#00e6a0",
      fillColor: i === 2 ? "#ffbf69" : "#00e6a0",
      fillOpacity: .85,
      weight: 2
    })
      .addTo(map)
      .bindPopup(`<strong>${name}</strong><br>Illustrative location only`);
  });

  $("streetMapButton").addEventListener("click", () => {

    if (map.hasLayer(satelliteLayer)) {
      map.removeLayer(satelliteLayer);
    }

    streetLayer.addTo(map);

    $("streetMapButton").classList.add("active");
    $("satelliteMapButton").classList.remove("active");
  });

  $("satelliteMapButton").addEventListener("click", () => {

    if (map.hasLayer(streetLayer)) {
      map.removeLayer(streetLayer);
    }

    satelliteLayer.addTo(map);

    $("satelliteMapButton").classList.add("active");
    $("streetMapButton").classList.remove("active");
  });

} else {
  $("indiaMap").textContent =
    "Map library could not load. Check your internet connection and refresh.";
}

/* FOUR DRONE BATTERY INDICATORS */

const batteries = [92, 85, 78, 67];

setInterval(() => {

  batteries.forEach((value, i) => {

    const next = Math.max(
      25,
      value - (Math.random() > .72 ? 1 : 0)
    );

    batteries[i] = next;

    $(`battery${i}`).textContent = `${next}%`;
    $(`bar${i}`).style.width = `${next}%`;

  });

}, 7000);

/* CCTV CONTROL DEMO */

document.querySelectorAll(".camera-action").forEach(button => {

  button.addEventListener("click", () => {

    const camera = button
      .closest(".camera-card")
      .querySelector(".camera-controls strong")
      .textContent;

    const action = button.dataset.action;

    $("cameraMessage").textContent =
      `${camera}: simulated "${action}" command. No physical camera is connected.`;

    toast(`${camera}: ${action} (demo)`);

  });

});

/* SENSOR AND THERMAL DETECTION */

$("runSensorCheck").addEventListener("click", () => {

  const eventDetected = Math.random() > 0.62;

  if (eventDetected) {

    $("motionState").textContent = "DEMO EVENT";
    $("motionState").className = "status-pill status-info";

    $("motionValue").textContent = "Sample movement";

    $("vibrationState").textContent = "CHECK";
    $("vibrationState").className = "status-pill";

    $("vibrationValue").textContent = "Review sample";

    $("thermalState").textContent = "DEMO EVENT";
    $("thermalState").className = "status-pill status-info";

    $("thermalValue").textContent =
      `${(29 + Math.random() * 5).toFixed(1)} °C`;

    $("sensorAlert").innerHTML = `
      <span>●</span>
      <div>
        <strong>Simulated Sensor Event</strong>
        <small>Illustrative test event only.</small>
      </div>
    `;

    $("sensorAlert").style.borderColor =
      "rgba(255,191,105,.35)";

    $("sensorAlert").style.color = "var(--amber)";

    addNotification("A simulated sensor/thermal event was generated.");

    toast("Demo sensor event generated.");

  } else {

    resetSensorDisplay();

    toast("Demo sensor check: all sample readings normal.");

  }

});

function resetSensorDisplay() {

  ["motionState", "vibrationState", "thermalState"].forEach(id => {

    $(id).textContent = "NORMAL";
    $(id).className = "status-pill status-ok";

  });

  $("motionValue").textContent = "No event";
  $("vibrationValue").textContent = "Low";
  $("thermalValue").textContent = "24.8 °C";

  $("sensorAlert").innerHTML = `
    <span>●</span>
    <div>
      <strong>All demo sensors normal</strong>
      <small>No simulated event currently active.</small>
    </div>
  `;

  $("sensorAlert").style.borderColor =
    "rgba(0,230,160,.2)";

  $("sensorAlert").style.color = "var(--green)";
}

/* REPORT ID GENERATOR */

function makeId(prefix) {

  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

}

/* COMMANDER REPORT SYSTEM */

function renderCommanderReports() {

  const tbody = $("commanderReportRows");

  tbody.replaceChildren();

  if (!commanderReports.length) {

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 5;
    td.className = "empty-state";
    td.textContent = "No reports submitted yet.";

    tr.appendChild(td);
    tbody.appendChild(tr);

  } else {

    commanderReports.forEach(report => {

      const tr = document.createElement("tr");

      [report.id, report.category, report.date].forEach(value => {

        const td = document.createElement("td");
        td.textContent = value;

        tr.appendChild(td);

      });

      const statusTd = document.createElement("td");

      const pill = document.createElement("span");

      pill.className = "status-pill " +
        (report.status === "Reviewed (demo)"
          ? "status-ok"
          : "status-info");

      pill.textContent = report.status;

      statusTd.appendChild(pill);
      tr.appendChild(statusTd);

      const actionTd = document.createElement("td");

      if (isAdmin && report.status === "Submitted (demo)") {

        const review = document.createElement("button");

        review.className = "small-button";
        review.textContent = "Mark Reviewed";

        review.addEventListener("click", () => {

          report.status = "Reviewed (demo)";

          writeStore(STORAGE.reports, commanderReports);

          renderCommanderReports();
          updateMetrics();

          addNotification(
            `Report ${report.id} marked reviewed in demo.`
          );

        });

        actionTd.appendChild(review);

      } else {

        actionTd.textContent = isAdmin
          ? "No action"
          : "Admin only";

      }

      tr.appendChild(actionTd);
      tbody.appendChild(tr);

    });

  }

  updateMetrics();
}

function updateMetrics() {

  $("openReports").textContent = String(
    commanderReports.filter(
      report => report.status === "Submitted (demo)"
    ).length
  ).padStart(2, "0");

}

$("commanderForm").addEventListener("submit", event => {

  event.preventDefault();

  const report = {

    id: makeId("BSR"),

    name: $("commanderReporter").value.trim(),

    category: $("commanderCategory").value,

    details: $("commanderDetails").value.trim(),

    date: new Date().toLocaleString("en-IN"),

    status: "Submitted (demo)"

  };

  commanderReports.unshift(report);

  writeStore(STORAGE.reports, commanderReports);

  event.target.reset();

  renderCommanderReports();

  addNotification(
    `Commander demo report ${report.id} submitted locally.`
  );

  toast(`Report saved locally. ID: ${report.id}`);

});

renderCommanderReports();

/* BUG REPORT SYSTEM */

function renderBugs() {

  const list = $("bugList");

  list.replaceChildren();

  if (!bugReports.length) {

    const empty = document.createElement("p");

    empty.className = "empty-state";
    empty.textContent = "No bug reports recorded.";

    list.appendChild(empty);

    return;

  }

  bugReports.forEach(bug => {

    const card = document.createElement("div");
    card.className = "record-card";

    const title = document.createElement("strong");

    title.textContent =
      `${bug.title} · ${bug.severity}`;

    const desc = document.createElement("div");

    desc.textContent = bug.description;

    const small = document.createElement("small");

    small.textContent = `${bug.id} · ${bug.date}`;

    card.append(title, desc, small);

    list.appendChild(card);

  });

}

$("bugForm").addEventListener("submit", event => {

  event.preventDefault();

  bugReports.unshift({

    id: makeId("BUG"),

    title: $("bugTitle").value.trim(),

    severity: $("bugSeverity").value,

    description: $("bugDescription").value.trim(),

    date: new Date().toLocaleString("en-IN")

  });

  writeStore(STORAGE.bugs, bugReports);

  event.target.reset();

  renderBugs();

  $("bugFeedback").textContent =
    "Bug report saved in this browser.";

  addNotification("A new project bug report was saved.");

  toast("Bug report saved.");

});

renderBugs();

/* SMS ALERT DEMO */

$("testSmsButton").addEventListener("click", () => {

  const stamp = new Date().toLocaleTimeString("en-IN");

  $("smsAlertText").textContent =
    `Test alert generated at ${stamp} · local demo only`;

  addNotification(
    "Test SMS alert generated locally. No SMS was transmitted."
  );

  toast("Demo SMS alert displayed. No text message was sent.");

});

/* ADMIN LOGIN SYSTEM */

const loginDialog = $("loginDialog");

let faceVerified = false;
let faceStream = null;

function openLogin() {

  $("loginError").textContent = "";

  faceVerified = false;

  $("faceState").textContent = "NOT VERIFIED";

  $("faceState").className = "status-pill status-info";

  loginDialog.showModal();

}

$("topLoginButton").addEventListener("click", openLogin);

$("settingsLoginButton").addEventListener("click", openLogin);

$("closeLogin").addEventListener("click", () => {
  loginDialog.close();
});

/* CAMERA PREVIEW */

$("startFaceButton").addEventListener("click", async () => {

  const video = $("faceVideo");

  try {

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera access is unavailable. Use localhost or HTTPS."
      );
    }

    faceStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = faceStream;

    video.classList.add("active");

    $("faceState").textContent = "CAMERA READY";

    $("faceState").className = "status-pill status-ok";

    $("loginError").textContent =
      "Camera preview enabled. Select Run Face Check.";

  } catch (error) {

    $("loginError").textContent =
      error.message || "Camera permission was not granted.";

  }

});

/* SIMULATED FACE CHECK */

$("scanFaceButton").addEventListener("click", () => {

  if (!faceStream) {

    $("loginError").textContent =
      "Enable the camera first. Face verification is simulated.";

    return;

  }

  faceVerified = true;

  $("faceState").textContent = "DEMO CHECK PASSED";

  $("faceState").className = "status-pill status-ok";

  $("loginError").textContent =
    "Demo face-check complete. This does not identify a real person.";

});

/* LOGIN VALIDATION */

$("loginForm").addEventListener("submit", event => {

  event.preventDefault();

  const email = $("adminEmail").value.trim().toLowerCase();

  const password = $("adminPassword").value;

  if (
    email === "admin@bharatshield.demo" &&
    password === "Shield@123" &&
    faceVerified
  ) {

    isAdmin = true;

    loginDialog.close();

    $("topLoginButton").textContent =
      "Admin signed in · Sign out";

    $("adminStatus").textContent =
      "Administrator: signed in (demo session)";

    $("topLoginButton").onclick = () => {

      isAdmin = false;

      $("topLoginButton").textContent =
        "Sign in as admin";

      $("adminStatus").textContent =
        "Administrator: signed out";

      renderCommanderReports();

      toast("Demo admin signed out.");

      $("topLoginButton").onclick = openLogin;

    };

    renderCommanderReports();

    toast("Admin demo session started.");

  } else if (!faceVerified) {

    $("loginError").textContent =
      "Complete the demo face-check before signing in.";

  } else {

    $("loginError").textContent =
      "Incorrect demo email or password.";

  }

});

/* STOP CAMERA WHEN LOGIN CLOSES */

loginDialog.addEventListener("close", () => {

  if (faceStream) {

    faceStream.getTracks().forEach(track => track.stop());

    faceStream = null;

  }

  $("faceVideo").srcObject = null;

  $("faceVideo").classList.remove("active");

});

/* NOTIFICATION WINDOW */

const notificationDialog = $("notificationDialog");

$("notificationButton").addEventListener("click", () => {
  notificationDialog.showModal();
});

$("closeNotifications").addEventListener("click", () => {
  notificationDialog.close();
});

$("clearNotifications").addEventListener("click", () => {

  notifications = [];

  writeStore(STORAGE.notifications, notifications);

  renderNotifications();

  toast("Notifications cleared.");

});

renderNotifications();

/* SETTINGS */

function applySettings() {

  document.body.classList.toggle(
    "light",
    settings.theme === "light"
  );

  document.body.classList.toggle(
    "compact",
    settings.compact
  );

  $("themeSelect").value = settings.theme;

  $("notificationToggle").checked =
    settings.notifications;

  $("compactToggle").checked =
    settings.compact;

  $("soundToggle").checked =
    settings.sound;

}

function saveSettings() {

  writeStore(STORAGE.settings, settings);

  applySettings();

}

$("themeSelect").addEventListener("change", event => {

  settings.theme = event.target.value;

  saveSettings();

});

$("notificationToggle").addEventListener("change", event => {

  settings.notifications = event.target.checked;

  saveSettings();

  toast("Notification preference saved.");

});

$("compactToggle").addEventListener("change", event => {

  settings.compact = event.target.checked;

  saveSettings();

});

$("soundToggle").addEventListener("change", event => {

  settings.sound = event.target.checked;

  saveSettings();

});

applySettings();

/* EXPORT DATA */

$("exportData").addEventListener("click", () => {

  const data = {

    exportedAt: new Date().toISOString(),

    commanderReports,

    bugReports,

    notifications,

    settings

  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "bharat-shield-demo-data.json";

  a.click();

  URL.revokeObjectURL(url);

  toast("JSON export prepared.");

});

/* CLEAR DATA */

$("clearData").addEventListener("click", () => {

  const confirmed = confirm(
    "Clear all locally saved demo reports, bug reports and notifications?"
  );

  if (!confirmed) return;

  commanderReports = [];
  bugReports = [];
  notifications = [];

  writeStore(STORAGE.reports, commanderReports);

  writeStore(STORAGE.bugs, bugReports);

  writeStore(STORAGE.notifications, notifications);

  renderCommanderReports();

  renderBugs();

  renderNotifications();

  toast("Local demo records cleared.");

});

/* MOBILE MENU */

$("mobileMenu").addEventListener("click", () => {

  $("sidebar").classList.toggle("menu-open");

});

/* NAVIGATION ACTIVE STATE */

document.querySelectorAll(".nav-link").forEach(link => {

  link.addEventListener("click", () => {

    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");

    $("sidebar").classList.remove("menu-open");

  });

});

console.info(
  "BHARAT SHIELD loaded: frontend demo mode. No live sensors, drones, cameras or command network are connected."
);