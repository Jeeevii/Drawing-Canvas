import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const context2D: CanvasRenderingContext2D | null = canvas.getContext("2d");

const gameName = "Jeevi's Game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

canvas.width = 256;
canvas.height = 256;
canvas.style.border = "2px solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "3px 3px 5px gray";
canvas.style.backgroundColor = "white";
app.append(canvas);

let drawing = false;

if (context2D) {
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    context2D.beginPath();
    context2D.moveTo(
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    context2D.lineTo(
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top
    );
    context2D.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    drawing = false;
  });
}

const clearButton = document.createElement("button");
clearButton.textContent = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  if (context2D) {
    context2D.clearRect(0, 0, canvas.width, canvas.height);
  }
});
