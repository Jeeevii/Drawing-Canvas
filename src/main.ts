import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const context2D: CanvasRenderingContext2D | null = canvas.getContext("2d");

const gameName = "Jeevi's Drawing Game";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
//app.append(header);

// create drawing canvas
const canvasWidth = 256;
const canvasHeight = 256;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.border = "2px solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "3px 3px 5px gray";
canvas.style.backgroundColor = "white";
//app.append(canvas);

let drawing = false;
let currentMarkerLine: MarkerLine | null = null;
const segments: MarkerLine[] = [];
const drawingChangedEvent = new Event("drawing-changed");
const undoStack: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

// store the current marker thickness
let currentMarkerThickness = 1;

// function to set the selected tool (thin or thick)
function setSelectedTool(thickness: number) {
  currentMarkerThickness = thickness;
  updateToolButtons(thickness);
}

// create buttons for "Thin" and "Thick" tools
const thinButton = createToolButton("Thin", 0.5);
const thickButton = createToolButton("Thick", 2);

//app.append(thinButton, thickButton, canvas);

// apply selected tool styling
function updateToolButtons(selectedThickness: number) {
  const buttons = [thinButton, thickButton];
  buttons.forEach((button) => {
    if (button.dataset.thickness === selectedThickness.toString()) {
      button.classList.add("selectedTool");
    } else {
      button.classList.remove("selectedTool");
    }
  });
}

function createToolButton(label: string, thickness: number): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.dataset.thickness = thickness.toString();
  button.addEventListener("click", () => {
    setSelectedTool(thickness);
  });
  return button;
}

if (context2D) {
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    currentMarkerLine = new MarkerLine(x, y, currentMarkerThickness);
    if (context2D && currentMarkerLine) {
      currentMarkerLine.display(context2D);
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    if (currentMarkerLine && context2D) {
      const x = e.clientX - canvas.getBoundingClientRect().left;
      const y = e.clientY - canvas.getBoundingClientRect().top;
      currentMarkerLine.drag(x, y);
      currentMarkerLine.display(context2D as CanvasRenderingContext2D);
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
//app.append(clearButton, thinButton, thickButton, canvas, undoButton, redoButton);

clearButton.addEventListener("click", () => {
  clearCanvas();
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
//app.append(undoButton);

undoButton.addEventListener("click", () => {
  undoDrawing();
});

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
//app.append(redoButton);

redoButton.addEventListener("click", () => {
  redoDrawing();
});

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
//app.append(exportButton);

exportButton.addEventListener("click", () => {
  exportCanvasAsPNG();
});
function clearCanvas() {
  context2D!.clearRect(0, 0, canvasWidth, canvasHeight);
  segments.length = 0;
  undoStack.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(drawingChangedEvent);
}

function undoDrawing() {
  if (segments.length > 0) {
    undoStack.push(segments.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
}

function redoDrawing() {
  if (undoStack.length > 0) {
    segments.push(undoStack.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
}

// add stickers and buttons
const stickers: Emoji[] = [];
const stickerButtons = createStickerButtons();

//app.append(...stickerButtons);

function createStickerButtons(): HTMLButtonElement[] {
  const stickersData = [
    { label: "💀", sticker: "💀" },
    { label: "🐈‍⬛", sticker: "🐈‍⬛" },
    { label: "😎", sticker: "😎" },
  ];

  return stickersData.map((data) => {
    const button = document.createElement("button");
    button.textContent = data.label;
    button.addEventListener("click", () => addSticker(data.sticker));
    return button;
  });
}

function addSticker(sticker: string) {
  const x = Math.random() * (canvasWidth - 100);
  const y = Math.random() * (canvasHeight - 100);
  const newSticker = new Emoji(sticker, x, y);
  stickers.push(newSticker);
  newSticker.display(context2D as CanvasRenderingContext2D);
  canvas.dispatchEvent(drawingChangedEvent);
}

// custom Stickers
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";

customStickerButton.addEventListener("click", () => {
  const customSticker = window.prompt("Enter your custom sticker:", " ");
  if (customSticker) {
    addSticker(customSticker);
  }
});

//app.append(customStickerButton);

// observer for "drawing-changed" event
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

function redrawCanvas() {
  context2D!.clearRect(0, 0, canvasWidth, canvasHeight);
  for (const segment of segments) {
    segment.display(context2D!);
  }
  for (const sticker of stickers) {
    sticker.display(context2D!);
  }
  updateUndoRedoButtons();
}

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

class Emoji {
  sticker: string;
  x: number;
  y: number;

  constructor(sticker: string, x: number, y: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "32px serif";
    context.fillText(this.sticker, this.x, this.y);
  }
}

// function to export the canvas as a PNG file
function exportCanvasAsPNG() {
  // create a new canvas with a larger size
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d");
  // prompt the user for the filename
  const fileName = window.prompt("Enter the filename:", "drawing");

  if (!fileName) {
    return; // user canceled the prompt
  }
  if (!exportContext) {
    console.error("Could not get the export canvas context.");
    return;
  }

  // scale the content
  const scale = 4; // 4x scaling
  exportContext.scale(scale, scale);

  // draw all segments and stickers on the new canvas
  for (const segment of segments) {
    segment.display(exportContext);
  }
  for (const sticker of stickers) {
    sticker.display(exportContext);
  }

  // create an anchor element for downloading
  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = `${fileName}.png`; // use the specified filename
  anchor.click();
}

app.append(
  header,
  canvas,
  clearButton,
  undoButton,
  redoButton,
  thinButton,
  thickButton,
  ...stickerButtons,
  customStickerButton,
  exportButton
);
