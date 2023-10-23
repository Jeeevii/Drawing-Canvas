import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const canvas: HTMLCanvasElement = document.createElement("canvas");

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
app.appendChild(canvas);
