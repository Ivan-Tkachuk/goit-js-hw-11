import './css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import API from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const input = document.getElementById('search-box');
const list = document.querySelector('.country-list');
const info = document.querySelector('.country-info');

console.log('hello');

input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(e) {
  const inputName = e.target.value.trim();
  if (!inputName) {
    return;
  }
  API.fetchCountries(inputName)
    .then(data => createMarkup(data))
    .catch(onFetchError);
}

function createMarkup(arr) {
  const markupList = arr.map(
    ({ name: { official }, flags: { svg } }) =>
      `<li>
<img src="${svg}" alt="${official}" width="25px" height="15px">
<p>${official}</p>
</li>`
  );

  const markupCountry = arr.map(
    ({ name: { official }, flags: { svg }, capital, population, languages }) =>
      `<div>
<img src="${svg}" alt="${official}" width="40px" height="25px">
<h2>${official}</h2>
</div>
<ul>
<li><h3>Capital:</h3><p>${capital.join(', ')}</p></li>
<li><h3>Population:</h3><p>${population}</p></li>
<li><h3>Languages:</h3><p>${Object.values(languages).join(', ')}</p></li>
</ul>`
  );

  if (markupList.length > 10) {
    removeInfo();
    removeList();
    onToMuchResults();
  }
  if (markupList.length > 1 && markupList.length < 10) {
    removeInfo();
    list.innerHTML = markupList.join('');
  }

  if (markupList.length === 1) {
    removeList();
    info.innerHTML = markupCountry.join('');
  }
}

function removeInfo() {
  while (info.firstChild) {
    info.removeChild(info.firstChild);
  }
}

function removeList() {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function onFetchError(error) {
  removeInfo();
  removeList();

  Notiflix.Notify.failure(`There is no country with that name`);
}

function onToMuchResults(warning) {
  Notiflix.Notify.info(
    'Too many matches found! Please enter a more specific name.'
  );
}
