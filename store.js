var firebaseConfig = {
apiKey: "AIzaSyAkYHrYWIieJMJenxRW5Nw-MkefYuIT9k4",
authDomain: "covo-theatre.firebaseapp.com",
databaseURL: "https://covo-theatre-default-rtdb.europe-west1.firebasedatabase.app",
storageBucket: "covo-theatre.appspot.com"
};
firebase.initializeApp(firebaseConfig)

var database = firebase.database();

var address = "";

document.getElementById('confermaNft').onclick = function(){
    address = document.getElementById('addressBox').value;
    if (address.charAt(0) == '0' && address.charAt(1) == 'x' && address.length == 42){
        writeUserData(address);
        $("#storeHead").css({
            "zIndex": "2",
            "height": "100%"
            });
            $("#nftDesc").css({
            "opacity": "0"
            });
            setTimeout(() =>{
            $("#sentNFT").css({
                "opacity": "1",
            });
            $("#nftDesc").css({
                "display": "none"
            });
            }, 800);
    } else if (address.charAt(0) != '0' && address.charAt(1) != 'x' && address.length == 40){
        writeUserData(address);
        $("#storeHead").css({
            "zIndex": "2",
            "height": "100%"
            });
            $("#nftDesc").css({
            "opacity": "0"
            });
            setTimeout(() =>{
            $("#sentNFT").css({
                "opacity": "1",
            });
            $("#nftDesc").css({
                "display": "none"
            });
            }, 800);
    } else {
        console.log("Indirizzo non valido");
        document.getElementById('addressBox').value = "Valore errato";
    }
}
document.getElementById('confermaNft').ontouchstart = function(){
    address = document.getElementById('addressBox').value;
    if (address.charAt(0) == '0' && address.charAt(1) == 'x' && address.length == 42){
        writeUserData(address);
        $("#store").css({
        "display": "none"
        });
    } else if (address.charAt(0) != '0' && address.charAt(1) != 'x' && address.length == 40){
        writeUserData(address);
        $("#store").css({
        "display": "none"
        });
    } else {
        console.log("Indirizzo non valido");
        document.getElementById('addressBox').value = "Valore errato";
    }
}

function writeUserData(address) {
    database.ref('Addresses/' + address).set({
        sent: false
    });
    const dbRef = firebase.database().ref();
}

database.ref('Counter').on('value', (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    document.getElementById('nftCounter').innerHTML = data;
});

$('#closeStore, #closeStoreMobile, #closeBar, #closeBarMobile, #closeInfo, #closeInfoMobile').click(function(){
    $("#store, #bar, #infobox").css({
      "display": "none"
    });
});

$('#closeInfo, #closeInfoMobile').click(function(){
    $("#start .infoText").html( "Bentornato all'infopoint!<br>Serve aiuto? Nessun problema, mi trovo qui apposta.<br><br>Cosa vorresti conoscere riguardo l'evento?");
});

$('#closeStore, #closeStoreMobile, #closeBar, #closeBarMobile, #closeInfo, #closeInfoMobile').on("tap", function(){
    $("#store, #bar, #infobox").css({
      "display": "none"
    });
});
