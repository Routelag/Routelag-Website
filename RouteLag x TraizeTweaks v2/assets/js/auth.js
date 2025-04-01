// Firebase Configuration
const firebaseConfig = {
    // Your Firebase config here
    // Replace these values with your actual Firebase project configuration
    apiKey: "AIzaSyCQFuLBsk9ZNIUvDCIU3HQDriEGltA95s4",
    authDomain: "routelag-8e256.firebaseapp.com",
    projectId: "routelag-8e256",
    storageBucket: "routelag-8e256.firebasestorage.app",
    messagingSenderId: "796661905884",
    appId: "1:796661905884:web:ccf3086606c483a6713719"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Setup Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Google Sign In Function
function signInWithGoogle() {
    firebase.auth().signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create new user document in Firestore for first-time Google sign-ins
                return db.collection('users').doc(user.uid).set({
                    username: user.displayName || 'User',
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    plan: 'free',
                    emailVerified: true, // Google accounts are pre-verified
                    stats: {
                        totalOptimizations: 0,
                        pingReduction: '0%',
                        fpsBoost: '0%',
                        lastOptimized: null
                    },
                    devices: [],
                    games: []
                });
            } else {
                // Update last login for existing users
                return db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .then(() => {
            // Redirect to dashboard after successful sign-in
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.error("Google sign in error:", error);
            
            // Show error message
            const errorElementId = window.location.pathname.includes('signin.html') ? 
                'signinError' : 'signupError';
            
            const errorElement = document.getElementById(errorElementId);
            if (errorElement) {
                if (error.code === 'auth/popup-closed-by-user') {
                    errorElement.textContent = 'Sign-in was cancelled';
                } else if (error.code === 'auth/popup-blocked') {
                    errorElement.textContent = 'Pop-up was blocked by the browser. Please allow pop-ups for this site.';
                } else {
                    errorElement.textContent = 'Error: ' + error.message;
                }
                errorElement.style.display = 'block';
            }
        });
}

// Check for verification links from email
function handleEmailVerification() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    // If we have mode and oobCode, and mode is verifyEmail, apply the verification
    if (mode && oobCode && mode === 'verifyEmail') {
        // Apply the verification code
        firebase.auth().applyActionCode(oobCode)
            .then(() => {
                console.log("Email verification successful");
                // If we're on the verify-email page, show success message
                const verificationSuccess = document.getElementById('verificationSuccess');
                const verificationError = document.getElementById('verificationError');
                
                if (verificationSuccess && verificationError) {
                    verificationSuccess.textContent = "Your email has been verified successfully! You'll be redirected to the dashboard.";
                    verificationSuccess.style.display = 'block';
                    verificationError.style.display = 'none';
                    
                    // Update current user emailVerified status
                    const user = firebase.auth().currentUser;
                    if (user) {
                        // Reload user to get updated emailVerified status
                        user.reload().then(() => {
                            // Update Firestore database to reflect email verification
                            db.collection('users').doc(user.uid).update({
                                emailVerified: true
                            }).then(() => {
                                // Redirect to dashboard after 2 seconds
                                setTimeout(() => {
                                    window.location.href = 'dashboard.html';
                                }, 2000);
                            });
                        });
                    } else {
                        // Not signed in, redirect to sign in page
                        setTimeout(() => {
                            window.location.href = 'signin.html';
                        }, 2000);
                    }
                } else {
                    // Not on verification page, redirect to dashboard
                    window.location.href = 'dashboard.html';
                }
            })
            .catch((error) => {
                console.error("Email verification error:", error);
                
                // Show error message on verify-email page if present
                const verificationError = document.getElementById('verificationError');
                if (verificationError) {
                    if (error.code === 'auth/expired-action-code') {
                        verificationError.textContent = 'The verification link has expired. Please request a new one.';
                    } else if (error.code === 'auth/invalid-action-code') {
                        verificationError.textContent = 'The verification link is invalid. Please request a new one.';
                    } else {
                        verificationError.textContent = 'Error: ' + error.message;
                    }
                    verificationError.style.display = 'block';
                    
                    const verificationSuccess = document.getElementById('verificationSuccess');
                    if (verificationSuccess) {
                        verificationSuccess.style.display = 'none';
                    }
                }
            });
    }
}

// Run email verification handler on page load
handleEmailVerification();

// Helper functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
}

function hideLoading(buttonId, text) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
        button.innerHTML = text;
    }
}

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    // Check if we're on signin.html or signup.html
    const onAuthPage = window.location.pathname.includes('signin.html') || 
                       window.location.pathname.includes('signup.html');
    
    // Check if we're on email verification page
    const onVerificationPage = window.location.pathname.includes('verify-email.html');
    
    // Check if we're on the dashboard page
    const onDashboardPage = window.location.pathname.includes('dashboard.html');
    
    if (user) {
        // User is signed in
        if (onAuthPage) {
            // Redirect based on email verification status
            if (!user.emailVerified) {
                window.location.href = 'verify-email.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else if (onDashboardPage) {
            // Check if email is verified before loading dashboard
            if (!user.emailVerified) {
                window.location.href = 'verify-email.html';
            } else {
                // Load user data for dashboard
                loadUserDashboard(user);
            }
        } else if (onVerificationPage) {
            // If already verified, redirect to dashboard
            if (user.emailVerified) {
                window.location.href = 'dashboard.html';
            } else {
                // Update UI to show current email
                const emailElement = document.getElementById('userEmail');
                if (emailElement) {
                    emailElement.textContent = user.email;
                }
            }
        }
    } else {
        // No user is signed in
        if (onDashboardPage || onVerificationPage) {
            // Redirect to signin if trying to access dashboard or verification page without auth
            window.location.href = 'signin.html';
        }
    }
});

// SIGN UP FUNCTIONALITY
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const username = document.getElementById('username').value;
        
        // Hide previous errors
        hideError('emailError');
        hideError('passwordError');
        hideError('confirmPasswordError');
        hideError('usernameError');
        
        // Validation
        let isValid = true;
        
        if (!email || !email.includes('@')) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!username || username.length < 3) {
            showError('usernameError', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        if (isValid) {
            // Show loading
            showLoading('signupButton');
            
            // Create user
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Add user to Firestore
                    return db.collection('users').doc(userCredential.user.uid).set({
                        username: username,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        plan: 'free',
                        emailVerified: false,
                        stats: {
                            totalOptimizations: 0,
                            pingReduction: '0%',
                            fpsBoost: '0%',
                            lastOptimized: null
                        },
                        devices: [],
                        games: []
                    });
                })
                .then(() => {
                    // Update profile display name
                    return auth.currentUser.updateProfile({
                        displayName: username
                    });
                })
                .then(() => {
                    // Send email verification
                    return auth.currentUser.sendEmailVerification({
                        url: window.location.origin + '/verify-email.html',
                        handleCodeInApp: true
                    });
                })
                .then(() => {
                    // Redirect to verification page
                    window.location.href = 'verify-email.html';
                })
                .catch((error) => {
                    console.error("Signup error:", error);
                    
                    if (error.code === 'auth/email-already-in-use') {
                        showError('emailError', 'Email already in use');
                    } else {
                        showError('signupError', 'Error: ' + error.message);
                    }
                    
                    hideLoading('signupButton', 'SIGN UP');
                });
        }
    });
}

// SIGN IN FUNCTIONALITY
const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        // Hide previous errors
        hideError('signinEmailError');
        hideError('signinPasswordError');
        hideError('signinError');
        
        // Validation
        let isValid = true;
        
        if (!email || !email.includes('@')) {
            showError('signinEmailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            showError('signinPasswordError', 'Please enter your password');
            isValid = false;
        }
        
        if (isValid) {
            // Show loading
            showLoading('signinButton');
            
            // Sign in
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Check if email is verified
                    if (!userCredential.user.emailVerified) {
                        // Redirect to verification page
                        window.location.href = 'verify-email.html';
                    } else {
                        // Update last login
                        return db.collection('users').doc(userCredential.user.uid).update({
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            // Redirect to dashboard
                            window.location.href = 'dashboard.html';
                        });
                    }
                })
                .catch((error) => {
                    console.error("Signin error:", error);
                    
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        showError('signinError', 'Invalid email or password');
                    } else {
                        showError('signinError', 'Error: ' + error.message);
                    }
                    
                    hideLoading('signinButton', 'SIGN IN');
                });
        }
    });
}

// EMAIL VERIFICATION FUNCTIONALITY
const resendVerificationBtn = document.getElementById('resendVerificationBtn');
if (resendVerificationBtn) {
    resendVerificationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (user) {
            showLoading('resendVerificationBtn');
            
            user.sendEmailVerification({
                url: window.location.origin + '/verify-email.html',
                handleCodeInApp: true
            }).then(() => {
                // Show success message
                document.getElementById('verificationSuccess').style.display = 'block';
                document.getElementById('verificationError').style.display = 'none';
                
                hideLoading('resendVerificationBtn', 'RESEND VERIFICATION EMAIL');
                
                // Disable button for 60 seconds
                resendVerificationBtn.disabled = true;
                let timeLeft = 60;
                const countdownInterval = setInterval(() => {
                    resendVerificationBtn.innerHTML = `WAIT ${timeLeft} SECONDS`;
                    timeLeft--;
                    
                    if (timeLeft < 0) {
                        clearInterval(countdownInterval);
                        resendVerificationBtn.disabled = false;
                        resendVerificationBtn.innerHTML = 'RESEND VERIFICATION EMAIL';
                    }
                }, 1000);
            }).catch((error) => {
                console.error("Email verification error:", error);
                document.getElementById('verificationError').textContent = error.message;
                document.getElementById('verificationError').style.display = 'block';
                document.getElementById('verificationSuccess').style.display = 'none';
                
                hideLoading('resendVerificationBtn', 'RESEND VERIFICATION EMAIL');
            });
        }
    });
}

const checkVerificationBtn = document.getElementById('checkVerificationBtn');
if (checkVerificationBtn) {
    checkVerificationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        showLoading('checkVerificationBtn');
        
        // Reload the user to check for verification
        auth.currentUser.reload().then(() => {
            if (auth.currentUser.emailVerified) {
                // Update Firestore user document
                db.collection('users').doc(auth.currentUser.uid).update({
                    emailVerified: true
                }).then(() => {
                    // Show success message before redirecting
                    document.getElementById('verificationSuccess').textContent = 'Your email has been verified successfully! Redirecting to the dashboard...';
                    document.getElementById('verificationSuccess').style.display = 'block';
                    document.getElementById('verificationError').style.display = 'none';
                    
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                });
            } else {
                // Still not verified
                document.getElementById('verificationError').textContent = 'Your email is still not verified. Please check your inbox and click the verification link.';
                document.getElementById('verificationError').style.display = 'block';
                document.getElementById('verificationSuccess').style.display = 'none';
                
                hideLoading('checkVerificationBtn', 'CHECK VERIFICATION STATUS');
            }
        }).catch((error) => {
            console.error("Check verification error:", error);
            document.getElementById('verificationError').textContent = error.message;
            document.getElementById('verificationError').style.display = 'block';
            
            hideLoading('checkVerificationBtn', 'CHECK VERIFICATION STATUS');
        });
    });
}

// Add sign out functionality for verification page
const signoutBtn = document.getElementById('signoutBtn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'signin.html';
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    });
}

// FORGOT PASSWORD FUNCTIONALITY
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('forgotEmail').value;
        
        // Hide previous errors
        hideError('forgotEmailError');
        
        // Validation
        let isValid = true;
        
        if (!email || !email.includes('@')) {
            showError('forgotEmailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (isValid) {
            // Show loading
            showLoading('resetButton');
            
            // Send password reset email
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    // Show success message
                    document.getElementById('resetSuccess').style.display = 'block';
                    document.getElementById('forgotForm').style.display = 'none';
                })
                .catch((error) => {
                    console.error("Reset password error:", error);
                    
                    if (error.code === 'auth/user-not-found') {
                        showError('forgotEmailError', 'No account found with this email');
                    } else {
                        showError('forgotError', 'Error: ' + error.message);
                    }
                    
                    hideLoading('resetButton', 'RESET PASSWORD');
                });
        }
    });
}

// DASHBOARD FUNCTIONALITY
function loadUserDashboard(user) {
    // Get user profile from Firestore
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Set username
                const usernameElements = document.getElementsByClassName('user-name');
                for (let i = 0; i < usernameElements.length; i++) {
                    usernameElements[i].textContent = userData.username || user.displayName || 'User';
                }
                
                // Set email
                const emailElements = document.getElementsByClassName('user-email');
                for (let i = 0; i < emailElements.length; i++) {
                    emailElements[i].textContent = userData.email || user.email;
                }
                
                // Set subscription plan
                const planElements = document.getElementsByClassName('user-plan');
                for (let i = 0; i < planElements.length; i++) {
                    const plan = userData.plan || 'free';
                    planElements[i].textContent = plan.charAt(0).toUpperCase() + plan.slice(1); // Capitalize first letter
                }
                
                // Show appropriate content based on subscription
                const freeElements = document.getElementsByClassName('free-content');
                const basicElements = document.getElementsByClassName('basic-content');
                const plusElements = document.getElementsByClassName('plus-content');
                
                // Hide all first
                for (let i = 0; i < freeElements.length; i++) freeElements[i].style.display = 'none';
                for (let i = 0; i < basicElements.length; i++) basicElements[i].style.display = 'none';
                for (let i = 0; i < plusElements.length; i++) plusElements[i].style.display = 'none';
                
                // Show appropriate elements
                if (userData.plan === 'free') {
                    for (let i = 0; i < freeElements.length; i++) freeElements[i].style.display = 'block';
                } else if (userData.plan === 'basic') {
                    for (let i = 0; i < basicElements.length; i++) basicElements[i].style.display = 'block';
                } else if (userData.plan === 'plus') {
                    for (let i = 0; i < plusElements.length; i++) plusElements[i].style.display = 'block';
                }
                
                // Dashboard content
                // Update stats if available
                if (userData.stats) {
                    const totalOptimizationsElem = document.getElementById('totalOptimizations');
                    if (totalOptimizationsElem) {
                        totalOptimizationsElem.textContent = userData.stats.totalOptimizations || 0;
                    }
                    
                    const lastOptimizedElem = document.getElementById('lastOptimized');
                    if (lastOptimizedElem && userData.stats.lastOptimized) {
                        const lastOptimized = userData.stats.lastOptimized.toDate();
                        const options = { year: 'numeric', month: 'short', day: 'numeric' };
                        lastOptimizedElem.textContent = lastOptimized.toLocaleDateString('en-US', options);
                    }
                    
                    // Update ping stats
                    const pingReductionElements = document.getElementsByClassName('ping-reduction');
                    for (let i = 0; i < pingReductionElements.length; i++) {
                        pingReductionElements[i].textContent = userData.stats.pingReduction || '0%';
                    }
                    
                    // Update FPS stats
                    const fpsBoostElements = document.getElementsByClassName('fps-boost');
                    for (let i = 0; i < fpsBoostElements.length; i++) {
                        fpsBoostElements[i].textContent = userData.stats.fpsBoost || '0%';
                    }
                }
                
                // Populate devices list if available
                const devicesList = document.getElementById('devicesList');
                if (devicesList && userData.devices && userData.devices.length > 0) {
                    devicesList.innerHTML = ''; // Clear existing content
                    
                    userData.devices.forEach(device => {
                        const deviceItem = document.createElement('div');
                        deviceItem.className = 'device-item';
                        deviceItem.innerHTML = `
                            <div class="device-icon">
                                <i class="fas fa-${device.type === 'desktop' ? 'desktop' : device.type === 'laptop' ? 'laptop' : 'mobile-alt'}"></i>
                            </div>
                            <div class="device-info">
                                <h4>${device.name}</h4>
                                <p>Last active: ${device.lastActive ? new Date(device.lastActive.toDate()).toLocaleDateString() : 'Never'}</p>
                            </div>
                        `;
                        devicesList.appendChild(deviceItem);
                    });
                } else if (devicesList) {
                    devicesList.innerHTML = '<p class="empty-state">No devices added yet</p>';
                }
                
                // Populate games list if available
                const gamesList = document.getElementById('gamesList');
                if (gamesList && userData.games && userData.games.length > 0) {
                    gamesList.innerHTML = ''; // Clear existing content
                    
                    userData.games.forEach(game => {
                        const gameItem = document.createElement('div');
                        gameItem.className = 'game-item';
                        gameItem.innerHTML = `
                            <div class="game-icon">
                                <img src="assets/images/games/${game.slug}.png" alt="${game.name}" 
                                     onerror="this.src='assets/images/games/default.png'">
                            </div>
                            <div class="game-info">
                                <h4>${game.name}</h4>
                                <p>Optimized: ${game.optimized ? 'Yes' : 'No'}</p>
                            </div>
                            <div class="game-stats">
                                <div class="stat-item">
                                    <span class="stat-label">FPS Boost</span>
                                    <span class="stat-value">${game.fpsBoost || '0%'}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Ping</span>
                                    <span class="stat-value">${game.ping || 'N/A'}</span>
                                </div>
                            </div>
                        `;
                        gamesList.appendChild(gameItem);
                    });
                } else if (gamesList) {
                    gamesList.innerHTML = '<p class="empty-state">No games added yet</p>';
                }
                
                // Update activity log if available
                const activityList = document.getElementById('activityList');
                if (activityList) {
                    // Make a separate query to activities collection
                    db.collection('activities')
                        .where('userId', '==', user.uid)
                        .orderBy('timestamp', 'desc')
                        .limit(5)
                        .get()
                        .then((querySnapshot) => {
                            if (!querySnapshot.empty) {
                                activityList.innerHTML = ''; // Clear existing content
                                
                                querySnapshot.forEach((activityDoc) => {
                                    const activity = activityDoc.data();
                                    const activityDate = activity.timestamp.toDate();
                                    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                                    
                                    const activityItem = document.createElement('div');
                                    activityItem.className = 'activity-item';
                                    activityItem.innerHTML = `
                                        <div class="activity-icon">
                                            <i class="fas fa-${activity.type === 'optimization' ? 'wrench' : 
                                                          activity.type === 'login' ? 'sign-in-alt' : 
                                                          activity.type === 'settings' ? 'cog' : 'check-circle'}"></i>
                                        </div>
                                        <div class="activity-info">
                                            <h4>${activity.title}</h4>
                                            <p>${activity.description}</p>
                                        </div>
                                        <div class="activity-time">
                                            ${activityDate.toLocaleDateString('en-US', options)}
                                        </div>
                                    `;
                                    activityList.appendChild(activityItem);
                                });
                            } else {
                                activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
                            }
                        })
                        .catch((error) => {
                            console.error("Error getting activity data:", error);
                            activityList.innerHTML = '<p class="empty-state">Error loading activity</p>';
                        });
                }
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
        });
}

// Sign out functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    const signoutButtons = document.querySelectorAll('.signout-button');
    signoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'signin.html';
            }).catch((error) => {
                console.error("Sign out error:", error);
            });
        });
    });
});