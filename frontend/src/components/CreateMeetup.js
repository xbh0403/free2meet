import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import Confetti from "react-confetti";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { addMeetupAsync } from '../redux/meetups/thunks';
import MeetupAvailability from './MeetupAvailability';
import MeetupInvitation from './MeetupInvitation';
import MeetupLocation from './MeetupLocation';
import MeetupTitleAndDetail from './MeetupTitleAndDetail';
import ToolBar from './ToolBar';

const steps = ['Title and Details', 'Availability', 'Location', 'Invitation'];

export default function CreateMeetup() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    const [activeStep, setActiveStep] = React.useState(0);

    // TODO: get value of all the form inputs in all steps
    let titleAndDetailInput = useSelector(state => state.createMeetupTitleDetailReducer);
    let meetupLocation = useSelector(state => state.createMeetupLocationReducer);
    let meetupSchedule = useSelector(state => state.createMeetupScheduleReducer);
    // TODO
    let meetupInvitation = useSelector(state => state.createMeetupInvitationReducer);
    let meetupTags = useSelector(state => state.createMeetupTagsReducer);
    let meetupImage = useSelector(state => state.meetupsReducer.imageURL);
    let user = useSelector(state => state.usersReducer);
    let creator = {
        username: user.username,
        email: user.email
    };

    const handleNext = () => {
        setActiveStep(activeStep + 1);

        // At the last step, submit the newlly created meetup to backup
        if (activeStep === (steps.length - 1)) {
            let newMeetupSchedule = {};
            for (let i = 0; i < meetupSchedule.schedule.length; i++) {
                let date = meetupSchedule.schedule[i].replace('.', '|');
                newMeetupSchedule[date] = [creator.email];
            }
            let meetupScheduleCopy = { ...meetupSchedule };
            let meetupLocationCopy = JSON.parse(JSON.stringify(meetupLocation));
            for (let i = 0; i < meetupLocationCopy.length; i++) {
                meetupLocationCopy[i]['attendees'] = [creator.email];
            }
            meetupScheduleCopy.schedule = newMeetupSchedule;
            let meetupTagsCopy = JSON.parse(JSON.stringify(meetupTags));
            for (let i = 0; i < meetupTagsCopy.length; i++) {
                meetupTagsCopy[i] = meetupTagsCopy[i].value;
            }
            dispatch(addMeetupAsync({
                title: titleAndDetailInput['meetup-title'],
                description: titleAndDetailInput['meetup-description'],
                location: meetupLocationCopy,
                schedule: meetupScheduleCopy,
                invitees: meetupInvitation,
                tags: meetupTagsCopy,
                creator: creator,
                meetupImage: meetupImage
            }));
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <MeetupTitleAndDetail />;
            case 1:
                return <MeetupAvailability />;
            case 2:
                return <MeetupLocation />;
            case 3:
                return <MeetupInvitation />;
            default:
                throw new Error('Unknown step');
        }
    }

    const [width, setWidth] = React.useState(window.innerWidth);
    window.onresize = () => {
        setWidth(window.innerWidth);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToolBar />
            <Container component="main" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center">
                        Create New Meetup
                    </Typography>

                    {/* Display title of each step */}
                    <Stepper alternativeLabel={width < 560} activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>


                    <>
                        {/* Check if we finished all the steps */}
                        {activeStep === steps.length ? (
                            <>
                                <Confetti recycle={false} numberOfPieces={288} />
                                <Typography variant="h5" gutterBottom>
                                    Your Meetup {titleAndDetailInput["meetup-title"]} has been created, enjoy!
                                </Typography>
                                <Grid container justifyContent="flex-end">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                        onClick={e => navigate("/")}
                                    >
                                        Finish
                                    </Button>
                                </Grid>

                            </>
                        ) : (
                            <>
                                {getStepContent(activeStep)}

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {activeStep !== 0 && (
                                        <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 3, ml: 1 }}
                                    >
                                        {activeStep === steps.length - 1 ? 'Confirm and Create' : 'Next'}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </>
                </Paper>
            </Container>
        </ThemeProvider>
    )
}