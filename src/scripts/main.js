'use strict';

const BASE_URL = 'https://mate-academy.github.io/phone-catalogue-static/api';

function addMarkup(className, title, data) {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="${className}">
      <h2>${title}</h2>
      <ul>
        ${data.map(item => `<li>${item.id.toUpperCase()}</li>`).join('')}
      </ul>
    </div>
  `);
}

const request = (url) => {
  return fetch(`${BASE_URL}${url}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }

      return response.json();
    });
};

const getFirstReceivedDetails = (phones) => {
  Promise.race(phones.map(id => request(`/phones/${id}.json`)))
    .then(result =>
      addMarkup('first-received', 'First Received', Array.of(result))
    );
};

const getAllSuccessfulDetails = (phones) => {
  Promise.allSettled(phones.map(id => request(`/phones/${id}.json`)))
    .then(result => {
      const settledItems = result
        .filter(item => item.status === 'fulfilled')
        .map(item => item.value);

      addMarkup('all-successful', 'All Successful', settledItems);
    });
};

const getThreeFastestDetails = (phones) => {
  const promises = [];

  for (let i = 0; i < 3; i++) {
    promises.push(Promise.race(
      phones.map(id => request(`/phones/${id}.json`))
    ));
  }

  return promises;
};

request('/phones.json')
  .then(result => {
    const phoneIds = [];

    result.forEach(phone => phoneIds.push(phone.id));

    getFirstReceivedDetails(phoneIds);
    getAllSuccessfulDetails(phoneIds);
    getThreeFastestDetails(phoneIds);
  });
