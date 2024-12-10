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
  console.log('media setup complete')
}

// Send ICE Candidate
async function sendCandidate(token, candidate) {
  const candidatesCollection = firestore.collection('calls').doc(token).collection('candidates');
  await candidatesCollection.add(candidate);
}

// Listen for ICE Candidates
async function listenForCandidates(token) {
  const candidatesCollection = firestore.collection('calls').doc(token).collection('candidates');

  candidatesCollection.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        if (pc.remoteDescription) {
          pc.addIceCandidate(candidate).catch(console.error);
        } else {
          console.log('Remote description not set yet. Queueing candidate.');
          pc.addEventListener('signalingstatechange', function onSignalingStateChange() {
            if (pc.remoteDescription) {
              pc.addIceCandidate(candidate).catch(console.error);
              pc.removeEventListener('signalingstatechange', onSignalingStateChange);
            }
          });
        }
      }
    });
  });
}

async function sendOffer(token, offer) {
  const callDoc = firestore.collection('calls').doc(token);
  await callDoc.set({ offer: offer.toJSON() });
}

// Listen for Offer
async function listenForOffer(token) {
  const callDoc = firestore.collection('calls').doc(token);
  const offerSnapshot = await callDoc.get();
  if (offerSnapshot.exists) {
    const offer = new RTCSessionDescription(offerSnapshot.data().offer);
    console.log('Setting remote description for offer.');
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await callDoc.update({ answer: pc.localDescription.toJSON() });

    console.log('Answer sent.');
  } else {
    console.error('Offer not found for token:', token);
  }
}

// Listen for Answer
async function listenForAnswer(token) {
  const callDoc = firestore.collection('calls').doc(token);
  callDoc.onSnapshot(snapshot => {
    const data = snapshot.data();
    if (data?.answer) {
      const answer = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answer);
    }
  });
}

// Start WebRTC connection
async function startConnection(isCaller, token) {
  pc.onicecandidate = event => {
    if (event.candidate) sendCandidate(token, event.candidate.toJSON());
  };

  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState);
    if (pc.connectionState === 'disconnected') hangup();
  };

  pc.onicecandidateerror = event => {
    console.error('ICE Candidate error:', event);
  };

  listenForCandidates(token);

  if (isCaller) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendOffer(token, pc.localDescription);
    listenForAnswer(token);
  } else {
    listenForOffer(token);
  }
}

// Hangup
function hangup() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
  }
  pc.close();
  pc.onicecandidate = null;
  pc.ontrack = null;
  pc.onconnectionstatechange = null;
  pc.onicecandidateerror = null;
  hangupButton.disabled = true;
  console.log('Call ended.');
}

hangupButton.onclick = () => {
  hangup()
};

// Initiate a call
initiateCallButton.onclick = async () => {
  const receiverId = receiverIdInput.value;
  if (!receiverId) return alert('Please enter a receiver ID.');

  const callDoc = firestore.collection('calls').doc();
  const token = callDoc.id;

  // Notify receiver via backend
  await fetch('https://kangaroo-witty-glowworm.ngrok-free.app/send-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
     },
    body: JSON.stringify({ token, receiver_id: receiverId }),
  });

  await setupMedia();
  await startConnection(true, token);
  hangupButton.disabled = false;
};

// Wait for a call
waitForCallButton.onclick = async () => {
  await setupMedia();

  const receiverId = prompt('Enter your User ID to wait for calls:');
  if (!receiverId) return;

  try {
    const response = await fetch(`https://kangaroo-witty-glowworm.ngrok-free.app/get-token/${receiverId}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': '69420',
      }
  });
    const data = await response.json(); // This might fail if the response isn't JSON
    if (data.call_token) {
      await startConnection(false, data.call_token);
      hangupButton.disabled = false;
    } else {
      alert(data.error || 'No incoming calls.');
    }
  } catch (error) {
    console.error('Failed to fetch token:', error);
    alert('Failed to fetch token. Check console for details.');
  }
};
