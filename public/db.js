let db;
// create a new db request for a "BudgetDB" database.
const request = window.indexedDB.open("FitnessDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  // create object store called "FitnessStore" and set autoIncrement to true
  const FitnessStore = db.createObjectStore("FitnessDB", {
    autoIncrement: true});
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode)

};

function saveRecord(record) {
  // create a workout on the pending db with readwrite access
  const workout = db.workout(["FitnessDB"], "readwrite");

  // access your pending object store
  const fitnessStore = workout.objectStore("FitnessDB");

  // add record to your store with add method.
  fitnessStore.add(record);
}

function checkDatabase() {
  // open a workout on your pending db
  let workout = db.workout(["FitnessDB"], "readwrite");
  // access your pending object store
  const fitnessStore = workout.objectStore("FitnessDB");
  // get all records from store and set to a variable
  var getAll = fitnessStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/workout/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // if successful, open a workout on your pending db
          if (data.length > 0) {
           workout = db.workout(["FitnessDB"], "readwrite");
          }
          // access your pending object store
          const newStore = workout.objectStore("FitnessDB");
          // clear all items in your store
          newStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
