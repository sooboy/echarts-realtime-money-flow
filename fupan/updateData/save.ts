import { dealData } from './fetch'
import { createWriteStream } from 'node:fs';

const data =async  () => {
    createWriteStream('data.json').write(JSON.stringify(await dealData()))
}

data()