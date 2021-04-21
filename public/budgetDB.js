let db;
//TODO: Increment budget each time???
let budgetVersion;

const request = indexedDB.open("BudgetDB", budgetVersion || 2);

request.onupgradeneeded = function (e) {
    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("BudgetStore", { autoIncrement: true });
    }
};

request.onerror = function (e) {
    console.log(`Error! ${e.target.errorCode}`);
};

function checkDatabase() {
    let transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");
    const allRecords= store.getAll();

    allRecords.onsuccess = function () {
        if (allRecords.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allRecords.result),
                headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((res) => {
                if (res.length > 0) {
                transaction = db.transaction(["BudgetStore"], "readwrite");
                const currentStore = transaction.objectStore("BudgetStore");

                currentStore.clear();
                }
            });
        }
    };
}

request.onsuccess = function (e) {
    console.log("success");
    db = e.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");

    store.add(record);
};

window.addEventListener("online", checkDatabase);