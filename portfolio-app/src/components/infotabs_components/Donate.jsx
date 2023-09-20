import React from "react";

function Donate() {
    return (
            <div className="spoiler" style={{display: "none"}} id="donate">
                <p>I spend a lot of time and money on my projects. If you'd like, you can send me a small contribution using one of the methods below, and I would be very grateful </p>
                <div>
                    <a className="button btn-donate" href="https://send.monobank.ua/jar/2fpLioJzU8" target="_blank" rel="noreferrer">Bank card (monobank)</a>

                    <div>
                        BTC: <input type="text" id="copyText" value="17QaN4wPZFaH4qtsgDdTaYwiW9s9PUcHj7" readOnly /><br />
                        ETH/BUSD: <input type="text" id="copyText" value="0x34007b75775F8DAe005A407141617aA2fBa2740c" readOnly /><br />
                        TON: <input type="text" id="copyText" value="EQAwN6PpFOo1LFVIh5hkVjearXvrqOvPD-nyqLjVz-fPbn_s" readOnly />
                    </div>
                    
                </div>
                <img className="bot-img" src="images/love.png"></img><br />
                <p>All the money will be spent wisely by me to support the work of bots or myself. You can indicate in the description how you would like me to spend your contribution, and I will do my best to fulfill your request.</p>
            </div>
    )
}

export default Donate;