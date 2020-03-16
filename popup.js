var d, dName, dMonth, dDay, dTail, mood, overMonth, lastMood, locked, editing, tMonth, tDay, lMonth, lDay; //t is temporary (hover). l is lock
var defaultNote = ". . .";
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var colors = {
  default: 'var(--lightvanilla)',
  amazing: 'var(--cinnamon)',
  ok: 'var(--light)',
  tired: 'var(--city)',
  sad: 'var(--dark)',
  stressed: 'var(--italian)'
};
var moodResults = ["default", "amazing", "ok", "tired", "sad", "stressed"]; //any way to omit?
var colorResults = ["var(--lightvanilla)", "var(--cinnamon)", "var(--light)", "var(--city)", "var(--dark)", "var(--italian)"];
var monthArrays = [
  //jan - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //feb - 29
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //mar - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //apr - 30
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //may - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //jun - 30
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //jul - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //aug - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //sep - 30
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //oct - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //nov - 30
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  //dec - 31
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
];

$(document).ready(function() {
  //mouseover trigger - indicates flavors!!
  $(".opt").mouseover(function(e) {
    $('#tail').show();
    mood = e.currentTarget.id;
    $('#tail_name').html(mood);
    crossFade(lastMood, mood);
    lastMood = mood;
  });

  $("div#mood_options").mouseleave(function() {
    $('#tail').hide();
    crossFade(lastMood, "default");
    lastMood = "default";
  });

  //click trigger - goes to calendar screen
  $(".opt").click(function() {
    setCell(dMonth, dDay - 1, colors[mood]);
    saveCell(dMonth, dDay - 1, colors[mood]);
    saveNote(dMonth, dDay - 1, $("#input").val());
    goToCalendar();
  });

  $("#goToPick").click(function() {
    //DATA RESET: chrome.storage.sync.clear();
    //DATA RESET: chrome.storage.sync.set({'firstRun': 0});
    goToPick();
  });

  $("#goToInfo").click(function() {
    $("#info").show();
  });

  $("div.day").mouseover(function(e) {
    var target = e.currentTarget;
    indicateCell(target);
    $("#note").show();
  });

  $("div.day").hover(function(e){
    $(document).keydown(function(event){
      var key = (event.keyCode ? event.keyCode : event.which);
      if(key == '76' && !editing) setLock(tMonth, tDay);
    });
  });

  $("div.day").mousedown(function(e){
    if (event.shiftKey) eraseColor(e); //any click & shift
    else {
      if (e.which === 1) switchColor(e); //left mouse click
      else if (e.which === 3 && !editing) setLock(tMonth, tDay); //right mouse click
    }
  });

  $("div.day").mouseleave(function(e) {
    $("#" + overMonth + "Name").css("color", 'var(--italian)');
    $('#tail').hide();
    if(!locked) $("#note").hide();
  });

  $("#infooverlay").click(function(e) {
    $("#info").hide();
  });

  $("#goEditNote").click(function() {
    editing = true;
    var text = monthArrays[lMonth][lDay][1];
    $("#goEditNote").hide();
    $("#noteContent").hide();
    $("#goSaveNote").show().css("margin-top", "-30px");
    $("#noteEditor").val(text).show().scrollTop(0);
    $("hr#line").css("margin-top", "2px");
  });

  $("#goSaveNote").click(function() {
    editing = false;
    var text = $("#noteEditor").val();
    saveNote(lMonth, lDay, text);
    $("#noteEditor").hide();
    if(text=="" || text ==null) $("#noteContent").html(defaultNote).show().scrollTop(0).css("opacity", "0.8");
    else $("#noteContent").html(text).show().scrollTop(0).css("opacity", "1");
    $("#goEditNote").show();
    $("#goSaveNote").hide();
    $("hr#line").css("margin-top", "-13px");
  });

  $("#goTrashNote").click(function(){
    killNote(lMonth, lDay);
  });
});

//ANIMATION//

function crossFade(x, y) {
  $("div#coffee_options #" + x).css('z-index', 3).stop(true, true, true).fadeOut(140);
  $("div#coffee_options #" + y).css('z-index', 1).stop(true, true, true).show();
}

$(document).bind('mousemove', function(e) {
  $("#tail").css({
    left: e.pageX + 5,
    top: e.pageY - 20
  });
});

function setBG(val){
  chrome.storage.sync.set({'radioVal': val});
  $("#bg_3").attr('src', "art/bg_"+val+".png");
}

function getBG(){
  chrome.storage.sync.get(['radioVal'], function(result) {
    var radioVal = result.radioVal;
    if(radioVal != null) $("#bg_3").attr('src', "art/bg_"+radioVal+".png");
    else $("#bg_3").attr('src', "art/bg_3.png");
  });
}

//NAVIGATION//

function goToCalendar() {
  if ($('#pick').is(":visible")) {
    setBG($('input:radio[name=reason]:checked').val());
    $('#pick').fadeOut(500);
    $('#calendar').delay(500).fadeIn(800);
    $("#tail").hide();
    $('#tail_name').hide();
    $('#tail_date').show().html('');
  } else {
    getBG();
    $('#calendar').fadeIn(800);
  }
  $("#tail_img").attr('src', "art/highlight3.png");
}

function goToPick() {
  getDate();
  if ($('#calendar').is(":visible")) {
    $('#calendar').fadeOut(500);
    $('#pick').delay(500).fadeIn(800);
    $("#tail").hide();
    $('#tail_date').hide();
    $('#tail_name').show().html('');
  } else $('#pick').fadeIn(800);
  $('#input').val(monthArrays[dMonth][dDay-1][1]);
  $("#tail_img").attr('src', "art/highlight.png");
}

//GENERAL//

function tempDName(month, day) {
  return "#" + months[month] + " div:nth-child(" + day + ")";
}

function generateDate() {
  d = new Date();
  dMonth = d.getMonth();
  dDay = d.getDate();
  dTail = months[dMonth].substring(0, 1) + dDay;
}

//NOTE//

function indicateCell(target) {
  overMonth = target.parentElement.id;
  $("#" + overMonth + "Name").css("color", 'var(--vanilla)');
  $('#tail').show();

  tMonth = months.indexOf(overMonth);
  tDay = Array.prototype.indexOf.call(target.parentElement.children, target);

  var day = tDay + 1;
  var monthDay = "<b>" + overMonth.substring(0, 1) + "</b>/<small>" + day;
  $('#tail_date').html(monthDay);
  if (!locked) setNote(monthArrays[tMonth][tDay][0], tMonth, tDay);
}

function setNote(color, month, day){
  var starsText = getMoodStars(color);
  var text = monthArrays[month][day][1];
  var mood = moodResults[colorResults.indexOf(color)];
  mood = (mood==undefined || mood=="default") ? "" : "/ " + mood;
  if(text=="" || text==null) $("#noteContent").html(defaultNote).css("opacity", "0.8");
  else $("#noteContent").html(text).css("opacity", "1");
  $("#noteDate").html("<small><b>" + months[month] + "</b> " + (day+1) + " " + mood + "</small><br>" + starsText);
}

function setLock(month, day) {
  $("div#lock").toggle();
  locked = !locked;

  if (locked) {
    //assuming the player can't click in two spots, it'll save to whatever lMonth and lDay are
    lMonth = month;
    lDay = day;
  }
}

function saveNote(month, day, note) {
  monthArrays[month][day][1] = note;
  chrome.storage.sync.set({
    'monthArraysSaved': monthArrays
  });
}

function killNote(month, day){
  monthArrays[month][day][1] = "";
  setNote("default", month, day);
  $(tempDName(month, day+1)).css("background-color", colorResults[0]);
  saveCell(month, day, null);
  chrome.storage.sync.set({
    'monthArraysSaved': monthArrays
  });
}

//STARS//

function getMoodStars(color) {
  var stars = "";
  var numFilledStars = colorResults.indexOf(color);
  for (i = numFilledStars; i <= 5; i++) stars += "&#9733;";
  for (i = 1; i < numFilledStars; i++) stars += "&#9734;";
  stars += "</small>";
  if (numFilledStars == -1 || numFilledStars == 0) stars = "&#10035;";
  return stars;
}

//CELLS//

function markTodaysCell(month, day) { //marks todays cell w date & disables next cells
  var tempDay = day > 9 ? "" + day : "0" + day; //keeps numbering formats consistent
  $(tempDName(month, day)).append("<span id='dayNum'>" + tempDay + "</span>");
  for (i = month + 1; i < 12; i++) //disables next month's cells
    for (j = 0; j <= 31; j++) killCell(i, j);
}

function killCell(i, j) {
  var n = tempDName(i, j);
  if (!$(n).is("#notADay")) { //else it changes the notADays too
    $(n).css({
      "pointer-events": "none",
      "background-color": "var(--lightervanilla)"
    });
  }
}

function saveCell(month, day, color) {
  monthArrays[month][day][0] = color;
  chrome.storage.sync.set({
    'monthArraysSaved': monthArrays
  });
}

function setCell(month, day, color) {
  day += 1;
  $(tempDName(month, day)).css("background-color", color);
}

function switchColor(e) {
  var target = e.currentTarget;
  var currentColor = target.style.backgroundColor;
  if (currentColor == "") currentColor = "var(--lightvanilla)";
  var currentColorIndex = colorResults.indexOf(currentColor);
  currentColorIndex++;
  if (currentColorIndex >= colorResults.length) currentColorIndex = 0;
  var tempColor = colorResults[currentColorIndex];
  target.style.backgroundColor = tempColor;
  saveCell(tMonth, tDay, tempColor);
  if(!locked || (tMonth == lMonth && tDay == lDay)) setNote(monthArrays[tMonth][tDay][0], tMonth, tDay);
}

function eraseColor(e) {
  var target = e.currentTarget;
  target.style.backgroundColor = colorResults[0];
  var tempColor = null;
  saveCell(tMonth, tDay, tempColor);
}

//START//

function getDate() {
  $('#month').html(months[dMonth]);
  $('#day').html(dDay);
}

document.addEventListener('DOMContentLoaded', start);
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
}, false); //prevents right click from opening menu

function start() {
  generateDate();
  lastMood = "default";
  locked = false;

  chrome.storage.sync.get(['firstRun'], function(result) {
    if (result.firstRun != 1) firstRun();
    else getSaved();
  });
}

function setScreens(month, day) { //check if today's cell is filled already & if so, skips the first part
  var todayVal = monthArrays[month][day - 1][0];
  if (todayVal != null && todayVal != undefined && todayVal != "var(--lightvanilla)" && todayVal != "undefined") goToCalendar();
  else goToPick();
}

function getSaved() {
  chrome.storage.sync.get(['monthArraysSaved'], function(result) {
    monthArrays = result.monthArraysSaved;

    for (i = 0; i < monthArrays.length; i++) {
      for (j = 0; j < monthArrays[i].length; j++) {
        if (monthArrays[i][j][0] != null) setCell(i, j, monthArrays[i][j][0]);
      }
    }

    setScreens(dMonth, dDay);
    markTodaysCell(dMonth, dDay);
  });
}

function firstRun() {
  generateMonthList();
  chrome.storage.sync.set({
    'firstRun': 1,
    'monthArraysSaved': monthArrays
  });
  goToPick();
}

function generateMonthList() {
  for (i = 0; i < 12; i++) {
    for (j = 0; j < monthArrays[i].length; j++) {
      monthArrays[i][j] = new Array(2);
    }
  }
}

/* OLD - manually generated arrays based on days for each month
function generateMonthList(month) {
  var year = 2020;
  var days = new Date(year, month, 0).getDate();
  monthArrays[month] = new Array(days);
  for(i=1;i<=days;i++) monthArrays[month][i] = new Array(2);
}*/
