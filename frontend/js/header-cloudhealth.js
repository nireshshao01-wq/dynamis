// ========================================
// HEADER CLOUDHEALTH LOGIC
// ========================================

// Load available months into dropdown
async function loadMonths() {
  const select = document.getElementById("monthLabel");

  if (!select) return;

  select.innerHTML = "<option>Loading months...</option>";

  try {
    const res = await fetch("http://localhost:3001/api/months");

    if (!res.ok) {
      throw new Error("Failed to fetch months");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid months response");
    }

    if (data.length === 0) {
      select.innerHTML = "<option>No months uploaded yet</option>";
      return;
    }

    select.innerHTML = "";

    data.forEach(month => {
      const opt = document.createElement("option");
      opt.value = month;
      opt.textContent = month;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Month load error:", err);
    select.innerHTML = "<option>Error loading months</option>";
  }
}

// ========================================
// INITIALISE HEADER
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  loadMonths();
});