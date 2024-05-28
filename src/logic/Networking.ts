import { DataType } from "./Data";

// Alernative API: https://rcdb-api.vercel.app/api/coasters
const ROLLERCOASTERS_URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

const MUSIC_URL = 'https://raw.githubusercontent.com/BachNewton/PWA-Trivia/main/db/music.json';

const POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon?limit=100000';

export async function get(dataType: DataType, optionalUrls?: Array<string>): Promise<any> {
    const urls = optionalUrls === undefined ? [getUrl(dataType)] : optionalUrls;

    console.log('Fetching data for', dataType);
    console.log('Fecthing data from', urls);

    return await getFrom(urls);
}

function getUrl(dataType: DataType): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return ROLLERCOASTERS_URL;
        case DataType.MUSIC:
            return MUSIC_URL;
        case DataType.POKEMON_ALL:
            return POKEMON_URL;
        case DataType.POKEMON:
            return ''; // optional urls should be provided
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getFrom(urls: Array<string>): Promise<Array<any>> {
    return Promise.all(urls.map(url => fetchJson(url)));
}

async function fetchJson(url: string): Promise<any> {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}