import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';

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

  const onGoogleSuccess = (res) => {
    setProfile(res.profileObj);
    console.log('Google login success:', res);
  };

  const onGoogleFailure = (res) => {
    console.log('Google login failed:', res);
  };

  const GooglelogOut = () => {
    setProfile(null);
    console.log('Google logout success');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LOGIN</h1>
        <div className="login-buttons">
          <div className="login-button">
            <GoogleLogin
              clientId={clientId}
              buttonText="Sign in with Google"
              onSuccess={onGoogleSuccess}
              onFailure={onGoogleFailure}
              cookiePolicy={'single_host_origin'}
              isSignedIn={true}
              className="custom-login-button"
            />
          </div>
        </div>

        {profile && (
          <div>
            <h2>Welcome, {profile.name}</h2>
            <img src={profile.imageUrl} alt="profile" />
            <p>Email: {profile.email}</p>
            <GoogleLogout
              clientId={clientId}
              buttonText="Logout from Google"
              onLogoutSuccess={GooglelogOut}
            />
          </div>
        )}
      </header>
    </div>
  );
}

export default Login;


// import React, { useState, useEffect } from 'react';
// import { GoogleLogin, GoogleLogout } from 'react-google-login';
// import { gapi } from 'gapi-script';

// function Login() {
//   const clientId = "958902418959-llvaof6d4td6cicvdd27fltshv63rudo.apps.googleusercontent.com";

//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     const initClient = () => {
//       gapi.client.init({
//         clientId: clientId,
//         scope: ''
//       }).then(() => {
//         console.log("GAPI client initialized");
//       }).catch((error) => {
//         console.error("Error initializing GAPI client", error);
//       });
//     };
//     gapi.load("client:auth2", initClient);
//   }, []);

//   const onGoogleSuccess = (res) => {
//     setProfile(res.profileObj);
//     console.log('Google login success:', res);
//   };

//   const onGoogleFailure = (res) => {
//     console.log('Google login failed:', res);
//   };

//   const GooglelogOut = () => {
//     setProfile(null);
//     console.log('Google logout success');
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>LOGIN</h1>
//         <div className="login-buttons">
//           <div className="login-button">
//             <GoogleLogin
//               clientId={clientId}
//               buttonText="Sign in with Google"
//               onSuccess={onGoogleSuccess}
//               onFailure={onGoogleFailure}
//               cookiePolicy={'single_host_origin'}
//               isSignedIn={true}
//               className="custom-login-button"
//             />
//           </div>
//         </div>

//         {profile && (
//           <div>
//             <h2>Welcome, {profile.name}</h2>
//             <img src={profile.imageUrl} alt="profile" />
//             <p>Email: {profile.email}</p>
//             <GoogleLogout
//               clientId={clientId}
//               buttonText="Logout from Google"
//               onLogoutSuccess={GooglelogOut}
//             />
//           </div>
//         )}
//       </header>
//     </div>
//   );
// }

// export default Login;
