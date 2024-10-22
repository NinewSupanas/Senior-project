import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import axios from 'axios'; // Axios for HTTP requests

function Login() {
  const clientId = "958902418959-llvaof6d4td6cicvdd27fltshv63rudo.apps.googleusercontent.com";
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      }).then(() => {
        console.log("GAPI client initialized");
      }).catch((error) => {
        console.error("Error initializing GAPI client", error);
      });
    };
    gapi.load("client:auth2", initClient);
  }, [clientId]);

  const onGoogleSuccess = async (res) => {
    const { profileObj, tokenId } = res;

    try {
        // Send profile and token to the backend
        const response = await axios.post('http://localhost:8000/login', {
            id: profileObj.googleId,
            email: profileObj.email,
            name: profileObj.name,
            token: tokenId
        });

        // Set profile and log role
        setProfile({ ...profileObj, role: response.data.role });
        console.log('Role from backend:', response.data.role);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Error during backend authentication:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
    }
};

  const onGoogleFailure = (res) => {
    console.log('Google login failed:', res);
  };

  const handleLogout = () => {
    setProfile(null);
    console.log('Google logout success');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LOGIN</h1>
        <div className="login-buttons">
          {!profile ? (
            <GoogleLogin
              clientId={clientId}
              buttonText="Sign in with Google"
              onSuccess={onGoogleSuccess}
              onFailure={onGoogleFailure}
              cookiePolicy={'single_host_origin'}
              isSignedIn={true}
            />
          ) : (
            <div>
              <h2>Welcome, {profile.name}</h2>
              <p>Email: {profile.email}</p>
              <p>Role: {profile.role}</p>
              <GoogleLogout
                clientId={clientId}
                buttonText="Logout from Google"
                onLogoutSuccess={handleLogout}
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Login;
