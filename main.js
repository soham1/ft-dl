$(function(){
  var baseUrl = "http://animedao.com/watch-online/fairy-tail-episode-";
  var totalPages = 0;
  var remainingPages = 0;
  var someError = false;

  String.prototype.dfea = function(){
    return this.replace(/[a-zA-Z]/g, function(c){
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
  };

  $("#dlBtn").click(download);
  $("#copyBtn").click(function(){
    $("#wgetCmd").select();
    document.execCommand('copy');
  });

  // $("#startNum").keydown(function() {
  //   onkeypress='return event.charCode >= 48 && event.charCode <= 57';
  // });

  // $("#endNum").keydown(function() {
  //   onkeypress='return event.charCode >= 48 && event.charCode <= 57';
  // });

  function download(){
    $("#progressBar").addClass("active");
    someError = false;
    $("#errorList").empty();
    $("#errorSection").hide();
    $(".progress-bar").css("width", "0%");
    $("#dlBtn").prop('disabled', true);
    console.log("In download function");
    $("#wgetCmd").val("");
    console.log($("#startNum").val());
    var i = Number($("#startNum").val());
    var max = Number($("#endNum").val());
    if(verify(i, max)){
      remainingPages = max - i + 1;
      totalPages = max - i + 1;
      for(; i <= max; i++){
        downloadOne(i);
      }
    }else{
      $("#dlBtn").prop('disabled', false);
    }
  }

  function verify(start, end) {
    console.log(start, end);
    var verified = true;
    if(start === 0 || end === 0){
      // console.log("In isNaN");
      toastr.error("Please put numbers in the input box.", "Please put valid input and try again.", {
        "progressBar": true,
        "positionClass": "toast-top-right",
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      });
      verified = false;
    }
    return verified;
  }

  function pad(num, size) {
    var padnum = "000" + num;
    return padnum.substr(padnum.length-size);
  }

  function downloadOne(vidNum){
    var url = baseUrl + pad(vidNum,3);
    var src = "";
    console.log(url);
    $.ajax({
      url: url,
      success: function(data){
        //console.log(data);
        data = data.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img no_load_src=\"" +capture+ "\" />";});
        data = data.replace(/<video/gi, function (match, capture) {return "<no_video ";});
        var allScripts = $(data).find("script").each(function(i, e){
          if($(e).text().indexOf("s360p") != -1 || $(e).text().indexOf("s720p") != -1){
            var scriptText = $(e).text();
            var find360 = /s360p = "(.*)"\.dfea()/;
            var find720 = /s720p = "(.*)"\.dfea()/;
            var src360 = find360.exec(scriptText);
            var src720 = find720.exec(scriptText);
            if(src720){
              src = "redirect/" + src720[1].dfea();
            }else if(src360){
              src = "redirect/" + src360[1].dfea();
            }
            return false;
          }
        });
        //console.log("All Scripts", allScripts);
        //var src = $(data).find("#videowrapper video source").attr("src");
        //console.log("Data", data);
        //console.log("SRC", src);
        if(src && src.length > 0){
          var videoUrl =  "http://animedao.com/" + src;
          var newCmd = "wget " + videoUrl + " --no-check-certificate " + "-O " + vidNum + ".mp4\n";
          var newText = $("#wgetCmd").val() + newCmd;
          var percentDone = (100/totalPages)*(totalPages-remainingPages);
          $(".progress-bar").css("width", percentDone + "%");
          console.log("Total pages are: ", totalPages);
          console.log("Remaining pages are:", remainingPages);
          console.log("Percent:", percentDone);
          $("#wgetCmd").val(newText);
          remainingPages = remainingPages - 1;
          if(remainingPages === 0){
            onAllDone();
          }
        }else{
          someError = true;
          remainingPages = remainingPages - 1;
          var errorEpisode = this.url.split("-").pop();
          $("#errorList").append("<li> " + errorEpisode + "</li>");
          $("#errorSection").show();
          if(remainingPages === 0){
            onAllDone();
          }
        }
      }
    });
  }
  function onAllDone(){
    $("#dlBtn").prop('disabled', false);
    $(".progress-bar").css("width", "100%");
    $("#progressBar").removeClass("active");
    if(someError){
      toastr.warning("Please refer to the list of episodes not downloaded below.", "The download has completed, but with some problems.", {
        "progressBar": true,
        "positionClass": "toast-top-right",
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      });
    }else{
      toastr.success("You are ready to paste these commands in your console!", "Your download has finished successfully", {
        "progressBar": true,
        "positionClass": "toast-top-right",
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      });
    }
  }
});
