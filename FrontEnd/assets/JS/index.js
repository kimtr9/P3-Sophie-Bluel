
//Variables globales 
let works = [];
let categories = [];
let modal = null 
const token = localStorage.getItem('token')


//////**************PAGE DE PRESENTATION********************/////

//Récupération des travaux de l'API
async function getWorks () {
    try {
        const response = await fetch ('http://localhost:5678/api/works');
        works = await response.json(); 
    } catch (error) {
        console.log('Erreur fetch works', error);

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

//même fonction pour afficher works ou filteredWorks
function displayGallery(filteredWorks = works, container = '.gallery')  {
    //vider la galerie HTML
    const HTMLgallery = document.querySelector(container);
    HTMLgallery.innerHTML = '';

    //création de la galerie
    filteredWorks.forEach(work => {
        const figure = document.createElement('figure');
        figure.dataset.imgId = work.id;
        figure.dataset.category = work.categoryId;

        const image = document.createElement('img');
        image.src = work.imageUrl;
        image.alt = work.title;

        const figcaption = document.createElement('figcaption')
        figcaption.textContent = work.title;
    
        //ajout de l'icône de suppression pour la modale
        if (container === '.modal-gallery') {

            const imageContainer = document.createElement('div'); 
            imageContainer.classList.add('image-container');

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fa-solid', 'fa-trash-can', 'delete-icon');

            imageContainer.appendChild(image);
            imageContainer.appendChild(deleteIcon);

            figure.appendChild(imageContainer);
        }else {
            figure.appendChild(image);
        }
        
        figure.appendChild(figcaption);
        HTMLgallery.appendChild(figure);
    });
     // attache écouteurs de clic pour les icônes de suppression
     if (container === '.modal-gallery') {
        attachListenerstoDeleteIcons();
    }
}
    

//Création des boutons de filtre
function createFilterButtons() {
    const filterBar = document.querySelector('.filter-buttons');
    filterBar.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.innerText= 'Tous';
    allButton.addEventListener('click', () => displayGallery(works));
    filterBar.appendChild(allButton);

    //Boutons des catégories
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

//Fonction gestion de mise à jour d'affichage quand l'utilisateur est connecté
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



/////*******************MODALE ***********************//////

//Ouvrir la modale 1
const openModal1 = function (e) {
    e.preventDefault();
    if (modal !== null) {
        closeModal();
    }
    modal = document.querySelector('.js-modal')
    const modal1 = document.getElementById('modal1')

    modal1.style.display = 'block';
    modal1.querySelector('.modal-gallery').innerHTML = ''; // Reinitialiser la galerie
    displayGallery(works, '.modal-gallery'); // Réafficher la galerie

    //afficher modal
    const target = document.querySelector(e.target.getAttribute('href'))
    target.style.display = null;
    target.removeAttribute('aria-hidden')
    target.setAttribute('aria-modal', 'true')
    modal = target;
    modal.addEventListener('click', closeModal)
    //Affichage de la galerie
    displayGallery(works, '.modal-gallery');
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)

    //cacher modal2
    const modal2 = document.getElementById('modal2')
    if (modal2) {
        modal2.style.display = 'none';
    }
   
     // Attacher le click à l'icône X
     const closeButton = document.getElementById('close-modal');
     if (closeButton) {
         closeButton.addEventListener('click', closeModal);
     }
}

const openModalBtn = document.querySelector('.open-modal')
openModalBtn.addEventListener('click', o)



// Fermer la modale
const closeModal = function (e) {
    if(modal === null) return;
    e.preventDefault();
    const modal1 = document.getElementById('modal1');
    const modal2 = document.getElementById('modal2');
    modal1.style.display = 'none';
    modal2.style.display = 'none';

    modal = document.getElementById('modal');
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.removeEventListener('click', stopPropagation);
    modal = null;
}

const stopPropagation = function (e) {
    e.stopPropagation();
}
    
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' ||  e.key === 'Esc') {
        closeModal(e)
    }
});



// Fonction pour attacher les écouteurs sur toutes les icônes
function attachListenerstoDeleteIcons() {
    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteWork(e);
        });
    });
}


//Fonction de suppression de l'imagee
async function deleteWork(event) {
    const figure = event.target.closest('figure');
    const imgId = figure.dataset.imgId;

    if (!imgId) {
        console.error('id image non trouvé')
        return;
    }

   try {
    //Requête à l'API
       const response = await fetch(`http://localhost:5678/api/works/${imgId}`, {
           method: 'DELETE',
           headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
       });

       if (response.ok) {
           figure.remove();
           await getWorks();
           displayGallery()
       } else {
        console.error('Erreur suppression image')
       }

    } catch (error) {
        console.error('Erreur', error);
    } 
}

// Retour à modal1
const returnToModal1 = function(e) {
    e.preventDefault();
    //afficher modal1
    const modal1 = document.getElementById('modal1');
    modal1.style.display = 'block';
    //cacher modal2
    const modal2 = document.getElementById('modal2');
    modal2.style.display = 'none'
}

   

// Switch modal2
const showModal2 = function(e) {
    e.preventDefault();
    const modal1 = document.getElementById('modal1');
    modal1.style.display = 'none';
    const modal2 = document.getElementById('modal2');
    modal2.style.display = 'block'
    
    //Créer le formulaire
    const formContainer = document.querySelector('.form-container');
    // Vider la modale pour eviter les doublons 
    formContainer.innerHTML = '';
    modal2.innerHTML = '';

    const returnIcon = document.createElement('i')
    returnIcon.className = "fa-solid fa-arrow-left"
    returnIcon.id = 'return-button'
    const closeIcon = document.createElement('i')
    closeIcon.className = "fa-solid fa-xmark";
    closeIcon.id = 'close-upload-modal'

    const title = document.createElement('h2');
    title.id = "title-modal";
    title.textContent  = 'Ajout photo';

    const uploadContainer = document.createElement('div')
    uploadContainer.id = 'upload-container';

    const icon = document.createElement('i')
    icon.className = "fa-regular fa-image";
    icon.style.color = "#c6c8cd";

    const inputFile = document.createElement('input')
    inputFile.type = 'file';
    inputFile.textContent = 'Ajout'
    inputFile.id = 'upload-pic';

    const addPicBtn = document.createElement('button')
    addPicBtn.textContent = ' + Ajouter une photo'
    addPicBtn.id = 'add-pic-btn'

    const subText = document.createElement('p')
    subText.textContent= 'jpg, png : 4mo max'

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.classList.add('input-field');

    const labelTitle = document.createElement('label');
    labelTitle.textContent= 'Titre';
    labelTitle.classList.add('label');

    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    inputCat.classList.add('input-field');

    const labelCat = document.createElement('label');
    labelCat.textContent= 'Catégorie';
    labelCat.classList.add('label');

    const buttonSubmit = document.createElement('button');
    buttonSubmit.id = 'submit-work-btn';
    buttonSubmit.textContent = "Valider";
    
    modal2.appendChild(formContainer)
    formContainer.appendChild(returnIcon)
    formContainer.appendChild(closeIcon)
    formContainer.appendChild(title)
    formContainer.appendChild(uploadContainer)
    uploadContainer.appendChild(icon)
    uploadContainer.appendChild(inputFile)
    uploadContainer.appendChild(addPicBtn)
    uploadContainer.appendChild(subText);
    formContainer.appendChild(labelTitle)
    formContainer.appendChild(inputTitle)
    formContainer.appendChild(labelCat)
    formContainer.appendChild(inputCat)
    modal2.appendChild(buttonSubmit)

    modal2.addEventListener('click', stopPropagation)


    // attacher evenement de retour à l'icone <-
    returnIcon.addEventListener('click', returnToModal1);
    // attacher l'evenement de fermeture au click sur l'icone close
    closeIcon.addEventListener('click', closeModal);

};

// Ecouteur d'evenement sur le bouton vers la modale 2
const addWorkbtn = document.getElementById('add-work-picture')
addWorkbtn.addEventListener('click', showModal2);


// assure que l'événement de retour est correctement attaché
document.getElementById('modal2').addEventListener('click', (e) => {
    if (e.target.id === 'return-icon') {
        returnToModal1(e);
    }
});




    







