// src/script.ts

async function loadMediapipeModules() {
  const module = await import(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3"
  );

  return {
    GestureRecognizer: module.GestureRecognizer,
    FilesetResolver: module.FilesetResolver,
    DrawingUtils: module.DrawingUtils,
  };
}

let gestureRecognizer: any; // GestureRecognizer instance
type RunningMode = "IMAGE" | "VIDEO";
let runningMode: RunningMode = "IMAGE";
let webcamRunning: boolean = false;
const videoHeight = "360px";
const videoWidth = "480px";

let enableWebcamButton: HTMLButtonElement; // Declare enableWebcamButton here

const createGestureRecognizer = async () => {
  const { GestureRecognizer, FilesetResolver } = await loadMediapipeModules();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: runningMode,
  });

  const demosSection = document.getElementById("demos");
  if (demosSection) {
    demosSection.classList.remove("invisible");
  }
};

createGestureRecognizer();

/********************************************************************
// Detect hand gestures in images
********************************************************************/

const imageContainers = document.getElementsByClassName("detectOnClick");

for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i].children[0].addEventListener("click", handleClick);
}

async function handleClick(event: any) {
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await gestureRecognizer.setOptions({ runningMode: "IMAGE" });
  }

  // Remove all previous landmarks
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (let i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  const results = gestureRecognizer.recognize(event.target);

  // View results in the console to see their format
  console.log(results);
  if (results && results.gestures.length > 0) {
    const p = event.target.parentNode.childNodes[3] as HTMLElement;
    p.setAttribute("class", "info");

    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
    const handedness = results.handednesses[0][0].displayName;

    p.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore}%\n Handedness: ${handedness}`;
    p.style.left = "0px";
    p.style.top = `${event.target.height}px`;
    p.style.width = `${event.target.width - 10}px`;

    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = `${event.target.width}px`;
    canvas.style.height = `${event.target.height}px`;

    event.target.parentNode.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    const drawingUtils = new (
      await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3"
      )
    ).DrawingUtils(canvasCtx);
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        gestureRecognizer.constructor.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 5,
        }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 1,
      });
    }
  }
}

/********************************************************************
// Continuously grab image from webcam stream and detect it.
********************************************************************/

const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
  "output_canvas"
) as HTMLCanvasElement;
const canvasCtx = canvasElement?.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById(
    "webcamButton"
  ) as HTMLButtonElement;
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event: any) {
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results: any | undefined = undefined;
async function predictWebcam() {
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
  }
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }

  if (canvasElement && canvasCtx) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
  }
  if (video) {
    video.style.height = videoHeight;
    video.style.width = videoWidth;
  }
  const drawingUtils = new (
    await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3")
  ).DrawingUtils(canvasCtx);
  if (results && results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        gestureRecognizer.constructor.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 5,
        }
      );
      drawingUtils.drawLandmarks(canvasCtx, landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
    }
  }
  canvasCtx?.restore();
  if (results && results.gestures.length > 0) {
    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
    const handedness = results.handednesses[0][0].displayName;
    if (gestureOutput) {
      gestureOutput.style.display = "block";
      gestureOutput.style.width = videoWidth;
      gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
    }
  } else {
    if (gestureOutput) {
      gestureOutput.style.display = "none";
    }
  }
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
