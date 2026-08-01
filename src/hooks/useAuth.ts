import { useState, useEffect } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/src/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      let errorMsg = error.message || String(error);
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "This domain is not authorized for OAuth operations. Please add this app's URL to the Authorized Domains in the Firebase Console (Authentication -> Settings -> Authorized domains).";
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = "Login popup was blocked by your browser. Please allow popups for this site.";
      } else {
        errorMsg += "\n\nTip: If you are using Safari or a browser that blocks third-party cookies, login inside this preview frame might fail. Please click the 'Open in new tab' icon in the top right corner of the preview to log in.";
      }
      
      alert("Login failed: " + errorMsg);
    }
  };
  const logout = () => signOut(auth);

  return { user, loading, login, logout };
}