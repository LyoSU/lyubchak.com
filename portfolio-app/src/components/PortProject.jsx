import React from 'react';
import '/home/capybara/dev/minimalistic-portfolio/portfolio-app/src/styles/main.css';

function PortProject(props) {
    return (
        <div className="projects-bot">
        <img className="bot-img" src={props.img} /><br />
        <span className="title">{props.title}</span>
        <p>{props.desc}</p>
        <a className="button btn-bot" href={props.link}>Открыть</a>
    </div>
    )
}

export default PortProject;