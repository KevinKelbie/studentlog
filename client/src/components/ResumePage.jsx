import React, { useState, useEffect } from "react";

import styled from "styled-components";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { BrowserRouter as Router, Route, Link, Switch, useRouteMatch, withRouter } from "react-router-dom";
import Button, { Button2 } from "./Button";
import { StateMachineProvider, createStore, useStateMachine } from "little-state-machine";
import updateAction from "../updateAction";

import ResumeEducationFrom from "./ResumeEducationForm";
import ResumeWorkFrom from "./ResumeWorkForm";
import ResumeAwardsForm from "./ResumeAwardsForm";
import ResumeProfileForm from "./ResumeProfileForm";
import ResumeProjectsForm from "./ResumeProjectsForm";

import { Document, Page, Outline } from 'react-pdf/dist/esm/entry.webpack';

import _ from "lodash"; 

// fake data generator
const getItems = count =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `item-${k}`,
        content: `item ${k}`
    }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const grid = 8;


const getItemStyle = (isDragging, draggableStyle) => {
    const { transform } = draggableStyle;
    let activeTransform = {};
    if (transform) {
        activeTransform = {
            transform: `translate(0, ${transform.substring(
                transform.indexOf(',') + 1,
                transform.indexOf(')')
            )})`
        };
    }
    return {

        ...draggableStyle,
        ...activeTransform
    };
};

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

function ResumeNavElement({handle, ...props}) {
    console.log(222, props);

    let active = "/resume/"+props.title.toLowerCase() === props.location.pathname;

    return <div {...props}>
        <div {...handle} className={`handle`}>
            <FontAwesomeIcon icon={faGripVertical}  />
        </div>
        <Link to={`/resume/${props.title.toLowerCase()}`} className={`title ${ active ? "active" : "" }`}>
            {props.title}
            <div className={`underline`}></div>
        </Link>
    </div>
}

ResumeNavElement = styled(withRouter(ResumeNavElement))`
    display: flex;

    .handle {
        color: ${props => props.theme.PRIMARY_COLOR};
        visibility: ${props => props.handle ? 'visible' : 'hidden' };
        margin-right: 8px;
    }

    
    .title {
        transition: 0.1s ease 0s;
        text-decoration: none;
        position: relative;
        color: ${props => props.theme.is === "dark" ? "white" : "black"};
        
        &.active {
            color: ${props => props.theme.PRIMARY_COLOR};
        }

        &:hover > .underline {
            width: 100%;
        } 
        
        .underline {
            transition: .3s ease 0s;
            width: 0%;
            height: 1.25px;
            position: absolute;
            bottom: 0;
            background: ${props => props.theme.PRIMARY_COLOR};
        }

    }
`;

function ResumePDF(props) {
    const { state } = useStateMachine(updateAction);
    const [url, setUrl] = useState("");

    useEffect(async () => {
        let data = state;

        // Profile Map
        data = _.mapKeys(data, function(value, key) {
            switch (key) {
                case "profile":
                    return "basics";
                case "template":
                    return "selectedTemplate";
                default:
                    return key;
            }
        });

        // Awards Map
        data.awards = data.awards.map(award => {
            return _.mapKeys(award, function(value, key) {
                switch(key) {
                    case "name":
                        return "title";
                    default:
                        return key;
                }
            });
        })

        // Education Map
        data.education = data.education.map(education => {
            return _.mapKeys(education, function(value, key) {
                switch(key) {
                    case "name":
                        return "institution";
                    case "degree":
                        return "studyType";
                    case "major":
                        return "area";
                    case "start":
                        return "startDate";
                    case "end":
                        return "endDate";
                    default:
                        return key;
                }
            });
        })

        // Projects Map
        data.projects = data.projects.map(project => {
            return _.mapKeys(project, function(value, key) {
                switch(key) {
                    case "link":
                        return "url";
                    default:
                        return key;
                }
            });
        })

        // Work Map
        data.work = data.work.map(work => {
            return _.mapKeys(work, function(value, key) {
                switch(key) {
                    case "name":
                        return "company";
                    case "end":
                        return "endDate";
                    case "start":
                        return "startDate";
                    case "title":
                        return "position";
                    default:
                        return key;
                }
            });
        })

        // Profile Map
        data.basics = _.mapKeys(data.basics, function(value, key) {
            switch(key) {
                case "number":
                    return "phone";
                case "link":
                    return "website";
                default:
                    return key;
            }
        });

        data.basics.location = {
            address: data.basics.location
        }

        data.sections = data.sections.map(section => {
            return section.toLowerCase();
        })

        console.log(data, 123123123)

        const request = {
            method: 'POST',
            headers: {
                Accept: 'application/pdf',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        const response = await fetch('/api/generate/resume', request)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setUrl(url);

        console.log(123123123, url);
    }, []);

    

    return <div {...props} onClick={() => {
        props.showPDF(false)
    }}>
        <Document
            file={url}
        >
            <Page 
                pageNumber={1}
                renderAnnotations={false}
                renderTextLayer={false}
            />
        </Document>
    </div>
}

ResumePDF = styled(ResumePDF)`
    position: fixed;
    z-index: 1; 
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: rgba(0,0,0,0.75);

    canvas {
        max-width: 95vw;
        height: auto !important;
        margin: auto;
        margin-top: 64px;
        box-shadow: 0px 0px 25px 1px rgba(0,0,0,0.1);
    }
`;

class ResumeNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [
            {
                id: "item-2",
                content: "Work",
                isFixed: false
            },
            {
                id: "item-3",
                content: "Education",
                isFixed: false
            },
            {
                id: "item-4",
                content: "Skills",
                isFixed: false
            },
            {
                id: "item-5",
                content: "Projects",
                isFixed: false
            },
            {
                id: "item-6",
                content: "Awards", 
                isFixed: false
            }]
        };
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            this.state.items,
            result.source.index,
            result.destination.index
        );

        this.setState({
            items
        });
    }

    // Normally you would want to split things out into separate components.
    // But in this example everything is just done in one place for simplicity
    render() {
        return (
            <div {...this.props}>
                <ResumeNavElement handle={false} title={"Template"} />
                <ResumeNavElement handle={false} title={"Profile"} />
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {this.state.items.map((item, index) => (
                                    <Draggable isDragDisabled={item.isFixed} key={item.id} draggableId={item.id} index={index} direction={'vertical'}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                                >
                                                <ResumeNavElement handle={item.isFixed == false ? provided.dragHandleProps : false} title={item.content} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <Button2 onClick={() => this.props.showPDF(true)}>Generate PDF</Button2>
            </div>
        );
    }
}

ResumeNav = styled(ResumeNav)`
    margin-right: 8px;
`;

createStore({
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
});

function ResumePage(props) {
    const [showPDF, setShowPDF] = useState(false);
    let { path, url } = useRouteMatch();

    return <div {...props}>
        <StateMachineProvider>
            <ResumeNav showPDF={(b) => setShowPDF(b)} />
            {
                showPDF ?
                    <ResumePDF showPDF={(b) => setShowPDF(b)} />
                    : ""
            }
            <Switch>
                <Route path={`${path}/templates`}>
                    {/* <TemplatesForm /> */}
                </Route>
                <Route path={`${path}/profile`}>
                    <ResumeProfileForm />
                </Route>
                <Route path={`${path}/work`}>
                    <ResumeWorkFrom />
                </Route>
                <Route path={`${path}/education`}>
                    <ResumeEducationFrom />
                </Route>
                <Route path={`${path}/skills`}>
                    {/* <SkillsForm /> */}
                </Route>
                <Route path={`${path}/Projects`}>
                    <ResumeProjectsForm />
                </Route>
                <Route path={`${path}/awards`}>
                    <ResumeAwardsForm />
                </Route>
            </Switch>
        </StateMachineProvider>
    </div>
}

export default styled(withRouter(ResumePage))`
    display: flex;

    > *:last-child {
        flex-grow: 1;
    }
`;