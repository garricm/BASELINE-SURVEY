// Initialize your app
var myApp = new Framework7({
  //swipePanel: 'left',
  init: false, //Disable App's automatic initialization
  template7Pages: true,
  scrollTopOnNavbarClick: true,
  swipeBackPage: false,
  notificationHold: 2000,
  sortable: false,
  uniqueHistory: true
});

// Export selectors engine
var $$ = Dom7;

var currentFormID = null;
var currentFormObj = null;

//Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.firestore().enablePersistence()
.then(function() {
    // Initialize Cloud Firestore through firebase
   console.log('Persistence Enabled');
})
.catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
    	alert('enablePersistence - failed-precondition');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
    	alert('enablePersistence - unimplemented');
    }
});

db = firebase.firestore();
// console.log('updated form - ' + currentFormID);


$.fn.values = function(data) {
   var inps = $(this).find(":input").get();

    if(typeof data != "object") {
       // return all data
        data = {};

        $.each(inps, function() {
            if (this.name && (this.checked
                        || /select|textarea/i.test(this.nodeName)
                        || /text|hidden|password/i.test(this.type))) {
                data[this.name] = $(this).val();
            }
        });
        return data;
    } else {
        $.each(inps, function() {
            if (this.name && data[this.name]) {
                if(this.type == "checkbox" || this.type == "radio") {
                    $(this).prop("checked", (data[this.name] == $(this).val()));
                } else {
                    $(this).val(data[this.name]);
                }
            } else if (this.type == "checkbox") {
                $(this).prop("checked", false);
            }
       });
       return $(this);
    }
};


function restoreForm(form, formArray) {
  formArray.forEach(function (pair) {
    var selector = `input[name="${ pair.name }"], textarea[name="${ pair.name }"]`
    var input = $(form).find(selector)
    input.val(pair.value);
  })
}


var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


function checkValueForOther(el) {
	 if($(el).val() =='other') {
		 $(el).closest("li").next().show();
	 } else {
		 $(el).closest("li").next().hide();
		 // checkForCondition(el);
	 }
}

function checkForCondition(el) {
	var name = $(el).attr('name');
	
	if (name === 'groupRecognised') {
		if($(el).val() === 'NO') {
			$('.familyInvolvmentInNGODetailsBlock').hide();
		} else {
			$('.familyInvolvmentInNGODetailsBlock').show();
		}
	} else if (name === 'communityGroupMember'){
		if($(el).val() === 'NO') {
			$('.communityGroupMemberBlock').hide();
		} else {
			$('.communityGroupMemberBlock').show();
		}
	} else if (name === 'typeOfToilet'){
		if($(el).val() === 'none') {
			$('.typeOfToiletBlock').hide();
		} else {
			$('.typeOfToiletBlock').show();
		}
	} else if (name === 'wasteCollectionAvailable'){
		if($(el).val() === 'NO') {
			$('.wasteCollectionAvailableBlock').hide();
		} else {
			$('.wasteCollectionAvailableBlock').show();
		}
	} else if (name === 'anganwadiHeightMeasured'){
		if($(el).val() === 'NO') {
			$('.anganwadiHeightMeasuredBlock').show();
		} else {
			$('.anganwadiHeightMeasuredBlock').hide();
		}
	} else if (name === 'childrenEnrolledInSchool'){
		if($(el).val() === 'YES') {
			$('.childrenEnrolledInSchoolYesBlock').show();
			$('.childrenEnrolledInSchoolNoBlock').hide();
		} else {
			$('.childrenEnrolledInSchoolYesBlock').hide();
			$('.childrenEnrolledInSchoolNoBlock').show();
		}
	} else if (name === 'childrenDroppedOutOfSchool'){
		if($(el).val() === 'YES') {
			$('.childrenDroppedOutOfSchoolBlock').show();
		} else {
			$('.childrenDroppedOutOfSchoolBlock').hide();
		}
	} else if (name === 'childrenBelow14Working'){
		if($(el).val() === 'YES') {
			$('.childrenBelow14WorkingBlock').show();
		} else {
			$('.childrenBelow14WorkingBlock').hide();
		}
	} else if (name === 'youthAttendingCollege'){
		if($(el).val() === 'YES') {
			$('.youthAttendingCollegeYesBlock').show();
			$('.youthAttendingCollegeNoBlock').hide();
		} else {
			$('.youthAttendingCollegeYesBlock').hide();
			$('.youthAttendingCollegeNoBlock').show();
		}
	} else if (name === 'youthSkillTraining'){
		if($(el).val() === 'YES') {
			$('.youthSkillTrainingBlock').show();
		} else {
			$('.youthSkillTrainingBlock').hide();
		}
	} else if (name === 'youthSkillTrainingJobSecured'){
		if($(el).val() === 'NO') {
			$('.youthSkillTrainingJobSecuredBlock').show();
		} else {
			$('.youthSkillTrainingJobSecuredBlock').hide();
		}
	}
	
}

function checkSettlement(el) {
	if($(el).val() =='Ambujwadi_Comic_Relief' || $(el).val() =='Nalasopara_Comic_Relief') {
		$('#section_4').hide();
		$('#section_5').hide();
		$('#section_6').hide();
	} else {
		$('#section_4').show();
		$('#section_5').show();
		$('#section_6').show();
	}
}


// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


$$('a').on('click', function (e) { //Close panel when you open a new page
    myApp.closePanel();
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
});

var autoSaveDuration = 10000;
var lang = "ENGLISH";

myApp.onPageInit('survey', function (page) {
 // myApp.alert('Notification closed');
 
	// setTimeout(autoSaveFormData, autoSaveDuration);
	if(currentFormObj.data != null)
		myApp.formFromData('#surveyForm', currentFormObj.data);
	
	//addFamilyMember();
	console.log('init survey');
	
	
	
	setLanguageText();
	
	//$('.familyMemberName').change( function() {
	//	$(this).closest('.memberItemHeading').text($(this).val());
	//});
});

myApp.onPageInit('consent-form', function (page) {
	setLanguageText();
});

function setLanguageText(){
	//console.log('Inside: setLanguageText');
	
	$.getJSON('./translation/language.json', function(data){
		console.log(data.length);
		
		$.each(data, function (index, value) {
			//console.log(this.KEY);
			//console.log(this[lang]);
			$('.' + this.KEY).html(this[lang]);
		});
	});
	
}

function toggleSurveyLanguage() {
	if(lang === "ENGLISH") {
		lang = "HINDI";
	} else {
		lang = "ENGLISH";
	}
				
	setLanguageText();			
}


function submitSurvey(form){
	var formData =  myApp.formToData('#surveyForm'); //var formData = JSON.stringify( $(form).serializeArray() );
	console.log(formData);

	var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));	
	var newList = [];
	
	for (index = 0; index < inProgressList.length; index++) { 
		var obj = inProgressList[index];
		if (obj != null){
			if(obj.formId === currentFormID) {
				obj.data = formData;
				obj.location = formData.settlement;
				obj.endDate = new Date();
				var completedList = JSON.parse(localStorage.getItem('completedList'));
				completedList.push(obj);
				localStorage.setItem('completedList', JSON.stringify(completedList));
			} else {
				newList.push(obj);
			}
		}
	} 
	
	localStorage.setItem('inProgressList', JSON.stringify(newList));
	console.log('Submitted form - ' + currentFormID);
}

myApp.onPageInit('tab', function (page) {
});

myApp.onPageInit('list', function (page) {
    $$('.action1').on('click', function () {
      myApp.alert('Action 1');
    });
    $$('.action2').on('click', function () {
      myApp.alert('Action 2');
    }); 
});

myApp.onPageInit('form', function (page) {

});

myApp.onPageInit('google-map', function (page) {
  var myLatlng = new google.maps.LatLng(19.254751, 72.858143);
  var map;
  var mapOptions = {
    zoom: 12,
    center: myLatlng
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Hello World!'
  });
});

myApp.onPageInit('notifications', function (page) {
    $$('.notification-default').on('click', function () {
      myApp.addNotification({
          title: 'Copernic',
          message: 'This is a simple notification message with title and message'
      });
    });
    $$('.notification-full').on('click', function () {
        myApp.addNotification({
            title: 'Copernic',
            subtitle: 'Notification subtitle',
            message: 'This is a simple notification message with custom icon and subtitle',
            media: '<i class="fa fa-heart"></i>'
        });
    });
    $$('.notification-custom').on('click', function () {
        myApp.addNotification({
            title: 'Copernic',
            subtitle: 'New message from John Doe',
            message: 'Hello, how are you? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut posuere erat. Pellentesque id elementum urna, a aliquam ante. Donec vitae volutpat orci. Aliquam sed molestie risus, quis tincidunt dui.',
            media: '<img width="44" height="44" style="border-radius:100%" src="http://img4.wikia.nocookie.net/__cb20130920142351/simpsons/images/e/e9/Pic_1187696292_8.jpg">'
        });
    });
    $$('.notification-callback').on('click', function () {
        myApp.addNotification({
            title: 'My Awesome App',
            subtitle: 'New message from John Doe',
            message: 'Hello, how are you? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut posuere erat. Pellentesque id elementum urna, a aliquam ante. Donec vitae volutpat orci. Aliquam sed molestie risus, quis tincidunt dui.',
            media: '<img width="44" height="44" style="border-radius:100%" src="http://img4.wikia.nocookie.net/__cb20130920142351/simpsons/images/e/e9/Pic_1187696292_8.jpg">',
            onClose: function () {
                myApp.alert('Notification closed');
            }
        });
    });      
});

myApp.onPageInit('calendar', function (page) {
    // Default
      var calendarDefault = myApp.calendar({
          input: '#calendar-default',
      });
      // With custom date format
      var calendarDateFormat = myApp.calendar({
          input: '#calendar-date-format',
          dateFormat: 'DD, MM dd, yyyy'
      });
      // With multiple values
      var calendarMultiple = myApp.calendar({
          input: '#calendar-multiple',
          dateFormat: 'M dd yyyy',
          multiple: true
      });
      // Inline with custom toolbar
      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
      var calendarInline = myApp.calendar({
          container: '#calendar-inline-container',
          value: [new Date()],
          weekHeader: false,
          toolbarTemplate: 
              '<div class="toolbar calendar-custom-toolbar">' +
                  '<div class="toolbar-inner">' +
                      '<div class="left">' +
                          '<a href="#" class="link icon-only"><i class="fa fa-chevron-left"></i></a>' +
                      '</div>' +
                      '<div class="center"></div>' +
                      '<div class="right">' +
                          '<a href="#" class="link icon-only"><i class="fa fa-chevron-right"></i></a>' +
                      '</div>' +
                  '</div>' +
              '</div>',
          onOpen: function (p) {
              $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
              $$('.calendar-custom-toolbar .left .link').on('click', function () {
                  calendarInline.prevMonth();
              });
              $$('.calendar-custom-toolbar .right .link').on('click', function () {
                  calendarInline.nextMonth();
              });
          },
          onMonthYearChangeStart: function (p) {
              $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
          }
});
});

myApp.onPageInit('chat', function (page) {
    var conversationStarted = false;
 
// Init Messages
var myMessages = myApp.messages('.messages', {
  autoLayout:true
});
 
// Init Messagebar
var myMessagebar = myApp.messagebar('.messagebar');
 
// Handle message
$$('.messagebar .link').on('click', function () {
  // Message text
  var messageText = myMessagebar.value().trim();
  // Exit if empy message
  if (messageText.length === 0) return;
 
  // Empty messagebar
  myMessagebar.clear()
 
  // Random message type
  var messageType = (['sent', 'received'])[Math.round(Math.random())];
 
  // Avatar and name for received message
  var avatar, name;
  if(messageType === 'received') {
  }
  // Add message
  myMessages.addMessage({
    // Message text
    text: messageText,
    // Random message type
    type: messageType,
    // Avatar and name:
    // Day
    day: !conversationStarted ? 'Today' : false,
    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
  })
 
  // Update conversation flag
  conversationStarted = true;
});                
});

myApp.onPageInit('checkbox', function (page) {
});

myApp.onPageInit('radio', function (page) {
});

myApp.onPageInit('login-screen', function (page) {
  var pageContainer = $$(page.container);
  pageContainer.find('.button-round').on('click', function () {
    var username = pageContainer.find('input[name="username"]').val();
    var password = pageContainer.find('input[name="password"]').val();
    // Handle username and password
    myApp.alert('Username: ' + username + ', Password: ' + password, function () {
    });
  });
});   

myApp.onPageInit('404', function (page) { 
  
});

myApp.onPageInit('userlist', function (page) { 
});

myApp.onPageInit('feed', function (page) { 
});

myApp.onPageInit('grid', function (page) { 
});

myApp.onPageInit('cards', function (page) { 
});

myApp.onPageInit('blog', function (page) {
$$('#stickySocial').find('#stickyBtn').each(function(){
  var $el = $$(this);
  var ssCount = $el.data("count");
  var ssClass = $el.attr("class").split(' ')[0];
  $$('.'+ssClass+' .count').html(ssCount);
});
});

myApp.onPageInit('article', function (page) {
$$('#stickySocial').find('#stickyBtn').each(function(){
  var $el = $$(this);
  var ssCount = $el.data("count");
  var ssClass = $el.attr("class").split(' ')[0];
  $$('.'+ssClass+' .count').html(ssCount);
});
});

myApp.onPageInit('gallery', function (page) {
  var mySwiper = new Swiper('.swiper-container', {
  preloadImages: false,
  lazyLoading: true,
  pagination: '.swiper-pagination'
})
});

myApp.onPageInit('video', function (page) {
});

myApp.onPageInit('contact', function (page) {
  var myLatlng = new google.maps.LatLng(48.852873, 2.343627);
  var map;
  var mapOptions = {
    zoom: 11,
    center: myLatlng,
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas-contact'),
      mapOptions);
      var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Hello World!'
  });
/*
--------------------------------
Ajax Contact Form
--------------------------------
+ https://github.com/pinceladasdaweb/Ajax-Contact-Form
+ A Simple Ajax Contact Form developed in PHP with HTML5 Form validation.
+ Has a fallback in jQuery for browsers that do not support HTML5 form validation.
+ version 1.0.1
+ Copyright 2014 Pedro Rogerio
+ Licensed under the MIT license
+ https://github.com/pinceladasdaweb/Ajax-Contact-Form
*/

    var $form = $('#contact-form');

      $form.find('.button-round').on('click', function (e) {
        // remove the error class
        $('.form-group').removeClass('has-error');
        $('.help-block').remove();

        // get the form data
        var formData = {
            'name' : $('input[name="form-name"]').val(),
            'email' : $('input[name="form-email"]').val(),
            'subject' : $('input[name="form-subject"]').val(),
            'message' : $('textarea[name="form-message"]').val()
        };

        // process the form
        $.ajax({
            type : 'POST',
            url  : 'process.php',
            data : formData,
            dataType : 'json',
            encode : true
        }).done(function (data) {
            // handle errors
            if (!data.success) {
                if (data.errors.name) {
                    $('#name-field').addClass('has-error');
                    $('#name-field').find('.item-input').append('<span class="help-block">' + data.errors.name + '</span>');
                }

                if (data.errors.email) {
                    $('#email-field').addClass('has-error');
                    $('#email-field').find('.item-input').append('<span class="help-block">' + data.errors.email + '</span>');
                }

                if (data.errors.subject) {
                    $('#subject-field').addClass('has-error');
                    $('#subject-field').find('.item-input').append('<span class="help-block">' + data.errors.subject + '</span>');
                }

                if (data.errors.message) {
                    $('#message-field').addClass('has-error');
                    $('#message-field').find('.item-input').append('<span class="help-block">' + data.errors.message + '</span>');
                }
            } else {
                // display success message
                $form.html('<div class="content-block">' + data.message + '</div><p><a href="index.html" class="button button-round">Back</a></p>');
            }
        }).fail(function (data) {
            // for debug
            console.log(data)
        });

        e.preventDefault();
    });
  });


myApp.onPageInit('typo', function (page) {
});

myApp.onPageInit('button', function (page) {
});

myApp.onPageInit('colors', function (page) {
});

myApp.onPageInit('feature', function (page) {
});

$$(document).on('page:beforeremove', function (e) {
    var page = e.detail.page;
    // Code for About page
    if (page.name === 'survey') {
       console.log('Page destroyed survey');
    }
    // Code for Services page
    if (page.name === 'services') {
        myApp.alert('Here comes our services!');
    }
});

function deleteFormItem(element, listName, divName) {
	var r = confirm("Are you sure want to delete this item?");
	if (r == false) {
	  return;
	}

	var id = $(element).parent().parent().attr('id');
	console.log('(New) Delete form: ' + id);
	
	var inProgressList = JSON.parse(localStorage.getItem(listName));
	var newList = [];
	for (index = 0; index < inProgressList.length; index++) { 
		var obj = inProgressList[index];
		if (obj != null){
			if(obj.formId === id) {
				 // Do nothing
				 // console.log('Delete form: ' + obj.formId);
				 $('#' + id).hide('slow', function(){ $('#' + id).remove(); });
			} else {
				newList.push(obj);
			}
			
		}
	} 
	
	if(newList.length == 0) {
		$('#' + divName).hide('slow');
	}
	
	localStorage.setItem(listName, JSON.stringify(newList));
}

function deleteInprogressForm(element) {
	return deleteFormItem(element, 'inProgressList', 'inCompleteFormsBlock');
}


function deleteCompletedForm(element) {
	return deleteFormItem(element, 'completedList', 'completedFormsBlock');
}

function resumeForm(element) {
	var id = $(element).parent().parent().attr('id');
	
	console.log('Resume form: ' + id);

	var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));
	for (index = 0; index < inProgressList.length; index++) { 
		var obj = inProgressList[index];
		if (obj != null){
			if(obj.formId === id) {
				console.log('Resume form: ' + JSON.stringify(obj));
				currentFormObj = obj;
				currentFormID = obj.formId;
			}
		}
	}
}

function resumeCompletedForm(element) {
	var r = confirm("Are you sure want to edit this item?");
	if (r == false) {
	  return;
	}
	
	var id = $(element).parent().parent().attr('id');
	
	console.log('Resume Completed form: ' + id);

	var completedList = JSON.parse(localStorage.getItem('completedList'));
	var newList = [];
	for (index = 0; index < completedList.length; index++) { 
		var obj = completedList[index];
		if (obj != null){
			if(obj.formId === id) {
				console.log('Resume form: ' + JSON.stringify(obj));
				currentFormObj = obj;
				currentFormID = obj.formId;
				
				var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));
				inProgressList.push(obj);
				localStorage.setItem('inProgressList', JSON.stringify(inProgressList));
			} else {
				newList.push(obj);
			}
		}
	}
	
	localStorage.setItem('completedList', JSON.stringify(newList));
}


myApp.onPageInit('home', function (page) {
	//setTimeout("Func1()", 3000);
	Func1();
	checkUUID();
	initInProgressList();
	initCompletedList();
	
	// TEST
	// var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));
	// localStorage.setItem('completedList', JSON.stringify(inProgressList));
	// TEST	
		
	showInProgressList();
	showCompletedList();
});


//And now we initialize app
myApp.init();


function showInProgressList() {
	var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));	
	
	console.log('inProgressList length - ' + inProgressList.length);
	var html = '';
	var showInProgressList = false;
	for (index = 0; index < inProgressList.length; index++) { 
	    showInProgressList = true;
		var obj = inProgressList[index];
		if (obj != null){
				html += '<li class="swipeout" id='+ obj.formId +'>' +
							'<div class="swipeout-content item-content">' +
							'	<div class="item-inner">' +
							'		<div class="item-title">FORM ID: ' + obj.formId + '</div>' +
							'		<div ><p class="color-gray">'+ dateFormat(obj.starteDate, "dd-mmm-yy, h:MM:ss TT") +'&nbsp;&nbsp;&nbsp;</p></div>' +
							'	</div>' +
							'</div>' +
							'<div class="swipeout-actions-right">' +
							'	<a href="#" class="action1 bg-orange" onclick="deleteInprogressForm(this)">Delete</a>' +
							'	<a href="survey.html" class="action2" onclick="resumeForm(this)">Resume</a>' +
							'</div>' +
						'</li>';
			console.log('form list - ' + obj.formId);
		}
	} 
	
	
	if (showInProgressList) {
		$('#inCompleteFormsBlock').show();
		$('#inCompleteFormsList').html(html);
	} else {
		$('#inCompleteFormsBlock').hide();
	}
}

function showCompletedList() {
	var completedList = JSON.parse(localStorage.getItem('completedList'));	
	
	console.log('completedList length - ' + completedList.length);
	var html = '';
	var showCompletedList = false;
	for (index = completedList.length - 1; index >= 0; index--) { 
	    showCompletedList = true;
		var obj = completedList[index];
		if (obj != null){
				html += '<li class="swipeout" id='+ obj.formId +'>' +
							'<div class="swipeout-content item-content">' +
							'	<div class="item-inner">' +
							'		<div class="item-title">FORM ID: ' + obj.formId + '</div>' +
							'		<div ><p class="color-gray">'+ dateFormat(obj.starteDate, "dd-mmm-yy, h:MM:ss TT") +'&nbsp;&nbsp;&nbsp;</p></div>' +
							'	</div>' +
							'</div>' +
							'<div class="swipeout-actions-right">' +
							'	<a href="#" class="action1 bg-orange" onclick="deleteCompletedForm(this)">Delete</a>' +
							'	<a href="survey.html" class="action2" onclick="resumeCompletedForm(this)">Edit</a>' +
							'</div>' +
						'</li>';
			console.log('form list - ' + obj.formId);
		}
	} 
	
	
	if (showCompletedList) {
		$('#completedFormsBlock').show();
		$('#completedFormsList').html(html);
	} else {
		$('#completedFormsBlock').hide();
	}
}

function addFamilyMember() {
	var block = $("#familyMemberAccordion").clone();
	block.find(".memberItemHeading").text("Member " + ($('.familyMember').length));
	//block.attr("id", "");
	block.find('input').each(function() {
		this.name= this.name.replace('[0]', '['+ $('.familyMember').length +']');
	});
	$("#familyMemberAccordion").parent().append(block.attr("id", "").show());
}
 


function initInProgressList() {
	// var inProgressList = localStorage.getItem('inProgressList');
	
	if (localStorage.getItem('inProgressList') == null) {
		var dummyList = [];
		localStorage.setItem('inProgressList', JSON.stringify(dummyList));
	}	
}

function initCompletedList() {
	if (localStorage.getItem('completedList') == null) {
		var dummyList = [];
		localStorage.setItem('completedList', JSON.stringify(dummyList));
	}	
}
	
function checkUUID() {
	var uuid = localStorage.getItem('uuid');
	if(uuid == null) {
		uuid  = uuidv4();
		localStorage.setItem('uuid', uuid);
		console.log("New UUID generated");
	}
	
	console.log(uuid);
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function generateFormNo() {
  return Math.random().toString(36).substr(2, 9);
}

function proceedToSurvey(e) {
  startNewSurvey($('#consentGivenBy').val());
}

function startNewSurvey(consentGivenBy){
	var formNo = generateFormNo();
	currentFormID = formNo;
	
	var formObj = {
		formId: formNo,
		starteDate: new Date(),
		endDate: null,
		lastUpdate: new Date(),
		data: null,
		consentGivenBy: consentGivenBy
	};
	
	currentFormObj = formObj;
	
	var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));
	inProgressList.push(formObj);
	// pushToArray(inProgressList, formObj);
	
	localStorage.setItem('inProgressList', JSON.stringify(inProgressList));
	// console.log(formNo);
}

function pushToArray(arr, obj) {
    const index = arr.findIndex((e) => e.id === obj.id);

    if (index === -1) {
        arr.push(obj);
    } else {
        arr[index] = obj;
    }
}


function autoSaveFormData(){
	var formData =  myApp.formToData('#surveyForm'); 
	currentFormObj.data = formData;
	console.log(formData);

	var inProgressList = JSON.parse(localStorage.getItem('inProgressList'));	
	var newList = [];
	for (index = 0; index < inProgressList.length; index++) { 
		var obj = inProgressList[index];
		if (obj != null){
			if(obj.formId === currentFormID) {
				obj.data = formData;
				obj.lastUpdate = new Date();
			}
			
			newList.push(obj);
		}
	} 
	
	localStorage.setItem('inProgressList', JSON.stringify(newList));
	console.log('new updated form - ' + currentFormID);
	
	
	myApp.addNotification({
		  title: 'Saved Form Data',
		  message: 'Form has been saved to local device'
	});
}

function syncDataToServer() {
	var completedList = JSON.parse(localStorage.getItem('completedList'));	
	var newList = [];
	
	for (index = 0; index < completedList.length; index++) { 
		var obj = completedList[index];
		if (obj != null){
			// set(obj, {merge: true})
			db.collection(obj.location).doc(obj.formId).set(obj).then(function() {
			    console.log("Document successfully written!");
			    // newList.push(obj);
			});
		}
	 }
	
	localStorage.setItem('completedList', JSON.stringify(newList));
	
	showCompletedList();
}	

function Func1() { 
	$$("#cover").hide();
}
