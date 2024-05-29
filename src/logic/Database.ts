import { DataType } from "./Data";
import { ProgressEmitter, ProgressEvent } from "./ProgressUpdater";

const DATABASE_POSTFIX = "_Database";
const OBJECT_STORE_POSTFIX = "_ObjectStore";
const KEY_PATH_POSTFIX = "_json";

export function get(
    dataType: DataType,
    progressEmitter: ProgressEmitter
): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        const databaseName = getDatabaseName(dataType);
        const objectStoreName = getObjectStoreName(dataType);

        const request = indexedDB.open(databaseName);

        request.onupgradeneeded = (event) => {
            console.log('Creating the Database', databaseName);
            console.log('Creating ObjectStore', objectStoreName);
            const request = event.target as IDBOpenDBRequest
            request.result.createObjectStore(objectStoreName);
        };

        request.onsuccess = (event) => {
            const request = event.target as IDBOpenDBRequest
            const db = request.result;
            const transaction = db.transaction(objectStoreName, "readwrite");
            const objectStore = transaction.objectStore(objectStoreName);

            objectStore.count().onsuccess = event => {
                const count = (event.target as IDBRequest).result as number;

                if (count === 0) {
                    reject();
                    return;
                }

                const jsons = new Array<any>;
                let index = 0;
                progressEmitter.emit({ current: index, total: count } as ProgressEvent)

                const cursorRequest = objectStore.openCursor();
                cursorRequest.onsuccess = (event: Event) => {
                    const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
                    if (cursor !== null) {
                        jsons.push(cursor.value);
                        index++;
                        progressEmitter.emit({ current: index, total: count } as ProgressEvent)
                        cursor.continue();
                    } else {
                        resolve(jsons);
                    }
                };
            };
        };

        request.onerror = _ => {
            reject();
        };
    });
}

export function store(dataType: DataType, jsons: Array<any>) {
    const request = indexedDB.open(getDatabaseName(dataType));

    const objectStoreName = getObjectStoreName(dataType);

    request.onsuccess = (event) => {
        const request = event.target as IDBOpenDBRequest
        const db = request.result;
        const transaction = db.transaction(objectStoreName, "readwrite");
        const objectStore = transaction.objectStore(objectStoreName);
        jsons.forEach((json, index) => {
            objectStore.put(json, getKeyPathName(dataType, index)).onsuccess = _ => {
                console.log('Data stored in Database', dataType, `element ${index + 1} of ${jsons.length}`);
            };
        });
    };
}

function getDatabaseName(dataType: DataType): string {
    return dataType + DATABASE_POSTFIX;
}

function getObjectStoreName(dataType: DataType): string {
    return dataType + OBJECT_STORE_POSTFIX;
}

function getKeyPathName(dataType: DataType, index: number): string {
    return dataType + KEY_PATH_POSTFIX + '_' + index;
}
