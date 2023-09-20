import React from 'react';
import PortProject from './PortProject';

function ProjectsPopup(){
    return (
        <div className="popup" style={{display: "none"}} id="projects">
            <PortProject img="/images/fStikBot.jpg" title="@fStikBot" desc="Поможет собрать твои любимые стикеры из других наборов. Просто отправь ему стикер, а он добавит его в твой пак. Есть поддержка создания нескольких наборов и переключения между ними." link="https://t.me/fStikBot"/>
            <PortProject img="/images/HistoryAIBot.jpg" title="@HistoryAIBot" desc="Бот дополняет твою историю." link="https://t.me/HistoryAIBot"/>
            <PortProject img="/images/LyBot.jpg" title="@LyBot" desc="Ищет аудио в YouTube Music и отправляет в оригинальном качестве. Работает через inline." link="https://t.me/LyBot"/>
            <PortProject img="/images/vkm4bot.jpg" title="@vkm4bot" desc="Поможет найти аудио в VK и отправить её вам. Для этого достаточно отправить её название. Есть возможность поиск со страницы, плейлиста или стены. Работает через inline." link="https://t.me/vkm4bot"/>
            <PortProject img="/images/QuotLyBot.jpg" title="@QuotLyBot" desc="Бот помогает создать цитату из сообщения." link="https://t.me/QuotLyBot"/>
            <PortProject img="/images/LyAdminBot.jpg" title="@LyAdminBot" desc="Для администрирования групп." link="https://t.me/LyAdminBot"/>
            <PortProject img="/images/MiWallpaperBot.jpg" title="@MiWallpaperBot" desc="Обои из Mi Wallpaper Carousel." link="https://t.me/MiWallpaperBot"/>
            <PortProject img="/images/FindLyBot.jpg" title="@FindLyBot" desc="Для поиска случайного собеседника." link="https://t.me/FindLyBot"/>
            <PortProject img="/images/tdl_bot.jpg" title="@tdl_bot" desc="Умеет отправлять видео с различных популярных сайтов. Полный список можно найти в самом боте. Также, он способен конвертировать эти видео в аудио формат для вашего удобства." link="https://t.me/tdl_bot"/>
            <PortProject img="/images/HorneyBot.jpg" title="@HorneyBot" desc="Находит аниме по названию, скриншоту или гифке. Позволяет получить подробную информацию об аниме. Уведомляет о выходе новых серий, которые добавлены в список избранных. Есть возможность просмотра аниме прямо в телеграме." link="https://t.me/HorneyBot"/>
            <PortProject img="/images/TStocksBot.jpg" title="@TStocksBot" desc="Игра на фондовом рынке, где «акции» — это Telegram каналы. Покупай и продавай акции своих любимых каналов. Все деньги в игре виртуальные и вывод их в реальные невозможен." link="https://t.me/TStocksBot"/>
            <PortProject img="/images/LyOSBot.jpg" title="@LyOSBot" desc="Реалистичный симулятор компьютерщика, где вы играете против других игроков. Аттакуй других людей, защищайся от их атак, загружай софт, улучшай свой компьютер, ПО и многое другое." link="https://t.me/LyOSBot"/>

            <div className="projects-content"><p>Весь контент ботов распространяется из открытых источников исключительно в ознакомительных целях и не предназначен для коммерческого использования.<br />По поводу авторства писать на <a href="mailto:dmca@telegram.org" class="link">dmca@telegram.org</a> или мои контакты, которые указаны на главной странице.</p></div>
        </div>
    )
}

export default ProjectsPopup;