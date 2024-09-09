import json
import os
import subprocess

import cv2
import mediapipe as mp


class WLASLProcessor:
    def __init__(self, json_path, video_folder, dataset_folder):
        self.json_path = json_path
        self.video_folder = video_folder
        self.dataset_folder = dataset_folder
        self.data = self.load_json()
        self.mp_hands = mp.solutions.hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.45,
            min_tracking_confidence=0.45,
        )

    def load_json(self):
        try:
            with open(self.json_path, "r") as file:
                data = json.load(file)
            return data
        except Exception as e:
            print(f"Error loading JSON file: {e}")
            raise

    def get_video_info(self):
        videos = []
        try:
            for item in self.data:
                if "gloss" in item and "instances" in item:
                    gloss = item["gloss"]
                    for instance in item["instances"]:
                        if all(
                            k in instance
                            for k in ("url", "bbox", "fps", "frame_start", "video_id")
                        ):
                            video_info = {
                                "gloss": gloss,
                                "url": instance["url"],
                                "bbox": instance["bbox"],
                                "fps": instance["fps"],
                                "frame_start": instance["frame_start"],
                                "frame_end": instance.get("frame_end", None),
                                "video_id": instance["video_id"],
                            }
                            videos.append(video_info)
        except KeyError as e:
            print(f"Missing expected key in JSON data: {e}")
        except Exception as e:
            print(f"Error parsing JSON data: {e}")
            raise
        return videos

    def process_frames(self, frames_folder, video_id, gloss, bbox):
        frame_files = sorted(os.listdir(frames_folder))
        gloss_dir = os.path.join(self.dataset_folder, gloss)
        os.makedirs(gloss_dir, exist_ok=True)

        x_min, y_min, width, height = bbox

        for frame_file in frame_files:
            frame_path = os.path.join(frames_folder, frame_file)
            image = cv2.imread(frame_path)
            if image is None:
                print(f"Could not read frame: {frame_path}")
                continue

            # Crop the image using the bounding box
            x_max = x_min + width
            y_max = y_min + height

            # Ensure cropping coordinates are within image boundaries
            h, w, _ = image.shape
            x_max = min(x_max, w)
            y_max = min(y_max, h)
            cropped_image = image[y_min:y_max, x_min:x_max]

            if cropped_image is None or cropped_image.size == 0:
                print(f"Invalid cropped image for frame: {frame_path}")
                continue

            try:
                # Process the cropped image with MediaPipe to detect hand keypoints
                results = self.mp_hands.process(
                    cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB)
                )
            except cv2.error as e:
                print(f"OpenCV error processing frame {frame_file}: {e}")
                continue

            if results.multi_hand_landmarks:
                # Extract the frame number from the file name
                frame_number = int(frame_file.split("_")[-1].split(".")[0])

                # Construct the new file name
                new_filename = f"{video_id}_{frame_number:05d}.jpg"
                new_filepath = os.path.join(gloss_dir, new_filename)

                # Save the cropped image without drawing keypoints
                cv2.imwrite(new_filepath, cropped_image)
                print(f"Saved frame: {new_filepath}")

    def extract_and_save_frames(self):
        for video_info in self.get_video_info():
            video_id = video_info["video_id"]
            gloss = video_info["gloss"]
            bbox = video_info["bbox"]
            frame_start = video_info["frame_start"]
            frame_end = (
                video_info["frame_end"] if video_info["frame_end"] is not None else -1
            )
            gloss_dir = os.path.join(self.dataset_folder, gloss)

            video_path = os.path.join(self.video_folder, f"{video_id}.mp4")

            if not os.path.exists(video_path):
                print(f"Video file does not exist: {video_path}")
                continue

            frames_temp_dir = os.path.join(gloss_dir, "temp_frames")
            if self.extract_frames_with_ffmpeg(
                video_path, frames_temp_dir, video_id, frame_start, frame_end
            ):
                self.process_frames(frames_temp_dir, video_id, gloss, bbox)
                # Clean up the temporary frames directory
                for file in os.listdir(frames_temp_dir):
                    file_path = os.path.join(frames_temp_dir, file)
                    os.remove(file_path)
                os.rmdir(frames_temp_dir)

    def extract_frames_with_ffmpeg(
        self, video_path, frames_folder, video_id, frame_start, frame_end
    ):
        """Extract frames from a video using FFmpeg."""
        if not os.path.exists(video_path):
            print(f"Video file does not exist: {video_path}")
            return False

        os.makedirs(frames_folder, exist_ok=True)

        if frame_end is None or frame_end == -1:
            frame_end = "n"

        # Define frame output pattern with video ID
        frame_output_pattern = os.path.join(frames_folder, f"{video_id}_%05d.jpg")

        command = [
            "ffmpeg",
            "-i",
            video_path,
            "-vf",
            f"select='between(n,{frame_start},{frame_end})'",
            "-vsync",
            "vfr",
            frame_output_pattern,
        ]

        print(f"Running FFmpeg command: {' '.join(command)}")

        try:
            subprocess.run(
                command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            print(f"Frames extracted to {frames_folder}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Failed to extract frames: {e}")
            return False


if __name__ == "__main__":
    json_path = "WLASL_v0.3.json"
    video_folder = "videos"
    dataset_folder = "dataset"

    processor = WLASLProcessor(json_path, video_folder, dataset_folder)
    processor.extract_and_save_frames()
