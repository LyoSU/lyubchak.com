import React from "react";
import InfoTabButton from "./UI/button/InfoTabButton";
import Comments from "./infotabs_components/Comments";
import Donate from "./infotabs_components/Donate";
import Story from "./infotabs_components/Story";

function InfoTabs() {
    return (
        <div>
            <InfoTabButton type="donate" text="💜 Donate"/>
            <InfoTabButton type="story" text="Little history"/>
            <InfoTabButton type="comments" text="✍️"/>

            <Donate />
            <Story />
            <Comments />            

        </div>
    )
}

export default InfoTabs;