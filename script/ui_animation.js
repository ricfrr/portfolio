function response() {


    var x = document.getElementById("responsive_navbar");
    var icon = document.getElementById('spin_arrow')
    x.addEventListener("webkitAnimationEnd", end_animation,false);
    x.addEventListener("animationend", end_animation,false);
    x.addEventListener("oanimationend", end_animation,false);

    if (x.className === "m_navbar m_navbar_animation" || x.className === "m_navbar") {
        
        x.className = "m_navbar responsive";
        x.animate([
            {bottom: '-24%' },
            {bottom: '0%' }
        ], { duration: 100})
        icon.animate([
            { transform: 'rotate(0deg)' }, 
            { transform: 'rotate(180deg)' } 
        ], {duration:150, fill:"forwards"})

    } else {   
        var timer = setTimeout(function () {
            x.className = "m_navbar";
            }, 100);
        x.animate([
            {bottom: '0%' },
            {bottom: '-24%' }
        ], { duration: 110})
        icon.animate([
            { transform: 'rotate(180deg)' }, 
            { transform: 'rotate(0deg)' } 
        ], {duration:150, fill:"forwards"})

      
    }
}

function end_animation() {
    //var x = document.getElementById("responsive_navbar");
    //x.className = "m_navbar";
}

function load() {
    var timer = setTimeout(function () {
        $(".main").fadeIn(0);
        $(".loader").fadeOut(400);
    }, 1000);
}

$(document).ready(function () {
    load();
});

var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(function () {
        that.tick();
    }, delta);
};

window.onload = function () {
    var elements = document.getElementsByClassName('typewrite');
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid rgb(205, 226, 15)}";
    document.body.appendChild(css);
};