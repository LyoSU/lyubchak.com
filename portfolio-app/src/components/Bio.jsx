import React from "react";

function Bio() {
    return (
        <div>
            <span className="text-sub">Just, web-developer</span>
            <div className="text">My name is Yuri, I am 24 years old, and I live in Ukraine.</div>
            <div className="text">I am interested in web development.<br />I mainly develop Telegram bots using PHP and Node.js, and use MySQL and MongoDB as my databases.</div>
            <div className="text">I love computer games. To me, they are like art. That's why I prefer to observe the industry more than play. I mostly play on the Nintendo Switch.</div>
            <div>
                <a className="button btn-big" href="https://t.me/LyBlog">Blog</a>
                <a className="button btn-big" id="projects-btn" href="#projects">Projects</a>
            </div>
        </div>
    )
}

export default Bio;