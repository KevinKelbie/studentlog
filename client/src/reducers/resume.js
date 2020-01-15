import * as ACTION_TYPES from "../actions/action_types";

const PRIMARY_COLOR = "#E87BBE";
const SECONDARY_COLOR = "#8E9DEF";

const initialState = {
    sections: [
        "TEMPLATE",
        "PROFILE",
        "EDUCATION",
        "PROJECTS",
        "WORK",
        "SKILLS",
        "AWARDS"
    ],
    template: 1,
    profile: {
        name: "John Smith",
        email: "johnsmith@gmail.com",
        number: "(555) 123-4567",
        location: "New York, NY",
        link: "mycoolportfolio.com/myname"
    },
    work: [
        {
            name: "Google", 
            title: "Software Engineer", 
            location: "Mountain View, CA", 
            start: "May 2015", 
            end: "Present"
        }
    ],
    projects: [
        {
            name: "Piper Chat", 
            description: "A video chat app with great picture quality.", 
            link: "http://piperchat.com", 
            keywords: [
                "NodeJS", "ExpressJS", "PostgreSQL", "GraphQL", "ReactJS", "Stripe API"
            ]
        }
    ],
    awards: [
        {
            name: "Supreme Hacker", 
            date: "May 2015", 
            awarder: "HackNY", 
            summary: "Recognized for creating the most awesome project at a hackathon", 
        }
    ],
    education: [
        {
            name: "Stanford University", 
            location: "Stanford, CA", 
            degree: "BS", 
            major: "Computer Science",
            gpa: "3.6", 
            start: "Sep 2015", 
            end: "Jun 2019"
        }
    ]
};

// Reducer
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case ACTION_TYPES.SAVE_RESUME:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
}