/*******************************************************
 *
 *     OOP Globals
 *
 ******************************************************/
 var globalSagolUtils;
 var globalUtils;

/*******************************************************
 *
 *     Helper Globals
 *
 ******************************************************/
 var globalPortal = null;
 var globalPortalUser = null;
 var globalCurrentGroupTitle = null;
 var globalProtalUserGroups = null;
 var globalConfigResponse = null;
 var globalCurrentItem = null;
 var debugMode = true;
 var appId = "abe5a0dc832a42d384c33bc6bfc6a590";

/*******************************************************
 *
 *     !!!  Initial Event Listeners !!!
 *
 ******************************************************/
 require(["esri/arcgis/Portal", "app/OAuthHelper", "dojo/dom-style", "dojo/dom-attr", "dojo/dom", "dojo/_base/array", "dojo/domReady!"], function(esriPortal, OAuthHelper, domStyle, domAttr, dom, arrayUtils) {

    //An object is created from the URL for parsing the correct
    //AppId below
    var urlObject = esri.urlToObject(document.location.href);

    //Set OAuth
    OAuthHelper.init({
        appId : "EAZUjGyQBcdcRRD5",
        portal : "http://www.arcgis.com",
        expiration : (14 * 24 * 60), // 2 weeks, in minutes (14 * 24 * 60)
        popup : false
    });

    //Prepare Sign Out Button
    $("#signOutBtn").click(function() {
        OAuthHelper.signOut();
    });
    if (OAuthHelper.isSignedIn()) {
        console.log("I am signed in.");
        dojo.addOnLoad(appLoader);
    } else {

        // Logged Out View
        domStyle.set("loggedOutView", "display", "block");
        domStyle.set("loggedInView", "display", "none");
        console.log("prepping to sign in");
        //Sign in to AGOL
        OAuthHelper.signIn().then(function() {
            console.log("The then for the sign in");
            dojo.addOnLoad(appLoader);
        });
    }

    /*******************************************************
     *
     *     Parse Configuration file and Set Intial Vars
     *
     ******************************************************/
     function initializeApplication() {

        new esriPortal.Portal("https://www.arcgis.com").signIn().then(function(portalUser) {
            console.log("here");
            //Set default UI settings
            $("#customUserNameContainer").html(portalUser.fullName);
            domStyle.set("loggedInView", "display", "block");
            domStyle.set("loggedOutView", "display", "none");

            //Bind vars to helper globals for access in other modules
            globalPortalUser = portalUser;
            globalPortal = new esriPortal.Portal("https://www.arcgis.com");

            $("#updateUrlBtn").on('click',function(e)
            {
                console.log($("#itemSelect"));
                console.log("click");
                var postUrl = globalPortal.portalUrl + "content/users/"+ globalPortalUser.username + "/items/" + itemId + "/update";
                //console.log(postUrl);
                $.post(postUrl,{f:"json",title:"testingTesting",token:globalPortalUser.credential.token}).done(function(data)
                {
                    console.log(data);
                });
            });
            //Get the groups for the user and then
            //callt he parsing logic
            $("#nameParagraph").append("Welcome " + portalUser.fullName);
            $("#folderSelect").on('change',function(e)
            {
                var selectedItem = e.target.options[e.target.selectedIndex].text;
                var folderId;
                if(e.target.options[e.target.selectedIndex].attributes["agolId"]){
                    folderId = e.target.options[e.target.selectedIndex].attributes["agolId"].value;
                }
                    
                portalUser.getItems(folderId).then(function(items)
                {
                    var htmlForInsert;
                    $("#itemSelect").empty();
                    for(var i = 0; i < items.length; i++)
                    {
                        
                        if((items[i].type === "Map Service" || items[i].type === "Feature Service") && items[i].sourceUrl)
                        {                
                            htmlForInsert += "<option agolId='" + items[i].id +"'>";
                            htmlForInsert +=  items[i].title;
                            htmlForInsert += "</option>";
                        }
                    }
                    $("#itemSelect").append(htmlForInsert);
                });      
            });

            $("#itemSelect").on('change',function(e)
            {
                var itemId = e.target.options[e.target.selectedIndex].attributes["agolId"].value;
                globalPortalUser.getItem(itemId).then(function(item)
                {
                    console.log(globalPortal);
                    console.log(globalPortalUser);
                    $("#serviceInfoParagraph").html("<div class='titleContainer'><h3>" + item.title + "</h3></div> <div  class='sourceUrlContainer'> <b>Current URL:</b> " + item.sourceUrl + "</div>");  
                });
            });

            portalUser.getFolders().then(function(folders)
            {
                var htmlForInsert = "<option>(Home)</option>";
                $("#folderSelect").empty();
                for(var i = 0; i < folders.length; i++){
                    htmlForInsert += "<option agolId ='"+ folders[i].id +"'>";
                    htmlForInsert +=  folders[i].title;
                    htmlForInsert += "</option>";
                }

                $("#folderSelect").append(htmlForInsert);
            });
        });
    }

    /*******************************************************
     *
     *     !!!  Initial Event Listeners !!!
     *
     ******************************************************/
     function appLoader() {

        var requestHandle = esri.request({
            url : esri.arcgis.utils.arcgisUrl + "/" + appId.replace(/#.*$/, "") + "/data",
            content : {
                f : "json"
            },
            callbackParamName : "callback",
            load : function(configResponse) {
                //globalConfigResponse = configResponse.values;
                //console.log(configResponse);
                initializeApplication();
            }
        });
    }

});
