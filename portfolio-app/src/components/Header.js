import React from 'react';

function Header(){
    return (
        <div>
            <title>Ly</title>
            <meta charset="utf-8" />
            <meta name="theme-color" content="#1c132c" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="shortcut icon" href="public/favicon.ico" type="image/x-icon" />
            <link href="https://cdn.jsdelivr.net/npm/raleway-cyrillic@4.0.2/raleway.min.css" rel="stylesheet" />
            <link href="assets/main.css" rel="stylesheet" />
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
            <meta property="og:type" content="website"/>
            <meta property="og:title" content="Yuri Ly"/>
            <meta property="og:image" content="https://avatars1.githubusercontent.com/u/37080625?s=460&v=4" />
            <meta property="og:url" content="https://lyo.su/"/>
            <meta property="og:description" content="My name is smth, I am N years old, and I live in a country. I am interested in web development." />
        </div>
    )
}

export default Header;