import React from 'react';

function Contacts() {
    return <div>
        <div className="title">Contacts:</div>
            <div>
                <a className="button" href="//github.com/LyoSU" target="_blank" rel="noreferrer">GitHub</a>
                <a className="button" href="https://t.me/LyoSU">Telegram</a>
            </div>
            <a className="button btn-alt" href="mailto:yuri@lyubchak.com">yuri@lyubchak.com</a>
                {/* <!-- <a className="button btn-alt" href="tel:+">+</a> --> */}
            
            <div>
                <input type="text" id="copyText" value="SW-2573-5817-3401" readOnly />
            </div>
    </div>
}

export default Contacts