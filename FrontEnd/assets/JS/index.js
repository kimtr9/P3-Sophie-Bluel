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




//**********************Mode édition************************///

//Fonction gestion de mise à jour d'affichage  quand l'utilisateur est connecté (mode édition)
function updateToEditionMode() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token; // Vérifie si le token existe

    const editionBar = document.querySelector('.edition-mode-bar');
    const editProjectsButton = document.querySelector('.projects button');
    const logInLink = document.querySelector('.login-link')
    const filterBar = document.querySelector('.filter-buttons');

    if (editionBar && editProjectsButton) { // Vérifie que les éléments existent
        if (isLoggedIn) {
            console.log('Utilisateur connecté');
            editionBar.style.display = 'block';
            editProjectsButton.style.display = 'block';
            filterBar.style.display = 'none';
            logInLink.innerText = 'logout'
            logInLink.href = '#';

            logInLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token');
                 window.location.reload();
            })
        } else {
            console.log('Utilisateur deconnecté')
            editionBar.style.display = 'none';
            editProjectsButton.style.display = 'none';
            filterBar.style.display = 'flex';
            logInLink.innerText = 'login';
            logInLink.href = 'login.html';
        }
} else {
    console.error('Eléments non trouvés');
}}


document.addEventListener('DOMContentLoaded', () => {
    updateToEditionMode();
});

