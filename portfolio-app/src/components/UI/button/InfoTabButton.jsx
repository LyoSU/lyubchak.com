import React from "react";

function InfoTabButton(props) {
    return (
            <a className="button btn-alt" id={props.type + "-btn"} href={"#" + props.type} onclick={"spoiler('"+ props.type + "')"}>{props.text}</a>
    )
}

export default InfoTabButton;