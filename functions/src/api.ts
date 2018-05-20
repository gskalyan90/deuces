const express = require("express");
const cors = require("cors");
import admin from "./admin";

const app = express();

app.use(cors());
app.post("/init_user", async (req, res) => {
  const { idToken, username } = req.body;
  const usernameKey = username.replace(/\s/g, "").toLowerCase();
  const token = await admin.auth().verifyIdToken(idToken);
  const uid = token.uid;

  const userRef = admin.database().ref(`/users/${usernameKey}`);
  const userNodeSnapshot = await userRef.once("value");

  if (userNodeSnapshot.val()) {
    return res.status(420).send("username already exists");
  }
  if (!usernameKey.match(/^[a-z0-9]{4,20}$/)) {
    return res.status(430).send("your username sucks");
  }

  const _userRef = admin.database().ref(`/_users/${uid}`);
  const _userNodeSnapshot = await _userRef.once("value");
  const { email, displayName, photoURL, points } = _userNodeSnapshot.val();

  const p1 = _userRef.child("username").set(username);
  const p2 = userRef.child("public").set({ photoURL, username });
  const p3 = userRef.child(uid).set({ uid, usernameKey });

  Promise.all([p1, p2, p3])
    .then(() => {
      res.json({
        email,
        displayName,
        photoURL,
        uid,
        username,
        points
      });
    })
    .catch(e => {
      res.status(400).send("something went wrong");
    });
});

app.post("/change_photo_url", async (req, res) => {
  const { idToken, username, downloadURL } = req.body;
  const usernameKey = username.replace(/\s/g, "").toLowerCase();
  const token = await admin.auth().verifyIdToken(idToken);
  const uid = token.uid;
  admin
    .database()
    .ref(`/_users/${uid}`)
    .child("photoURL")
    .set(downloadURL)
    .then(() => {
      res.json({ status: 200, desc: "A okay!", downloadURL });
    })
    .catch(e => console.error(e));
});

app.post("/create_game", async (req, res) => {
  const { idToken, username, gameName, inviteOnly } = req.body;
  const usernameKey = username.replace(/\s/g, "").toLowerCase();
  const token = await admin.auth().verifyIdToken(idToken);
  const uid = token.uid;
  const _gamesRef = admin.database().ref(`_games`);
  const userRef = admin.database().ref(`/users/${usernameKey}`);
  const userGamesRef = userRef.child(uid).child("games");
  const game = {
    gameName,
    players: {
      [uid]: {
        username
      }
    },
    inviteOnly,
    gameStatus: "NEW_GAME",
    gameKey: ""
  };
  const gameRef = await _gamesRef.push(game);
  const gameKey = gameRef.path.pieces_[1];
  const p1 = _gamesRef.child(gameKey).child('gameKey').set(gameKey);
  game.gameKey = gameKey;
  const p2 = userGamesRef.child(gameKey).set(game);
  Promise.all([p1, p2])
    .then(e => {
      console.log(e);
      res.json(game);
    })
    .catch(e => {
      console.error(e);
      res.status(500).json({ error: "error happened" });
    });
});

export default app;
