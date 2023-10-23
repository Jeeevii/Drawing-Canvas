import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const context2D: CanvasRenderingContext2D | null = canvas.getContext("2d");

const gameName = "Jeevi's Drawing Game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// drawing canvas
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "2px solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "3px 3px 5px gray";
canvas.style.backgroundColor = "white";
app.append(canvas);

// using arrays to store each stroke to handle redo, undo, and clear
let drawing = false;
let currentSegment: { x: number; y: number }[] = [];
const segments: { x: number; y: number }[][] = [];
const drawingChangedEvent = new Event("drawing-changed");
const undoStack: { x: number; y: number }[][] = [];
const redoStack: { x: number; y: number }[][] = [];

if (context2D) {
  // handing mouse interaction for drawing
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    context2D.beginPath();
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    currentSegment.push({ x, y });
    context2D.moveTo(x, y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    currentSegment.push({ x, y });
    context2D.lineTo(x, y);
    context2D.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    if (currentSegment.length > 0) {
      segments.push([...currentSegment]);
      currentSegment = [];
      canvas.dispatchEvent(drawingChangedEvent);
    }
    drawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    drawing = false;
  });
}

// clear, undo and redo buttons
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  clearCanvas();
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  undoDrawing();
});

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  redoDrawing();
});

function clearCanvas() {
  // clear the canvas and stack with stroke elements
  context2D!.clearRect(0, 0, canvas.width, canvas.height);
  segments.length = 0;
  undoStack.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(drawingChangedEvent);
}

function undoDrawing() {
  // push back the recent element that was popped
  if (segments.length > 0) {
    undoStack.push(segments.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
}

function redoDrawing() {
  // same thing
  if (undoStack.length > 0) {
    segments.push(undoStack.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
}

// add an observer for "drawing-changed" event
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

// function to redraw the canvas
function redrawCanvas() {
  context2D!.clearRect(0, 0, canvas.width, canvas.height);
  for (const segment of segments) {
    for (let i = 0; i < segment.length - 1; i++) {
      context2D!.beginPath();
      context2D!.strokeStyle = "black";
      context2D!.lineWidth = 1;
      context2D!.moveTo(segment[i].x, segment[i].y);
      context2D!.lineTo(segment[i + 1].x, segment[i + 1].y);
      context2D!.stroke();
      context2D!.closePath();
    }
  }
  updateUndoRedoButtons();
}

// function to update undo and redo buttons
function updateUndoRedoButtons() {
  undoButton.disabled = segments.length === 0;
  redoButton.disabled = undoStack.length === 0;
}

updateUndoRedoButtons();
