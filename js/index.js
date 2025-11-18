const canvas = document.querySelector("#scratch");
const ctx = canvas.getContext("2d");
const sliderContainer = document.querySelector(".slider1");
const slide = document.querySelectorAll(".slide1");
const slideHeight = slide[0].clientHeight;
const link = document.querySelectorAll(".link");
const video = document.querySelector("video");
const img = new Image();
const spreadsheetId = "1kAkZoWDwcZsFV6EYyyc6pvnp77a4vcle";
const gid = "0";
const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
const listContainer = document.querySelector(".list");
const search = document.querySelector(".search");
const input = document.querySelector(".input");
const volume = document.querySelector(".volume");
const title = document.querySelector(".title");
const coin = document.querySelector(".coin");
const schrt = document.querySelector(".schrt");

let currentIndex = 0;
let isDrawing = false;
let lastTouchY = 0;
let lastScrollTime = 0;
let isVolume = false;
let isMouseOverTitle = false;

img.src = "./assets/ptic.png";
img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseleave", () => (isDrawing = false));

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  coin.style.left = `${x}px`;
  coin.style.top = `${y}px`;

  if (!isDrawing) return;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
});


function updateSlide() {
  sliderContainer.style.transform = `translateY(${
    -currentIndex * slideHeight
  }px)`;
  link.forEach((item, index) =>
    item.classList.toggle("active", index === currentIndex)
  );
  console.log(currentIndex);

  if (currentIndex === 0 || currentIndex === 2) video.pause();
  else if (currentIndex === 1) video.play();

  schrt.appendChild(coin)
}

link.forEach((item) =>
  item.addEventListener("click", () => {
    currentIndex = parseInt(item.getAttribute("data-index"));
    updateSlide();
  })
);

function ChangeSlide(delta) {
  const now = Date.now();
  if (now - lastScrollTime < 800) return;
  lastScrollTime = now;

  currentIndex = (currentIndex + delta + slide.length) % slide.length;
  updateSlide();
}

sliderContainer.addEventListener("touchstart", (e) => {
  lastTouchY = e.touches[0].clientY;
});

sliderContainer.addEventListener("touchmove", (e) => {
  if (isMouseOverTitle) return;
  let touchY = e.touches[0].clientY;
  let deltaY = lastTouchY - touchY;

  if (Math.abs(deltaY) > 100) {
    ChangeSlide(deltaY > 0 ? 1 : -1);
    lastTouchY = touchY;
  }
});

sliderContainer.addEventListener("wheel", (e) => {
  if (isMouseOverTitle) return;
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 50)
    ChangeSlide(e.deltaY > 0 ? 1 : -1);
});

title.addEventListener("mouseenter", () => (isMouseOverTitle = true));
title.addEventListener("mouseleave", () => (isMouseOverTitle = false));

function mute() {
  volume.innerHTML = "";
  if (!isVolume) {
    video.muted = false;
    isVolume = true;
    volume.innerHTML = `<i class="bi bi-volume-up-fill"></i>`;
  } else {
    video.muted = true;
    isVolume = false;
    volume.innerHTML = `<i class="bi bi-volume-mute-fill"></i>`;
  }
}

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function doSearch(query, data) {
  if (!query) {
    listContainer.classList.remove("hidden");
    search.classList.add("hidden");
    search.innerHTML = "";
    return;
  }

  listContainer.classList.add("hidden");
  search.classList.remove("hidden");
  search.innerHTML = "";

  const result = data.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  if (result.length === 0) {
    search.innerHTML = `<p>Ничего не найдено</p>`;
  } else {
    result.forEach((val) => {
      search.innerHTML += `
        <div class="list-elem">
          <p>${val.name}</p>
          <span>${val.businessAddres}</span>,
          <span>${val.businessCity}</span>,
          <span>${val.businessState}</span>,
          <span>${val.businessZip}</span>
        </div>
      `;
    });
  }
}

const safeSearch = debounce(
  (e, data) => doSearch(e.target.value.trim(), data),
  300
);

async function fetchSheet() {
  const res = await fetch(url);
  const text = await res.text();
  const jsonText = text.match(/\{.*\}/s);
  if (!jsonText) throw new Error("Ошибка парсинга JSON!");
  const data = JSON.parse(jsonText);

  const cols = data.table.cols.map((c) => c.label || c.id);
  const rows = data.table.rows.slice(1, 100).map((r) => {
    const obj = {};
    r.c.forEach((cell, i) => (obj[cols[i]] = cell ? cell.v : ""));
    return obj;
  });

  const locations = rows.map((row) => ({
    retailer: row.A,
    name: row.B,
    businessAddres: row.C,
    businessCity: row.E,
    businessState: row.F,
    businessZip: row.G,
  }));
  listContainer.innerHTML = "";
  locations.forEach((val) => {
    listContainer.innerHTML += `
      <div class="list-elem">
        <p>${val.name}</p>
        <span>${val.businessAddres}</span>,
        <span>${val.businessCity}</span>,
        <span>${val.businessState}</span>,
        <span>${val.businessZip}</span>
      </div>
    `;
  });

  input.addEventListener("input", (e) => safeSearch(e, locations));

  return locations;
}

fetchSheet();

function closeAll() {
  document.querySelector(".container").classList.add("hidden");
}
