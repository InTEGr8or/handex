let userProfile = document.getElementById('profileId');

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // profileId.innerHTML = user.username;
    } else {
        // profileId.innerHTML = 'User';
    } 
});