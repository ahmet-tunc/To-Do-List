function TimeLimitControl() {
    let localDate = JSON.parse(sessionStorage.getItem("time"));
    let oldDate = new Date(localDate);
    let newDate = new Date();
    let dateDifference = (newDate-oldDate)/1000;

    if (dateDifference>=7200)
    {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("time");
        window.location.href="login.html";
    }
    else
    {
        let timeDifference = 7200-dateDifference;
        let hours = timeDifference/3600;
        let hoursRemaining = timeDifference%3600;
        let minute = hoursRemaining/60;
        let seconds = hoursRemaining%60;
        hours =  (parseInt(hours)<10)?"0"+parseInt(hours):parseInt(hours);
        minute = (parseInt(minute)<10)?"0"+parseInt(minute):parseInt(minute);
        seconds = (parseInt(seconds)<10)?"0"+parseInt(seconds):parseInt(seconds);
        document.getElementById("time").textContent=hours+":"+minute+":"+seconds;
    }
}