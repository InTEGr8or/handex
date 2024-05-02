# Codeium Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

**User** _at 10:14 pm, Apr 27, 2024_

I am using `localStorage` to store WPM stats per character for users who play my web-based cli-based typing game. 

Is there a more modern data storage that allows indexing in the browser storage so  I can more efficient story structured data in indexed records that I can loop through or list out or enumerate?

---

**Codeium** _at 10:14 pm, Apr 27, 2024_

Yes, a more modern approach to storing structured data in the browser that allows for indexing and efficient data operations is the `IndexedDB` API. IndexedDB is a low-level API for client-side storage of significant amounts of structured data, including files/blobs. It lets you create, read, navigate, and write to a user's local database. It is more powerful than `localStorage` and is suitable for applications that need to handle various types of data as objects and search through this data using indexes.

Here's a simple example of how to use `IndexedDB`:

```javascript
// Open (or create) the database
var open = indexedDB.open('MyDatabase', 1);

// Create the schema
open.onupgradeneeded = function() {
    var db = open.result;
    var store = db.createObjectStore('MyObjectStore', {keyPath: 'id'});
    var index = store.createIndex('NameIndex', ['name.last', 'name.first']);
};

open.onsuccess = function() {
    // Start a new transaction
    var db = open.result;
    var tx = db.transaction('MyObjectStore', 'readwrite');
    var store = tx.objectStore('MyObjectStore');
    var index = store.index('NameIndex');

    // Add some data
    store.put({id: 12345, name: {first: 'John', last: 'Doe'}, age: 42});
    store.put({id: 67890, name: {first: 'Bob', last: 'Smith'}, age: 35});

    // Query the data
    var getJohn = store.get(12345);
    var getBob = index.get(['Smith', 'Bob']);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
};
```

This example shows how to open a database, create an object store, and an index within that store. It also demonstrates how to add data to the store and query it using both the store's key and the index.

`IndexedDB` is asynchronous and works well within the event-driven model of the web. It allows for significant amounts of data to be stored and efficiently retrieved through indexing, which would suit your use case of storing WPM stats per character. It's supported in all modern browsers, but you should always consider the need for a fallback or polyfill for older browsers if necessary.