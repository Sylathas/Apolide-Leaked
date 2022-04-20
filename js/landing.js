window.changePage = (n) => {
  if (n == 0){
    $("#start").removeClass("onTop");
    $("#statico").css({
      opacity: 1
    });
    toggleMute();
    setTimeout(() => {
      $("#statico").css({
        opacity: .1
      });
      toggleMute();
      $("#welcome").addClass("onTop");
      setTimeout(() => {
        $("#statico").css({
          opacity: 1
        });
        toggleMute();
        $("#welcome").removeClass("onTop");
        setTimeout(() => {
          $("#hints").addClass("onTop");
          $("#statico").css({
            opacity: .1
          });
          toggleMute();
        }, 1000);
      }, 3000);
    }, 1000)
  } else {
    $("#statico").css({
      opacity: 1
    });
    toggleMute();
    setTimeout(() => {
      window.open("index.html", "_self");
    }, 1000);
  }
}

window.toggleMute = () => {
  var video=document.getElementById("statico");
  video.volume = 0.2;
  video.muted = !video.muted;
}
