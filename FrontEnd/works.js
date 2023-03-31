const reponse = await fetch("http://localhost:5678/api/works");
const works = await reponse.json();


function createGallery(works){
    for(let i=0 ; i<works.length ; i++){
        const card = works[i];

        //Récupération de la classe gallery dans le DOM
        const gallery = document.querySelector(".gallery");
        
        const cardGallery = document.createElement("figure");

        const cardImg = document.createElement("img");
        cardImg.src = card.imageUrl;
        const cardCaption = document.createElement("figcaption");
        cardCaption.innerText = card.title;

        gallery.appendChild(cardGallery);
        cardGallery.appendChild(cardImg);
        cardGallery.appendChild(cardCaption);
    }
}

createGallery(works);

// FILTRES

const buttonTous = document.querySelector(".buttonTous");
buttonTous.addEventListener("click", function(){
    document.querySelector(".gallery").innerHTML="";
    createGallery(works);
});


// problème de lien avec le bouton html
// Il manquait un s à la constante works, vérifier si ça a résolu le problème
const buttonObjets = document.querySelector(".buttonObjets");
buttonObjets.addEventListener("click", function(){
    const objetsFiltres = works.filter(function(objet){
        return objet.categoryId == 1
    });
    document.querySelector(".gallery").innerHTML = "";
    createGallery(objetsFiltres);
});


const buttonAppartements = document.querySelector(".buttonAppartements");
buttonAppartements.addEventListener("click", function(){
    const appartementsFiltres = works.filter(function(appart){
        return appart.categoryId == 2 
    });
    document.querySelector(".gallery").innerHTML = "";
    createGallery(appartementsFiltres);
});

const buttonHotels = document.querySelector(".buttonHotels");
buttonHotels.addEventListener("click", function(){
    const hotelsFiltres = works.filter(function(hotels){
        return hotels.categoryId == 3 
    });
    document.querySelector(".gallery").innerHTML = "";
    createGallery(hotelsFiltres);
});


//Récupération formulaire

const formulaire = document.querySelector(".boutonEnvoi");
formulaire.addEventListener("click", function(){
    const email = document.getElementById("emailLogin");
    console.log(email);
});