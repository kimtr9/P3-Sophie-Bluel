//Variables globales 
let works = [];
let categories = [];



//Récupération des travaux de l'API
async function getWorks () {
    try {
        const response = await fetch ('http://localhost:5678/api/works');
        works = await response.json(); 
    } catch (error) {
        console.log('Erreur fetch works', error);
        // return []

    }}

// Récupération des catégories 
async function getCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories')
        categories = await response.json();
    } catch(error) {
        console.log('Erreur fetch des catégories', error)

    }
}


// Affichage des travaux dans la galerie

//même fonction pour afficher works ou filteredWorks//
function displayGallery(filteredWorks = works)  {
    //vider la galerie HTML
    const HTMLgallery = document.querySelector('.gallery');
    HTMLgallery.innerHTML = '';

    //création de la galerie
    filteredWorks.forEach(work => { 
    const figure = document.createElement('figure');
    figure.dataset.category = work.categoryId;
    
    const image = document.createElement('img');
    image.src = work.imageUrl;
    image.alt = work.title;
    const figcaption = document.createElement('figcaption')
    figcaption.textContent = work.title;
    
    figure.appendChild(image)
    figure.appendChild(figcaption)
    HTMLgallery.appendChild(figure);
    });

} 


//Création des boutons de filtre
function createFilterButtons() {
    const filterBar = document.querySelector('.filter-buttons');
    filterBar.innerHTML = '';

    //Bouton toutes catégories
    const allButton = document.createElement('button');
    allButton.innerText= 'Tous';
    allButton.addEventListener('click', () => displayGallery(works));
    filterBar.appendChild(allButton);

    //Boutons des autres catégories
    categories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category.name;
        button.addEventListener('click', () => {
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayGallery(filteredWorks);
        });
        filterBar.appendChild(button);
    });
}

// Fonction pour lancer la galerie
async function startGallery() {
    await getWorks();
    await getCategories();
    createFilterButtons();
    displayGallery();
}
startGallery();
