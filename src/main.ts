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
const canvasWidth = 256;
const canvasHeight = 256;
const borderSize = 2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.border = `${borderSize}px solid black`;
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "3px 3px 5px gray";
canvas.style.backgroundColor = "white";
app.append(canvas);

let drawing = false;
let currentMarkerLine: MarkerLine | null = null;
const segments: MarkerLine[] = [];
const drawingChangedEvent = new Event("drawing-changed");
const undoStack: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

// Store the current marker thickness
let currentMarkerThickness = 1;

// Function to set the selected tool (thin or thick)
function setSelectedTool(thickness: number) {
  currentMarkerThickness = thickness;
}

if (context2D) {
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    currentMarkerLine = new MarkerLine(x, y, currentMarkerThickness);
    if (context2D) {
      currentMarkerLine.display(context2D);
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    if (currentMarkerLine && context2D) {
      const x = e.clientX - canvas.getBoundingClientRect().left;
      const y = e.clientY - canvas.getBoundingClientRect().top;
      currentMarkerLine.drag(x, y);
      currentMarkerLine.display(context2D as CanvasRenderingContext2D); // Type assertion
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (currentMarkerLine) {
      segments.push(currentMarkerLine);
      currentMarkerLine = null;
      canvas.dispatchEvent(drawingChangedEvent);
    }
    drawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    drawing = false;
  });
}

// clear, undo, and redo buttons
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
  context2D!.clearRect(0, 0, canvasWidth, canvasHeight);
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
  context2D!.clearRect(0, 0, canvasWidth, canvasHeight);
  for (const segment of segments) {
    for (let i = 0; i < segment.points.length - 1; i++) {
      context2D!.beginPath();
      context2D!.strokeStyle = "black";
      context2D!.lineWidth = segment.thickness;
      context2D!.moveTo(segment.points[i].x, segment.points[i].y);
      context2D!.lineTo(segment.points[i + 1].x, segment.points[i + 1].y);
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

class MarkerLine {
  points: { x: number; y: number }[] = [];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points.push({ x, y });
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = this.thickness;
    for (let i = 0; i < this.points.length - 1; i++) {
      context.moveTo(this.points[i].x, this.points[i].y);
      context.lineTo(this.points[i + 1].x, this.points[i + 1].y);
    }
    context.stroke();
    context.closePath();
  }
}
