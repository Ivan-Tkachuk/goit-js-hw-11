import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '32771721-a281e265f6f888e53b408a54b';
const BASE_URL = 'https://pixabay.com/api/';
const itemsPerPage = 40;

let page = 1;
let searchItem;
let total;
let gallerySimpleLightbox;

const refs = {
  searchForm: document.querySelector('.search-form'),
  articlesContainer: document.querySelector('.gallery'),
  // btnLoadMore: document.querySelector('.load-more'),
  guard: document.querySelector('.js-guard'),
};

refs.searchForm.addEventListener('submit', onSearch);
// refs.btnLoadMore.addEventListener('click', onBtnLoad);

const observerOptions = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

async function ringsApi() {
  const resp = await axios.get(
    `${BASE_URL}?key=${KEY}&q=${searchItem}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${itemsPerPage}&page=${page}`
  );
  return resp;
}

function onSearch(e) {
  e.preventDefault();
  removeList();
  observer.unobserve(refs.guard);

  // refs.btnLoadMore.hidden = true;
  searchItem = e.currentTarget.elements.searchQuery.value;
  page = 1;

  onBtnCreateMarkup();
}

async function onBtnCreateMarkup() {
  try {
    const res = await ringsApi();
    total = res.data.totalHits;
    onSuccess();
    createMarkup(res.data.hits);
    observer.observe(refs.guard);
    // if (res.data.totalHits > itemsPerPage) {
    //   refs.btnLoadMore.hidden = false
    // }
    if (res.data.totalHits == 0) {
      page = 1;
      onError();
      // refs.btnLoadMore.hidden = true;
    }
  } catch (err) {
    console.log(err);
  }
}

async function onLoad() {
  try {
    const res = await ringsApi(page);
    gallerySimpleLightbox.destroy();
    createMarkup(res.data.hits);
    const totalPages = Math.ceil(res.data.totalHits / itemsPerPage);
    // refs.btnLoadMore.hidden = false;
    if (page > 1) {
      smoothScroll();
    }
    if (page === totalPages) {
      // refs.btnLoadMore.hidden = true;
      onNoMorePicture();
      observer.unobserve(refs.guard);
    }
  } catch (err) {
    console.log(err);
  }
}

function createMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
     <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}"  width="320" height="240" loading="lazy"/></a>
     <div class="info">
       <p class="info-item">
         <b>Likes</b>
         ${likes}
       </p>
       <p class="info-item">
         <b>Views</b>
         ${views}
       </p>
       <p class="info-item">
         <b>Comments</b>
         ${comments}
       </p>
       <p class="info-item">
         <b>Downloads</b>
         ${downloads}
       </p>
     </div>
   </div>`
    )
    .join('');

  refs.articlesContainer.insertAdjacentHTML('beforeend', markup);

  gallerySimpleLightbox = new SimpleLightbox('.gallery a');
}

// function onBtnLoad() {
//   page += 1;
//    refs.btnLoadMore.hidden = true;
//    onLoad();
// }

function removeList() {
  while (refs.articlesContainer.firstChild) {
    refs.articlesContainer.removeChild(refs.articlesContainer.firstChild);
  }
}

function onError(error) {
  removeList();
  Notiflix.Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
}

function onNoMorePicture(warning) {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function onSuccess(success) {
  Notiflix.Notify.success(
    `Hooray! We found ${total} images.`
  );
}


function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const observer = new IntersectionObserver(onInfinityLoad, observerOptions);
function onInfinityLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      onLoad();
    }
  });
}
