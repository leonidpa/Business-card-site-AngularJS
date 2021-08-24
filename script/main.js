/*------CONFIG DATA------------------------------------------------------------------------------*/
var siteApplicationName = "sitename_mainApp";
var ng = ["ngRoute", "ngAnimate"];
var siteMainDataFilePath = "/content/page/main_data.json";
/*------END CONFIG DATA--------------------------------------------------------------------------*/

var __mainPagesAbsolutePath;
var mainPages;
var navigationPath;

/*------Load site data---------------------------------------------------------------------------*/
var jsonhttp = new XMLHttpRequest();
var jsonurl = siteMainDataFilePath;

jsonhttp.onload = function (e) {
	if (jsonhttp.readyState == 4 && jsonhttp.status == 200){
		var siteMainDataJSON = JSON.parse(jsonhttp.responseText);
		if (siteMainDataJSON != null || siteMainDataJSON != 'undefined'){
			__mainPagesAbsolutePath = siteMainDataJSON.__pagesAbsolutePath;
			mainPages = siteMainDataJSON.mainPages;
			navigationPath = [siteMainDataJSON.mainPages[0]];
			preloadImages(siteMainDataJSON.preloadImages, true);
		} else {
			console.log("error : Site data not loaded!");
		}

	}
}
jsonhttp.open("GET", jsonurl, false);
jsonhttp.send();

/*------End load site data-----------------------------------------------------------------------*/

/*--------------Setup site application-----------------------------------------------------------*/                
var app = angular.module(siteApplicationName, ng);

try{
	if (app == null || app == 'undefined')
		throw new AngularMuduleError("\n\tUnable load data!");
}	catch(err)	{
	LogError(err);
}

app.config(function($routeProvider, $compileProvider){
	
	mainPages.forEach(function(page){
		$routeProvider.when(page.Path, {
			templateUrl : __mainPagesAbsolutePath + page.RelativeUrl,
			controller : page.Controller
		});
	});
	$routeProvider.otherwise({redirectTo: mainPages[0].Path});
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|skype|tel|ftp|mailto|chrome-extension):/);
});

/*Controllers--------------------------------------------------------------------------------*/
app.controller('navigationCtrl', function($scope) {
	
	$scope.mainPages = mainPages;
	$scope.navigationPath = navigationPath;
	$scope.trackbase = { imgUrl:"/content/image/icon/icon_row/", imgTitle:"Play" };
});

app.controller("aboutCtrl", function ($scope, $http) {
	ConstructPath("aboutCtrl");
	
	var jsonContentRelativePath = "/about/about.json";
	var jsonContentAbsolutePath = __mainPagesAbsolutePath + jsonContentRelativePath;
	
	function  onSuccess(response){
		var data = response.data;
		var imagesFolderAbsolutePath = "/content/image/technologies/";
		data.Technologies.forEach(function(element) {
			element.ImageRelativePath = imagesFolderAbsolutePath + element.ImageRelativePath;
		});
		$scope.images = data.Technologies;
		$scope.textContent =  data.TextContent;
		$scope.annotations =  data.Annotations;
	}
	
	function onError(response) {
		console.log(response);
	}
	
	$http.get(jsonContentAbsolutePath)
		.then(onSuccess)
		.catch(onError);
});

app.controller("homeCtrl", function ($scope, $http) {
	ConstructPath("homeCtrl");
	
	var jsonContentRelativePath = "/home/home.json";
	var jsonContentAbsolutePath = __mainPagesAbsolutePath + jsonContentRelativePath;
	
	function  onSuccess(response){
		var data = response.data;
		$scope.textContent =  data.TextContent;
		$scope.annotations =  data.Annotations;
	}
	
	function onError(response) {
		console.log(response);
	}
	
	$http.get(jsonContentAbsolutePath)
		.then(onSuccess)
		.catch(onError);
});

app.controller("servicesCtrl", function ($scope, $http) {
	ConstructPath("servicesCtrl")
	
	$http.get(__mainPagesAbsolutePath+"/services/services.json").then(
		function onSuccess(response){
			var data = response.data;
			$scope.services = data.Services;
			$scope.annotations =  data.Annotations;
		}
	).catch(function onError(response) {
		console.log(response);
	});
	
});

app.controller("contactCtrl", function ($scope, $http) {
	ConstructPath("contactCtrl");
	$http.get(__mainPagesAbsolutePath+"/contact/contact.json").then(
		function onSuccess(response){
			var data = response.data;
			$scope.contacts = data.Contacts;
			$scope.annotations =  data.Annotations;
			$scope.email = 'leonid@email.ua';
			var emailObj = data.Contacts.find(element => element.Name == 'email');
			if (emailObj != null && typeof emailObj != 'undefined'){
				$scope.email = emailObj.Data;
			}
			
		}
	).catch(function onError(response) {
		console.log(response);
	});
	$scope.showSending = false;
	$scope.showSendingForm = false;
	$http.get('https://sitenamewebapi.000webhostapp.com').then(
		function onSuccess(response){
			$scope.showSendingForm = true;
			
		}
	).catch(function onError(response) {
		console.log(response);
	});
	$scope.message = '';
	$scope.send = function () {
		if($scope.message != ''){
			$scope.showSending = true;
			var message = {
				To: $scope.email,
				Text: $scope.message
			};
			
			$http({
				method: 'POST',
				url: 'https://sitenamewebapi.000webhostapp.com',
				data: message,
				headers: {
					'Content-Type': 'text/plain;charset=UTF-8'
			}})
            .then(function (response) {
                if (response.status == 200) $scope.message = '';
				$scope.showSending = false;
            }, function (error) {
				$scope.showSending = false;
                alert('Send message error. Try again.');
            });
			
		}
	};
});
/*End Controllers----------------------------------------------------------------------------*/
/*Componets----------------------------------------------------------------------------------*/
app.component('annotation', {
	templateUrl: __mainPagesAbsolutePath + '/annotation/annotation.html',
	/*controller: AnnotationController,*/
	bindings: {
		source: '='
	}
});

app.component('player', {
	templateUrl: __mainPagesAbsolutePath + '/player/player.html',
	/*controller: AnnotationController,*/
	bindings: {
		source: '='
	}
});
/*End Componets------------------------------------------------------------------------------*/
/*--------------End Setup site application-------------------------------------------------------*/
function ConstructPath(controlerName){
	if(controlerName == 'homeCtrl'){
		navigationPath.splice(1, navigationPath.length - 1);
		return;
	}
	
	var page = (mainPages.filter(function(p){return p.Controller == controlerName;}))[0];
	if(navigationPath.indexOf(page) >= 0){
		var indexOfPage = navigationPath.indexOf(page);
		navigationPath.splice(indexOfPage + 1, navigationPath.length - indexOfPage - 1);
	}	else	{
		navigationPath.splice(1, navigationPath.length - 1);
		navigationPath.push(page);
	}
}

document.addEventListener('DOMContentLoaded', function(){ 
	var date =  new Date();
	var year = date.getFullYear();
	document.getElementById("current-year").innerHTML = year;
	
});
function esc(element){
	var items = document.getElementsByClassName('animate-show-hide-top');
	for (i = 0; i < items.length; i++) { 
	items[i].classList.remove("ng-enter-top");
	items[i].classList.remove("ng-enter-top-active");
	items[i].classList.add("ng-leave-top");
	items[i].classList.add("ng-leave-top-active");
		//item.setAttribute("style", "opacity: 0;transition: all linear 0.5s;transform: translateY(-100%);");
	}
	var items = document.getElementsByClassName('animate-show-hide-bottom');
	for (i = 0; i < items.length; i++) { 
	items[i].classList.remove("ng-enter-bottom");
	items[i].classList.remove("ng-enter-bottom-active");
	items[i].classList.add("ng-leave-bottom");
	items[i].classList.add("ng-leave-bottom-active");
		//item.setAttribute("style", "opacity: 0;transition: all linear 0.5s;transform: translateY(100%);");
	}
	element.src = element.src.replace("icon_Esc.png","icon_Enter.png");
	element.title = "Enter";
	element.alt = "Enter";
	element.onclick = function(){ enter(this)};
}
function enter(element){
	var items = document.getElementsByClassName('animate-show-hide-top');
	for (i = 0; i < items.length; i++) { 
	items[i].classList.remove("ng-leave-top");
	items[i].classList.remove("ng-leave-top-active");
	items[i].classList.add("ng-enter-top");
	items[i].classList.add("ng-enter-top-active");
	

		//item.setAttribute("style", "opacity: 1;transition: all linear 0.5s;transform: translateY(0);");
	}
	var items = document.getElementsByClassName('animate-show-hide-bottom');
	for (i = 0; i < items.length; i++) { 
	items[i].classList.remove("ng-leave-bottom");
	items[i].classList.remove("ng-leave-bottom-active");
	items[i].classList.add("ng-enter-bottom");
	items[i].classList.add("ng-enter-bottom-active");

		//item.setAttribute("style", "opacity: 1;transition: all linear 0.5s;transform: translateY(0);");
	}
	element.src = element.src.replace("icon_Enter.png","icon_Esc.png");
	element.title = "Esc";
	element.alt = "Esc";
	element.onclick = function(){ esc(this)};
}




	
