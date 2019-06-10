import React from "react";

function Login(props) {
  function onSubmit(e) {
    e.preventDefault();
    props.updateAuthed(true);
  }

  return (
    <div className="login-page">
      <h1>Welcome to chat!</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          onChange={e => props.updateName(e.target.value)}
          placeholder="Username..."
          value={props.name}
        />
        <input type="submit" value="Sign In" />
      </form>
    </div>
  );
}

export default Login;
