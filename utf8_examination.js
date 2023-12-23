function analyzeBinaryRepresentation(){}

/*Javascript Obect
    That Represents the Maximum Value for the preceeding bytes of a 2 string UTF-8 sequence
*/

const maxRepresentativeValues = [1, 0x40, 0x40*0x40, 0x40*0x40*0x40];


function analyzeCodePointByteArray(byteArray, numBytes){

    // How Many Values
    

    //First Byte?? 

    let accumulated_value = 0

    for(let byte_index = 0; byte_index < numBytes; byte_index ++){
        let next_byte = byteArray[byte_index]
        let multiplier = maxRepresentativeValues[numBytes-byte_index-1];

        let significant_bits = 0

        //Bytes that matter to coutning towards the U+ value

        //Is it the first byte 
        if(byte_index == 0){
            //First Byte first 3 bits don't matter, its & 0b00011111 or & 0x1F
            switch(numBytes){
                case 1:
                    significant_bits += (next_byte & 0xFF)
                    accumulated_value += (next_byte & 0xFF) * multiplier
                    
                    break;
                case 2:
                    significant_bits += (next_byte & 0x1F)
                    accumulated_value += (next_byte & 0x1F)*multiplier
                    break;
                case 3:
                    significant_bits += (next_byte & 0x0F)
                    accumulated_value += (next_byte & 0x0F)*multiplier
                    break;
                case 4:
                    significant_bits += (next_byte & 0x07)
                    accumulated_value += (next_byte & 0x07)*multiplier  
                    break;
            }
        }
        
        else {
            accumulated_value += (next_byte&0x3F)*multiplier 
        }

        console.log(`\t  ${next_byte.toString(16).padStart(2,'0')} : ${next_byte.toString(2).padStart(8, '0')}= ${next_byte} * ${multiplier} = ${multiplier*significant_bits}`);

    }



    console.log(`\t\tCalculated Decimal Value = ${accumulated_value}`)
    console.log(`\t\tCalculated Hexadecimal Value = ${accumulated_value.toString(16)}`)    
}


function analyzeUtf8String(buffer)  {
    // Iterate through the Buffer
    for (let i = 0; i < buffer.length;) {
        /**
        
        First we need to find the number of bytes in the UTF-8 sequence.
    
        We Need to Check the First Byte of the UTF-8 Sequence to Determine the Number of Bytes in the Sequence
    
        By the preceeding number of 1s in the binary number 
        */
    
    
      // Get the first byte of the UTF-8 sequence
      const firstByte = buffer[i];
    
      // Determine the number of bytes in the UTF-8 sequence based on the first byte
      let numBytes;
    
      // If the first byte is less than 0x80 (0b10000000), then it's a single-byte ASCII character
      // 0x80 = 0b10000000
      // if firstByte starts with 0, then it has no overlapping 0s with 0x80
      //Could be rewritten as if (firstByte & 0x80 ) === 0x00
      if (firstByte < 0x80) {
        numBytes = 1;
        //Checks if the third bit is 0, if so it's 2 bytes
        // 1110 0000 = 0xE0
        // 1100 0000 = 0xC0
        // 0xE0 & 0xC0 = 0xC0
    
      } else if ((firstByte & 0xE0) === 0xC0) {
        numBytes = 2;
    
        //Chec if the fourth bit is 0, if so it's 3 bytes
        // 1111 0000 = 0xF0
        //  1110 0000 = 0xE0
        // If firstByte & 0xF0 = 0xE0, that means the 4th bit is 0
        //If it was 1 it would be 0xF0
      } else if ((firstByte & 0xF0) === 0xE0) {
        numBytes = 3;
    
        //Same thing, 1111 1000 = 0xF8
        // 1111 0000 = 0xF0
        // If the 5th bit is 0, then firstByte & 0xF8 = 0xF0
        //if the 5th bit is 1, then 1111 1000 & 1111 1000 = 0xF8
      } else if ((firstByte & 0xF8) === 0xF0) {
        numBytes = 4;
        //More than 5 preceeding 1s, makes no sense
      } else {
        // Handle invalid UTF-8 sequence
        console.error(`Invalid UTF-8 sequence at position ${i}`);
        break;
      }
      // Extract the UTF-8 sequence, starting at the previous last byte to the num of code points
      const utf8Sequence = buffer.slice(i, i + numBytes);
    
      //Add Code to See if each byte makes sense
      //For all but the first byte
      //The first bit for all but the first byte in a code point
      // 
    
      for(let j = 1; j < numBytes; j++){
        let next_byte_check = utf8Sequence[j]//buffer[i + j];
        // Check if first bit is 1 and second bit is 0
        // 1000 0000 = 0x80
        // 1100 0000 = 0xC0
        //If firs byte between 0x80 and 0xC0, then it's a valid UTF-8 sequence
        //which means that the first bit is 1 and the second bit is 0
        if ((next_byte_check & 0xC0) !== 0x80) {
          console.error(`Invalid UTF-8 sequence at position ${i+j} byte ${next_byte_check.toString(2).padStart(8,'0')}`);
          return;
        }
      }
    
      // Convert the UTF-8 sequence to a Unicode code point
      const codePoint = utf8Sequence.toString('utf-8').codePointAt(0);
      // Print the hexadecimal representation of the code point
      //Print out the binary representation with a multiple of 8 characters to see first 0s instead of omitting them



      let subArray = utf8Sequence
      //utf8Sequence.subArray(i+numBytes)


      console.log(`Code Point at position ${i}: U+${codePoint.toString(16)},  Decimal Value of ${codePoint.toString(10)}, Number Bytes ${numBytes}`);

      console.log(`\t Hexdecimal Representation: ${subArray.toString('hex').padStart(2*numBytes, '0')}`)
      //console.log(`\t Binary Representation: ${subArray.toString(2).padStart(8*numBytes, '0')}`)
      console.log("Byte By Byte Calculation")

      /*for (let byte of subArray) {
        console.log(`\t  ${byte.toString(2).padStart(8, '0') } = ${byte & 0x7F}`);
        }
    */

        analyzeCodePointByteArray(subArray, numBytes)

      //console.log(`t ${subArray.toString(2)}`)
      //console.log(`\t  ${subArray.toString(2).padStart(8*numBytes, '0')}`);
      // Move to the next position in the Buffer
      i += numBytes;

      console.log("\n")
    }
    console.log('' + buffer.toString('utf-8') + '\n');
}

//analyze utf8 string
const tan_facepalming_emoji_woman= "🤦🏽‍♀️"
analyzeUtf8String(Buffer.from(tan_facepalming_emoji_woman));




// Intentionally Screw up and make an invalid sequence
const fuckUpedfacepalmingemojiwoman = Buffer.from(tan_facepalming_emoji_woman);

//Lets go to position 5 and rewrite the byte 
fuckUpedfacepalmingemojiwoman[5] =  fuckUpedfacepalmingemojiwoman[5] & 0x7F //Set the First Bit to 0
//analyzeUtf8String(fuckUpedfacepalmingemojiwoman);

//Lets Create an Invalid Encoding of the number of bytes 

const fuckedupFirstByte = Buffer.from(tan_facepalming_emoji_woman);
//Make 4th Bit 0
fuckedupFirstByte[0] = 0xEF & fuckedupFirstByte[0]
//analyzeUtf8String(fuckedupFirstByte)



analyzeUtf8String(Buffer.from("❄️"))


analyzeUtf8String(Buffer.from("❄️"))
