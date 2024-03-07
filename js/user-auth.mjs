// import { createRoot } from 'react-dom/client';

let userProfile = document.getElementById('userProfile');
// Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
// `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.  
// `isConditionalMediationAvailable` means the feature detection is usable.  
if (window.PublicKeyCredential &&  
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&  
    PublicKeyCredential.isConditionalMediationAvailable) {  
  // Check if user verifying platform authenticator is available.
  console.log('isUserVerifyingPlatformAuthenticatorAvailable: ' + await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  console.log('isConditionalMediationAvailable: ' + await PublicKeyCredential.isConditionalMediationAvailable());
  Promise.all([  
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),  
    PublicKeyCredential.isConditionalMediationAvailable(),  
  ]).then(results => {  
    if (results.every(r => r === true)) {  
      // Display "Create a new passkey" button  
      let profile = document.getElementById('loginForm');
      profile.appendChild(createRoot('button', {
        id: 'createPasskey',
        class: 'btn btn-primary',
        text: 'Create a new passkey',
        onclick: 'createPasskey()'
    }));
    }  
  });
}  

document.addEventListener('DOMContentLoaded', () => {
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        console.log("user: " + user.name);
        userProfile.innerHTML = user.name;
    } else {
        userProfile.innerHTML = 'User';
    } 
});