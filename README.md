#Overview

This project implements a WebRTC-based video call system with recording functionality. It combines:
- Local and Remote Audio Streams
- Remote Video Stream
The recording feature captures the mixed audio streams (from both participants) and the remote video stream into a single downloadable .webm file.

#Features

- WebRTC Call Setup: Establish video calls between two users using WebRTC.
- Media Stream Mixing: Combines local and remote audio streams for a unified recording.
- Selective Stream Recording: Records only the remote video along with mixed audio.
- Downloadable Recordings: Creates a webm file of the call for download.

#Installation

- Clone this repository to a local repository
- Navigate to `webrtc-firebase-demo` using cd
- Run `npm i` to install dependencies
- Create a firebase project, head over to project settings, add a new webapp, and copy the `firebaseConfig` details which includes the api key and project id
- Insert those details in `main.js`

#Usage

- Run `npm run dev` to start the vite server at `localhost:3000`
- Make sure you are connected to the internet
