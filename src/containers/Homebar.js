import { connect } from "react-redux";
import Homebar from "../components/Homebar";
import { signOut } from "../actions/auth";
import { createGame, showNewGameForm } from "../actions/games";

const mapStateToProps = ({ auth }) => {
  const { displayName, photoURL, uid, username } = auth;
  return { displayName, photoURL, uid, username };
};

const mapDispatchToProps = dispatch => {
  return {
    signOut() {
      dispatch(signOut());
    },
    createGame() {
      dispatch(createGame());
    },
    showNewGameForm() {
      dispatch(showNewGameForm());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Homebar);
