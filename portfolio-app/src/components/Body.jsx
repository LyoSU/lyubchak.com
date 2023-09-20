import React from 'react';
import Bio from "./Bio";
import Contacts from './Contacts';
import InfoTabs from './InfoTabs';
import ProjectsPopup from './ProjectsPopup';

function Body(event, location){
    return (
        <div className="cent-ly">
            <div className="animated" style={{margin: "5%", animationDelay: "1s"}}><img src="/images/sam.png" width="100px"></img></div>
            <span className="text-main">Yuri Ly</span>
            <div className="line"></div>

            <Bio />
            
            <InfoTabs />
            
            <ProjectsPopup />

            <Contacts />
        </div>
    )
}

export default Body;