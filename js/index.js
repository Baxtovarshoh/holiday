const canvas = document.querySelector("#scratch");
const ctx = canvas.getContext("2d");
const sliderContainer = document.querySelector(".slider1");
const slide = document.querySelectorAll(".slide1");
const slideHeight = slide[0].clientHeight;
const link = document.querySelectorAll(".link");
const video = document.querySelector("video");
const img = new Image();
const coin = document.createElement("img");
const spreadsheetId = "1kAkZoWDwcZsFV6EYyyc6pvnp77a4vcle";
const gid = "0";
const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
const listContainer = document.querySelector(".list");
let isDrawing = false;
let currentIndex = 0;
let lastTouchY = 0;
let lastScrollTime = 0;

img.src = "../assets/ptic.png";

coin.src = "../assets/coin.png";
coin.className = "coin";
document.body.appendChild(coin);

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

  coin.style.left = `${e.clientX}px`;
  coin.style.top = `${e.clientY}px`;

  if (currentIndex > 3) {
    console.log("hama sadat");
  }

  if (!isDrawing) return;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
});

async function fetchSheet() {
  const res = await fetch(url);
  const text = await res.text();
  const jsonText = text.match(/\{.*\}/s);
  if (!jsonText) throw new Error("Ошибка парсинга JSON!");
  const data = JSON.parse(jsonText);
  let location = [];

  const cols = data.table.cols.map((c) => c.label || c.id);
  const rows = data.table.rows.slice(1, 100).map((r) => {
    const obj = {};
    r.c.forEach((cell, i) => (obj[cols[i]] = cell ? cell.v : ""));
    return obj;
  });
  location = rows.map((row) => ({
    retailer: row.A,
    name: row.B,
    businessAddres: row.C,
    businessCity: row.E,
    businessState: row.F,
    businessZip: row.G,
  }));
  location.map((val) => {
    listContainer.innerHTML += `
    <div class="list-elem">
      <p>${val.name}</p>
      <span>${val.businessAddres}</span>,<span>${val.businessCity}</span>,
      <span>${val.businessState}</span>,<span>${val.businessZip}</span>
    </div>
    `;
  });

  return rows;
}

fetchSheet();

function updateSlide() {
  sliderContainer.style.transform = `translateY(${
    -currentIndex * slideHeight
  }px)`;
  link.forEach((item, index) =>
    item.classList.toggle("active", index === currentIndex)
  );
  if (currentIndex === 0 || currentIndex === 2) {
    video.pause();
  } else if (currentIndex === 1) {
    console.log("hama saday");
    video.play();
  }
  if (currentIndex === 1 || currentIndex === 2) {
    coin.classList.add("hidden");
  } else {
    coin.classList.remove("hidden");
  }
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

sliderContainer.addEventListener("touchstart", (event) => {
  lastTouchY = event.touches[0].clientY;
  console.log(event.touches[0].clientY);
});

sliderContainer.addEventListener("touchmove", (event) => {
  let touchY = event.touches[0].clientY;
  let deltaY = lastTouchY - touchY;

  if (Math.abs(deltaY) > 100) {
    ChangeSlide(deltaY > 0 ? 1 : -1);
    lastTouchY = touchY;
  }
});
sliderContainer.addEventListener("wheel", (event) => {
  if (
    Math.abs(event.deltaY) > Math.abs(event.deltaX) &&
    Math.abs(event.deltaY) > 50
  ) {
    ChangeSlide(event.deltaY > 0 ? 1 : -1);
  }
});
