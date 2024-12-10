/* import './style.css';

import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  // your config
  apiKey: "AIzaSyDK0OZbGROxwjCcQ69PwxZmWYuUJadiXoQ",
  authDomain: "skills-ecec4.firebaseapp.com",
  projectId: "skills-ecec4",
  storageBucket: "skills-ecec4.firebasestorage.app",
  messagingSenderId: "676986571580",
  appId: "1:676986571580:web:5909dfbe306de8b8786c39",
  measurementId: "G-YWZG68BN4V"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// 1. Setup media sources

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  initiateCallButton.disabled = false;
  waitForCallButton.disabled = false;
  webcamButton.disabled = true;
};

// 2. Create an offer
callButton.onclick = async () => {
  // Reference Firestore collections for signaling
  const callDoc = firestore.collection('calls').doc();
  const offerCandidates = callDoc.collection('offerCandidates');
  const answerCandidates = callDoc.collection('answerCandidates');

  callInput.value = callDoc.id;

  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await callDoc.set({ offer });

  const token = callDoc.id;
  const receiverId = "receiver_user_id"

  await fetch("http://localhost:8000/send-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, receiver_id: receiverId }),
  });

  // Listen for remote answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  // When answered, add candidate to peer connection
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  hangupButton.disabled = false;
};

// 3. Answer the call with the unique ID
 answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
}; 

answerButton.onclick = async () => {
  const receiverId = "receiver_user_id"; // Replace with the actual receiver ID

  // Fetch the token (long polling)
  const response = await fetch(`http://localhost:8000/get-token/${receiverId}`);
  const data = await response.json();

  if (data.call_token) {
    const callId = data.call_token;
    const callDoc = firestore.collection('calls').doc(callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      });
    });
  } else {
    console.error("No token received");
  }
};

 */

import './style.css';
import firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize Firebase (Replace with your config)
const firebaseConfig = { 
  apiKey: "AIzaSyDK0OZbGROxwjCcQ69PwxZmWYuUJadiXoQ",
  authDomain: "skills-ecec4.firebaseapp.com",
  projectId: "skills-ecec4",
  storageBucket: "skills-ecec4.firebasestorage.app",
  messagingSenderId: "676986571580",
  appId: "1:676986571580:web:5909dfbe306de8b8786c39",
  measurementId: "G-YWZG68BN4V"
 };
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

const servers = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302'] }] };
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML Elements
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
const receiverIdInput = document.getElementById('receiverIdInput');
const initiateCallButton = document.getElementById('initiateCallButton');
const waitForCallButton = document.getElementById('waitForCallButton');
const hangupButton = document.getElementById('hangupButton');

// Setup media streams
async function setupMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  pc.ontrack = event => event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;
}

async function sendOffer(token, offer) {
  const callDoc = firestore.collection('calls').doc(token);
  await callDoc.set({ offer: offer.toJSON() });
}

// Start WebRTC connection
async function startConnection(isCaller, token) {
  pc.onicecandidate = event => {
    if (event.candidate) sendCandidate(token, event.candidate.toJSON());
  };

  if (isCaller) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendOffer(token, pc.localDescription);
  } else {
    listenForOffer(token);
  }

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'disconnected') hangup();
  };
}

// Hangup
function hangup() {
  pc.close();
  pc.onicecandidate = null;
  pc.ontrack = null;
  hangupButton.disabled = true;
  // Notify backend to cleanup (optional)
}

// Initiate a call
initiateCallButton.onclick = async () => {
  const receiverId = receiverIdInput.value;
  if (!receiverId) return alert('Please enter a receiver ID.');

  const callDoc = firestore.collection('calls').doc();
  const token = callDoc.id;

  // Notify receiver via backend
  await fetch('http://localhost:8000/send-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, receiver_id: receiverId }),
  });

  setupMedia();
  startConnection(true, token);
  hangupButton.disabled = false;
};

// Wait for a call
waitForCallButton.onclick = async () => {
  setupMedia();

  const receiverId = prompt('Enter your User ID to wait for calls:');
  if (!receiverId) return;

  const token = await fetch(`http://localhost:8000/get-token/${receiverId}`).then(res => res.json());
  if (token.call_token) {
    startConnection(false, token.call_token);
    hangupButton.disabled = false;
  } else {
    alert('No incoming calls.');
  }
};
