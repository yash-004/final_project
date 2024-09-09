// src/script.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
function loadMediapipeModules() {
    return __awaiter(this, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3")];
                case 1:
                    module = _a.sent();
                    return [2 /*return*/, {
                            GestureRecognizer: module.GestureRecognizer,
                            FilesetResolver: module.FilesetResolver,
                            DrawingUtils: module.DrawingUtils,
                        }];
            }
        });
    });
}
var gestureRecognizer; // GestureRecognizer instance
var runningMode = "VIDEO";
var webcamRunning = false;
var videoHeight = "360px";
var videoWidth = "480px";
var enableWebcamButton; // Declare enableWebcamButton here
var createGestureRecognizer = function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, GestureRecognizer, FilesetResolver, vision, demosSection;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, loadMediapipeModules()];
            case 1:
                _a = _b.sent(), GestureRecognizer = _a.GestureRecognizer, FilesetResolver = _a.FilesetResolver;
                return [4 /*yield*/, FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm")];
            case 2:
                vision = _b.sent();
                return [4 /*yield*/, GestureRecognizer.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: "../dist/trained2.task",
                            delegate: "GPU",
                        },
                        runningMode: runningMode,
                        numHands: 2,
                        custom_gestures_classifier_options: {
                            scoreThreshold: 0.66,
                        },
                    })];
            case 3:
                gestureRecognizer = _b.sent();
                demosSection = document.getElementById("demos");
                if (demosSection) {
                    demosSection.classList.remove("invisible");
                }
                return [2 /*return*/];
        }
    });
}); };
createGestureRecognizer();
function handleClick(event) {
    return __awaiter(this, void 0, void 0, function () {
        var allCanvas, i, n, results, p, categoryName, categoryScore, handedness, canvas, canvasCtx_1, drawingUtils, _i, _a, landmarks;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!gestureRecognizer) {
                        alert("Please wait for gestureRecognizer to load");
                        return [2 /*return*/];
                    }
                    if (!(runningMode === "VIDEO")) return [3 /*break*/, 2];
                    runningMode = "VIDEO";
                    return [4 /*yield*/, gestureRecognizer.setOptions({ runningMode: "VIDEO" })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    allCanvas = event.target.parentNode.getElementsByClassName("canvas");
                    for (i = allCanvas.length - 1; i >= 0; i--) {
                        n = allCanvas[i];
                        n.parentNode.removeChild(n);
                    }
                    results = gestureRecognizer.recognize(event.target);
                    // View results in the console to see their format
                    console.log(results);
                    if (!(results && results.gestures.length > 0)) return [3 /*break*/, 4];
                    p = event.target.parentNode.childNodes[3];
                    p.setAttribute("class", "info");
                    categoryName = results.gestures[0][0].categoryName;
                    categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
                    handedness = results.handednesses[0][0].displayName;
                    p.innerText = "GestureRecognizer: ".concat(categoryName, "\n Confidence: ").concat(categoryScore, "%\n Handedness: ").concat(handedness);
                    p.style.left = "0px";
                    p.style.top = "".concat(event.target.height, "px");
                    p.style.width = "".concat(event.target.width - 10, "px");
                    canvas = document.createElement("canvas");
                    canvas.setAttribute("class", "canvas");
                    canvas.setAttribute("width", event.target.naturalWidth + "px");
                    canvas.setAttribute("height", event.target.naturalHeight + "px");
                    canvas.style.left = "0px";
                    canvas.style.top = "0px";
                    canvas.style.width = "".concat(event.target.width, "px");
                    canvas.style.height = "".concat(event.target.height, "px");
                    event.target.parentNode.appendChild(canvas);
                    canvasCtx_1 = canvas.getContext("2d");
                    return [4 /*yield*/, import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3")];
                case 3:
                    drawingUtils = new (_b.sent()).DrawingUtils(canvasCtx_1);
                    for (_i = 0, _a = results.landmarks; _i < _a.length; _i++) {
                        landmarks = _a[_i];
                        drawingUtils.drawConnectors(landmarks, gestureRecognizer.constructor.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5,
                        });
                        drawingUtils.drawLandmarks(landmarks, {
                            color: "#FF0000",
                            lineWidth: 1,
                        });
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
var video = document.getElementById("webcam");
var canvasElement = document.getElementById("output_canvas");
var canvasCtx = canvasElement === null || canvasElement === void 0 ? void 0 : canvasElement.getContext("2d");
var gestureOutput = document.getElementById("gesture_output");
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    var constraints = {
        video: true,
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
var lastVideoTime = -1;
var results = undefined;
function predictWebcam() {
    return __awaiter(this, void 0, void 0, function () {
        var nowInMs, drawingUtils, _i, _a, landmarks, categoryName, categoryScore, handedness;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(runningMode !== "VIDEO")) return [3 /*break*/, 2];
                    runningMode = "VIDEO";
                    return [4 /*yield*/, gestureRecognizer.setOptions({ runningMode: "VIDEO" })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    nowInMs = Date.now();
                    if (!(video.currentTime !== lastVideoTime)) return [3 /*break*/, 5];
                    lastVideoTime = video.currentTime;
                    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
                    if (!(canvasElement && canvasCtx)) return [3 /*break*/, 5];
                    // Ensure canvas matches the video dimensions
                    canvasElement.width = video.videoWidth;
                    canvasElement.height = video.videoHeight;
                    // Clear the canvas for the next frame
                    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    if (!(results && results.landmarks)) return [3 /*break*/, 4];
                    return [4 /*yield*/, import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3")];
                case 3:
                    drawingUtils = new (_b.sent()).DrawingUtils(canvasCtx);
                    for (_i = 0, _a = results.landmarks; _i < _a.length; _i++) {
                        landmarks = _a[_i];
                        drawingUtils.drawConnectors(landmarks, gestureRecognizer.constructor.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5,
                        });
                        drawingUtils.drawLandmarks(landmarks, {
                            color: "#FF0000",
                            lineWidth: 2,
                        });
                    }
                    _b.label = 4;
                case 4:
                    // Draw text information if gestures are recognized
                    if (results && results.gestures.length > 0) {
                        categoryName = results.gestures[0][0].categoryName;
                        categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
                        handedness = results.handednesses[0][0].displayName;
                        if (gestureOutput) {
                            gestureOutput.style.display = "block";
                            gestureOutput.style.width = videoWidth;
                            gestureOutput.innerText = "GestureRecognizer: ".concat(categoryName, "\n Confidence: ").concat(categoryScore, " %\n Handedness: ").concat(handedness);
                        }
                    }
                    else {
                        if (gestureOutput) {
                            gestureOutput.style.display = "none";
                        }
                    }
                    _b.label = 5;
                case 5:
                    // Continue predicting if the webcam is running
                    if (webcamRunning) {
                        window.requestAnimationFrame(predictWebcam);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
