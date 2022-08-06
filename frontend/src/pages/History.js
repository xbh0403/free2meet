import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getMeetupsAsync } from '../redux/meetups/thunks';
import { getFriendsAsync } from '../redux/users/thunks';
import { darkStyle } from './CreateMeetup/CreateMeetupLocation';
import ToolBar from '../components/ToolBar';

// for google map <<<<<--------------------------------------------------------------
let script;
let map;
let locations;
let firstLoadDarkMode;
let markers = [];
const k1 = "AIzaSyDHH_p0fbbZSRyr";
const k2 = "HqvLAc5WcM7Ic26ypP4";
const k = k1 + k2;

function removeGoogleMapScript() {
    let keywords = ['maps.googleapis'];
    // Remove google from BOM (window object)
    window.google = undefined;
    // Remove google map scripts from DOM
    let scripts = document.head.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i--) {
        let scriptSource = scripts[i].getAttribute('src');
        if (scriptSource != null) {
            if (keywords.filter(item => scriptSource.includes(item)).length) {
                scripts[i].remove();
            }
        }
    }
}

const loadScript = (url, callback) => {
    script.type = "text/javascript";
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = () => callback();
    }
    script.src = url;
};

function handleScriptLoad(mapRef) {
    map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 49.265395, lng: -123.246727 },
        zoom: 15,
        styles: firstLoadDarkMode ? darkStyle : [],
    });
    showMarkers();
    fitBounds();
}

function showMarkers() {
    markers = [];
    for (let i = 0; i < locations.length; i++) {
        const d = locations[i];
        for (let j = 0; j < d.location.length; j++) {
            createMarker(d.location[j].place_id, d.location[j].name, d.location[j].formatted_address, d.location[j].lat, d.location[j].lng);
        }
    }
}

function createMarker(id, name, formatted_address, lat, lng) {
    for (let i = 0; i < markers.length; i++) {
        if (id === markers[i].id) {
            markers[i].times++;
            return;
        }
    }
    let marker = new window.google.maps.Marker({
        id: id,
        times: 1,
        position: new window.google.maps.LatLng(lat, lng),
        map: map,
        draggable: false,
        animation: window.google.maps.Animation.DROP
    });
    window.google.maps.event.addListener(marker, 'click', function () {
        let s = marker.times === 1 ? "" : "s";
        let infowindow = new window.google.maps.InfoWindow({
            content: '<div class="infoWindow" style="color:#000">' +
                '<h3>' + name + '</h3>' +
                '<p>You have been here for ' + marker.times + ' time' + s + '!</p>' +
                '<p>' + formatted_address + '</p>' +
                '</div>'
        });
        infowindow.open(map, marker);
    });
    markers.push(marker);
}

const fitBounds = () => {
    if (markers.length === 0) {
        return;
    } else if (markers.length === 1) {
        map.panTo({ lat: markers[0].position.lat(), lng: markers[0].position.lng() });
        map.setZoom(15);
        return;
    }
    let latlngbounds = new window.google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
        latlngbounds.extend(new window.google.maps.LatLng(markers[i].position.lat(), markers[i].position.lng()));
    }
    map.fitBounds(latlngbounds);
}
// for google map -------------------------------------------------------------->>>>>

export default function History() {
    const dispatch = useDispatch();

    const email = useSelector(state => state.usersReducer.email);

    const [filterByPerson, setFilterByPerson] = useState("");

    const [filterPeopleOption, setFilterPeopleOption] = useState("all");

    const peopleJSON = useSelector(state => state.usersReducer.friends);
    useEffect(() => {
        dispatch(getFriendsAsync(email));
    }, [dispatch, email]);
    const eventsJSON = useSelector(state => state.meetupsReducer.list);
    useEffect(() => {
        dispatch(getMeetupsAsync({ filterPeopleOption, filterByPerson, email }));
    }, [dispatch, filterPeopleOption, filterByPerson, email]);
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

    // for google map <<<<<--------------------------------------------------------------
    firstLoadDarkMode = prefersDarkMode;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            map.setOptions({ styles: darkStyle });
        } else {
            map.setOptions({ styles: [] });
        }
    });
    locations = eventsJSON;
    const mapRef = useRef(null);
    script = document.createElement("script");
    useEffect(() => {
        removeGoogleMapScript();
        if (eventsJSON.length > 0) {
            loadScript(
                `https://maps.googleapis.com/maps/api/js?key=${k}&libraries=places&language=en`,
                () => handleScriptLoad(mapRef)
            );
        }
    }, [eventsJSON.length]);
    document.getElementsByTagName("head")[0].appendChild(script);
    // for google map -------------------------------------------------------------->>>>>

    function mapJSONToCard(eventJSON) {
        return (
            <Box sx={{ width: 275, margin: 2 }} key={eventJSON._id}>
                <Card variant="outlined">
                    <CardHeader
                        avatar={
                            <Avatar
                                alt={eventJSON.creator.username}
                                src={eventJSON.creator.profilePictureLink}
                            />
                        }
                        title={eventJSON.title}
                        subheader={eventJSON.schedule.schedule === null || eventJSON.schedule.schedule === undefined ? "NA" :
                            `${Object.keys(eventJSON.schedule.schedule).length === 0 ? 'NA' :
                                Object.keys(eventJSON.schedule.schedule)[0].split("T")[0]} - ${Object.keys(eventJSON.schedule.schedule).length === 0 ? 'NA' :
                                    Object.keys(eventJSON.schedule.schedule)[Object.keys(eventJSON.schedule.schedule).length - 1].split("T")[0]}`}
                    />
                    <CardContent>
                        <CardMedia
                            component="img"
                            image={eventJSON.meetupImage}
                        />
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {eventJSON.description || "No description"}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={e => navigate(`/meetups/${eventJSON._id}`)}>View</Button>
                    </CardActions>
                </Card>
            </Box >
        );
    }

    function mapPeopleToSelect(peopleJSON) {
        return <MenuItem key={peopleJSON.email} value={peopleJSON.email}>{peopleJSON.username}</MenuItem>
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToolBar />
            <Container component="main" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Filter By Person
                    </Typography>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <FormControl>
                            <FormLabel id="events-people-filter"></FormLabel>
                            <RadioGroup
                                aria-labelledby="events-people-filter"
                                value={filterPeopleOption}
                                name="events-people-filter-group"
                                onChange={e => { setFilterPeopleOption(e.target.value) }}
                                row
                            >
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <FormControlLabel key="all" value="all" control={<Radio />} label="All" />
                                    <FormControlLabel key="created-by-me" value="created-by-me" control={<Radio />} label="Created By Me" />
                                    <FormControlLabel key="attended-by-me" value="attended-by-me" control={<Radio />} label="Attended By Me" />
                                    <div display="flex" flexDirection="row">
                                        <FormControlLabel key="custom" value="custom" control={<Radio />} label="My Friend" />
                                        <FormControl variant="standard" sx={{ minWidth: 60 }}>
                                            <Select
                                                labelId="events-person-select"
                                                id="events-person-select"
                                                value={filterByPerson}
                                                disabled={filterPeopleOption !== "custom"}
                                                label="Filter By Person"
                                                onChange={e => { setFilterByPerson(e.target.value) }}
                                            >
                                                {peopleJSON.map(mapPeopleToSelect)}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </Grid>
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center">
                        Past Events
                    </Typography>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {eventsJSON.map(mapJSONToCard)}
                    </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Past Locations
                    </Typography>
                    {eventsJSON.length === 0 ? <Typography component="h1" variant="body1" align="center">
                        No past locations
                    </Typography> :
                        <>
                            <Typography component="h1" variant="body1" align="center">
                                Click on the marker to see more information!
                            </Typography>
                            <div ref={mapRef} id='map' />
                            <Grid container justifyContent="flex-end">
                                <Button variant="outlined" sx={{ my: 1 }} onClick={fitBounds}>Fit Boundary</Button>
                            </Grid>
                        </>
                    }
                </Paper>
            </Container>
        </ThemeProvider>
    );
}