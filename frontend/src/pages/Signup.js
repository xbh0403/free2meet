import { Box, Button, CssBaseline, Grid, Paper, TextField, Typography, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EmailValidator from 'email-validator';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import auth from '../firebase';
import { registerAsync } from '../redux/users/thunks';

export default function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [validEmail, setValidEmail] = useState(true);
    const [validUsername, setValidUsername] = useState(true);
    const [validPassword, setValidPassword] = useState(true);
    const [verified, setVerified] = useState(false);
    const [verifiedEmailSent, setVerifiedEmailSent] = useState(false);

    const currentURL = new URL(window.location.href);
    const oobCode = currentURL.searchParams.get('oobCode');
    const oobCodeBool = oobCode === null ? false : true;

    // declare the data fetching function
    const reloadUser = async () => {
        await auth.currentUser.reload();
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (verifiedEmailSent) {
                reloadUser().then(() => {
                    setVerified(auth.currentUser.emailVerified);
                })
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [verifiedEmailSent]);


    const onSubmit = () => {
        if (!auth.currentUser.emailVerified) {
            auth.onAuthStateChanged(function (user) {
                setVerified(user.emailVerified);
            });
        } else {
            setVerified(auth.currentUser.emailVerified);
        }
        if (verified) {
            if (!(validEmail && validUsername && validPassword) || email === "" || username === "" || password === "") {
                if (!EmailValidator.validate(email) || email === "") {
                    setValidEmail(false);
                }
                if (username === "") {
                    setValidUsername(false);
                }
                if (password === "") {
                    setValidPassword(false);
                }
                return false;
            } else {
                dispatch(registerAsync({
                    email,
                    username,
                    password
                }));
                auth.signOut();
                navigate("/");
            }
        } else {
            alert("Please verify your email first");
        }
    }

    const emailverification = () => {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // send verification email
                userCredential.user.sendEmailVerification();
                setVerifiedEmailSent(true);
            }).catch(alert);
        alert("Please check your spam folder if you don't receive the email\nPlease check your spam folder if you don't receive the email\nPlease check your spam folder if you don't receive the email");
    }

    const verifyEmail = async () => {
        auth.applyActionCode(oobCode).then((resp) => {
            setVerified(true);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                {/* Sign up Form */}
                <Grid item xs={12} sm={12} md={12} component={Paper} elevation={12} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Create an account
                        </Typography>

                        {!oobCodeBool && <Box component="form" noValidate sx={{ mt: 1 }}>
                            {/* User Name Input */}
                            <TextField
                                error={!validUsername}
                                onFocus={() => setValidUsername(true)}
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="User Name"
                                name="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {/* Email Input */}
                            <TextField
                                error={!validEmail}
                                onBlur={() => email === "" ? setValidEmail(true) : setValidEmail(EmailValidator.validate(email))}
                                onFocus={() => setValidEmail(true)}
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {verifiedEmailSent &&
                                <>
                                    <Typography
                                        variant='body1'
                                        component='div'
                                        gutterBottom>
                                        An email has been sent to {email} to verify your account. Please verify your email to continue.
                                    </Typography>
                                    <Typography
                                        variant='body1'
                                        component='div'
                                        color="error"
                                        gutterBottom>
                                        <strong>It might be in your spam folder.</strong>
                                    </Typography>
                                </>}
                            {/* Password Input */}
                            <TextField
                                error={!validPassword}
                                onFocus={() => setValidPassword(true)}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                fullWidth
                                variant={(!(validEmail && validUsername && validPassword) || email === "" || username === "" || password === "") ? "outlined" : "contained"}
                                sx={{ mt: 3, mb: 2 }}
                                onClick={emailverification}
                            >
                                Send Verification Email
                            </Button>
                            {verifiedEmailSent && <Typography
                                variant='body1'
                                component='div'
                                align='center'
                                gutterBottom>
                                Please come back to this page and click SIGN UP button after verifying your email.
                            </Typography>}
                            <Button
                                fullWidth
                                variant={(!(validEmail && validUsername && validPassword && verifiedEmailSent && verified) || email === "" || username === "" || password === "") ? "outlined" : "contained"}
                                sx={{ mt: 3, mb: 2 }}
                                onClick={onSubmit}
                            >
                                Sign Up
                            </Button>
                        </Box>}
                        {oobCodeBool && <Box component="form" noValidate sx={{ mt: 1 }}>
                            {!verified && <Button
                                fullWidth
                                variant={(!(validEmail && validUsername && validPassword) || email === "" || username === "" || password === "") ? "outlined" : "contained"}
                                sx={{ mt: 3, mb: 2 }}
                                onClick={verifyEmail}
                            >
                                Verify Email Address
                            </Button>}
                            {verified && <Typography
                                variant='h6'
                                component='div'
                                gutterBottom>
                                Your email has been verified. You can now go back to the original tab and sign in.
                            </Typography>}
                        </Box>}
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
} 