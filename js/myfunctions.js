var navOptions = {enableHighAccuracy:true, timeout:10000, maximumAge:180000};
var locationID ; // we will use this to store watchPosition s id so we can cancel it when we want.
var user;
var client = new XMLHttpRequest(); // prepare asynchronous request javascript client (ajax), this will be used to save a post (and upload an image)

var online = navigator.onLine; // navigator.onLine contains boolean value for if you have network connection or not

window.addEventListener('online', function(){ // when you become online
   online = true;
    alert('you are online');
});

window.addEventListener('offline', function(){ // when you become offline
    online = false;
    alert('you are offline');
});

window.addEventListener('load',function(){
    FastClick.attach(document.body); // this will attach and activate fastclick hack

    locationID = navigator.geolocation.watchPosition(watchLocation, locationError, navOptions);
    // start detecting our location when application loaded

    user = JSON.parse(sessionStorage.getItem('user')); // we have stored user object as text in session once we logged in, now when this page loading we are reading what was stored, and convert that to javascript object
    // this object already has id property

    if(user == null)
    {
        document.location.href = "index.html";
    }
});

$('#home').on('pageshow',function(){

    getPosts();

});

$('#sendBtn').on('click', function(){ sendPost(); }); // in addpost page if we click send button we will call sendPost function

function sendPost(){
    var content = $('#postContent').val(); // get post content
    var file = document.getElementById('postPhoto'); // get file element
    var formData = new FormData(); // prepare a new form

    formData.append('postContent', content); // append content into this new form
    formData.append('postAuthorID', user.id); // append user id into form
    formData.append('postLat', user.lat); // append element named postLat and put user's latitute value
    formData.append('postLong', user.long);

    if(file.files[0]) // if there is a photo
    {
        formData.append('postPhoto', file.files[0]);  // append photo file into form
    }

    client.upload.onprogress = function(progressEvent)
    {
        $('#loader').show();

        if(progressEvent.lengthComputable){
            var perc = Math.floor(progressEvent.loaded / progressEvent.total*100);
            $('#points').css('width', perc*0.9+"%");
            $('#points').html(perc+"% done");
        }
    };

    client.open("POST","http://vancouverwebschool.com/webblog/admin/handler.php?addPost", true); // open socket
    client.send(formData); // sending form to server
} // end of sendPost function

client.onreadystatechange= function()  // listening ajax communication state changes
{
    if(client.readyState == 4 && client.status == 200) // when there is a result for savePost (success)
    {
        $('#loader').hide();

        var data = JSON.parse(client.responseText); // receiving server's answer and convert to json object
        if(data.result == true) // if post saved successfully
        {
            alert(data.msg);
            $('#postContent').val('');
            $('#postPhoto').val('');
            $('#points').css('width','0'); // resetting progress bar

            $(":mobile-pagecontainer").pagecontainer("change","panel.html",{reload:true});
        }
        else // if saving post failed
        {
            alert(data.msg);
        }
    }

}




function watchLocation(position)
{
    user.lat = position.coords.latitude;
    user.long = position.coords.longitude;
}
function locationError(e)
{
    switch (e.code)
    {
        case 0: alert('Something went wrong '+ e.message);
            break;
        case 1: alert('You denied permission to retrieve a location');
            break;
        case 2: alert('Browser was unable to retrieve your location');
            break;
        case 3: alert('Browser timed out before retrieving the location');
            break;
    }
}



function getPosts(){


    $.ajax({
        url:"http://vancouverwebschool.com/webblog/admin/handler.php",
        cache:false,
        data:{getPosts:true},
        dataType: "JSON",
        type:"GET",
        timeout:3000,
        success: function(records)
        {
            if(records.result == false)
            {
                alert(records.msg);
            }
            else
            {
                var content = "";

                $('#home .ui-content').html(''); // remove all existing article elements from home page

                $(records.data).each(function(index, row){
                    content += '<article class="ui-body ui-body-a ui-corner-all">';
                    content += '<h4>From: '+ row.userName+ ' <span class="articleDate">@ '+ row.date+'</span></h4>';
                    content += '<p>';
                    if(row.filename != null)
                    {
                        content += '<img src="http://vancouverwebschool.com/webblog/photos/'+row.filename+'" >';
                    }
                    content += row.content + '</p></article>';

                }); // end of each loop
                $('#home .ui-content').html(content);
            }
        }
    })

}