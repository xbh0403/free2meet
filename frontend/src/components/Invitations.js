import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import ToolBar from './ToolBar';
import InvitationCard from './InvitationCard';
import { Container } from '@mui/system';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { getInvitationsAsync } from '../redux/invitations/thunks';
import { useEffect } from 'react';

export default function Meetups() {
    const dispatch = useDispatch();
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

    const invitations = useSelector(state => state.invitationsReducer.list);
    useEffect(() => {
        dispatch(getInvitationsAsync());
    }, [dispatch]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <ToolBar />
            <Container component="main" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                {/* <Typography component="h1" variant="h5" align="center">
                    TODO: Better arrangement when viewing one invitation
                </Typography> */}
                <Typography component="h1" variant="h4" align="center">
                    Pending Invitations
                </Typography>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                >
                {invitations.map(invitation => (
                    <InvitationCard key={invitation.id} invitation={invitation} />
                ))}
                {/* <InvitationCard />
                <InvitationCard />
                <InvitationCard /> */}
                </Grid>
                <Typography component="h1" variant="h4" align="center">
                    Processed Invitations
                </Typography>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                >
                {/* <InvitationCard />
                <InvitationCard /> */}
                </Grid>
                </Paper>
            </Container>
        </ThemeProvider>
    )
}