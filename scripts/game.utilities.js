
const formatDuration = ms => {
    if (ms < 0) ms = -ms;
    const time = {
        d: Math.floor(ms / 86400000),
        h: Math.floor(ms / 3600000) % 24,
        m: Math.floor(ms / 60000) % 60,
        s: (ms / 1000).toFixed(1) % 60,
    //    ms: Math.floor(ms) % 1000
    };
    return Object.entries(time)
        .filter(val => val[1] !== 0)
    //   .map(val => val[1] + ' ' + (val[1] !== 1 ? val[0] + 's' : val[0]))
        .map(val => val[1] + ' ' + val[0])
        .join(', ');
};  

function position_tooltip(){
    var tooltip = this.querySelector(".tooltip");

    var container_rect = this.getBoundingClientRect();

    var tipX = container_rect.width + 10;
    var tipY = -10;// container_rect.height;

    tooltip.style.top = tipY + 'px';
    tooltip.style.left = tipX + 'px';

    var tooltip_rect = tooltip.getBoundingClientRect();

    if ((tooltip_rect.x + tooltip_rect.width) > window.innerWidth)
        tipX = -tooltip_rect.width - 5;
    if (tooltip_rect.y < 0)          
        tipY = tipY - tooltip_rect.y;  

    tooltip.style.top = tipY + 'px';
    tooltip.style.left = tipX + 'px';
}

function cloneFromTemplate(id){
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

function hide(element, doHide){
    element.classList.remove("hidden");
    if(doHide){
        element.classList.add("hidden");
    }
}