import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV8jBfEvhJAZrllxTTOwH-yhKWzYvuURw",
  authDomain: "marzine-f4650.firebaseapp.com",
  projectId: "marzine-f4650",
  storageBucket: "marzine-f4650.appspot.com",
  messagingSenderId: "992537976734",
  appId: "1:992537976734:web:1833b41017ae0ab2a1408f",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export { firebaseApp, auth, firestore };
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB3_AdBXw7NS1jIGd1UpIDASIuF_7XcJxQ",
//   authDomain: "marzine-prova.firebaseapp.com",
//   projectId: "marzine-prova",
//   storageBucket: "marzine-prova.firebasestorage.app",
//   messagingSenderId: "661925909692",
//   appId: "1:661925909692:web:d1588db23f7a1e52a96cb9",
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const auth = getAuth(firebaseApp);
// const firestore = getFirestore(firebaseApp);
// export { firebaseApp, auth, firestore };
