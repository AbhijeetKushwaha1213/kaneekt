
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

async function login(email, password) {
  try {
    console.log("Attempting to log in with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User logged in:", user);
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      console.log("User does not exist in Firestore");
      return { userExists: false };
    }

    console.log("User exists in Firestore:", userDoc.data());
    return { userExists: true, userData: userDoc.data() };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

async function createAccount(email, password, profileData) {
  try {
    console.log("Attempting to create account with email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Account created for user:", user);

    // Store user profile data in Firestore
    await setDoc(doc(db, "users", user.uid), profileData);
    console.log("User profile data stored in Firestore:", profileData);

    return { userCreated: true, userData: profileData };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

export { login, createAccount };
