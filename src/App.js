import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
// import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBD8851btTft8iHMaDYXmLRKYhoUEBOzXA",
  authDomain: "ushipfriend.firebaseapp.com",
  databaseURL: "https://ushipfriend.firebaseio.com",
  projectId: "ushipfriend",
  storageBucket: "ushipfriend.appspot.com",
  messagingSenderId: "982688180304",
  appId: "1:982688180304:web:c6b63a7074c3a832be4955"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="app-name-font">sabChat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <div>
        <div>
          <button className="loginBtn loginBtn--google" onClick={signInWithGoogle}>
            Sign in using Google
					</button>
          <button className="loginBtn loginBtn--facebook">
            Sign in using facebook
					</button>
        </div>
        <p>Do not violate the community guidelines or you will be banned for life!</p>
      </div>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="logoutBtn" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input className="placeholder-view" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button className="sendBtn" type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;