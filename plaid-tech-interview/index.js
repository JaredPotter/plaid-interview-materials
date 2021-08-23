let fs = require('fs');

function asciiToByte() {
    const contents = fs.readFileSync('first-round.txt', 'utf8');
    const split = contents.split('\n');

    let arr = [];

    split.forEach((line) => {
        const values = line.substr(1, line.length - 2);
        const numValues = values.split(',');
        const x = Number(numValues[0]);
        const y = Number(numValues[1]);
        const ascii = Number(numValues[2]);

        arr.push(x)
        arr.push(y)
        arr.push(ascii)
    });    

    const buf = Buffer.from(arr);
 
    // for(const byt of buf.values()){
    //     console.log(byt);
    // }

    return buf;
}

function createAsciiArt() {
    const arr = new Array(100);

    for(let i = 0; i < 100; i++) {
        arr[i] = new Array(100);
        arr[i].fill(0);
    }

    const contents = fs.readFileSync('first-round.txt', 'utf8');
    const split = contents.split('\n');

    split.forEach((line) => {
        const values = line.substr(1, line.length - 2);
        const numValues = values.split(',');
        const x = Number(numValues[0]);
        const y = Number(numValues[1]);
        const ascii = Number(numValues[2]);
        const char = String.fromCharCode(ascii);

        arr[x][y] = char;
    });

    for(let i = 0; i < 100; i++) {
        let result = '';

        for(let j = 0; j < 100; j++) {
            const value = arr[j][i];

            if(value !== 0) {
                result += value;
            }
            else {
                result += ' ';
            }
        }

        console.log(result);
    }
}

createAsciiArt();
// asciiToByte();
// module.exports = { doTheThing };