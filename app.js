//import {generateUploadURL} from "./s3.js";
const ENDPOINT = "https://svalcin-moon-phases.hf.space/run/predict";
const realFileBtn = document.getElementById("real-file");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("custom-text");
const progress = document.getElementById("progress");
const predictionsBtn = document.getElementById("getPredictions");
const acceptableFileTypes  = ["image/png", "image/jpeg"];
const preview = document.getElementById("preview");
const prediction = document.getElementById("prediction");
let validFiles = [];

// register event listeners

customBtn.addEventListener("click", () =>{
    realFileBtn.click();
    clearImagePreview();
});

realFileBtn.addEventListener("change", updateImagePreview);

predictionsBtn.addEventListener("click", event => {
    if (validFiles.length == 0){
        progress.textContent = "No files chosen";
    } else{
        progress.textContent = "thinking...";
        let previewList = preview.firstElementChild.children;
        for (let f = 0; f < validFiles.length; f++){
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                await getPrediction(reader.result)
                .then((label) => previewList[f].querySelector('p').textContent = label)
                .finally(() => {
                    if (f === validFiles.length-1){
                        progress.textContent = "done";
                        realFileBtn.value = null;
                        validFiles =[];
                        //setTimeout(() => progress.textContent ="", 5000);
                    } 
                });
            }
            reader.readAsDataURL(validFiles[f]);
            
            //upload to s3
            //await uploadObject(validFiles[f]); 
        }
        
        
    }
});

//helper functions

async function getPrediction(image_string){
    const response = await fetch (ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "data" : [
                image_string
            ]
        })
    }).then( (res) => res.json());

    const data = response['data'][0]['label'];
    return data;
    

}

async function uploadObject (file){
    let s3url = "";
    //get url from server
    await generateUploadURL()
    .then((data) => {
        s3url = s3url + data;
        console.log(s3url);
    }).then(() => {
        //upload to s3
        fetch(s3url, {
            method: "PUT",
            headers: {
                "content-Type": "image"
            },
            body: file
        }).then(() => {
            console.log("image uploaded");
        })
    });

}

function isValidFileType (file) {
    return acceptableFileTypes.includes(file.type);
}

function returnFileSize (numberOfBytes){
    if (numberOfBytes < 1024) {
        return `${numberOfBytes} bytes`;
    } else if (numberOfBytes < 1048576){
        return `${(numberOfBytes/1024).toFixed(1)} KB`
    }else{
        return `${(numberOfBytes/1048576).toFixed(1)} MB`
    }
}

function clearImagePreview(){
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }
}

function updateImagePreview() {
    //empty previous contents of preview div
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }
    progress.textContent = "";

    //grab the filelist oibject nad store it in a variable called currentFiles
    const currentFiles = realFileBtn.files;

    //check to see if no file were selected by checking currentfiles.length
    if (currentFiles.length == 0){
        //IF O print message in preview div saying no files selected
        const para = document.createElement('p');
        para.textContent = "No file chosen yet";
        preview.appendChild(para);
    } else {
        //await uploadObject(file);
        
        //progress.textContent = "uploading"

        const list = document.createElement('ol');
        preview.appendChild(list);

        //otherwise loop through files, printint message about each file
        for (const file of currentFiles){
            const listItem = document.createElement('li');
            const para = document.createElement('p');

            //make a custom function to check if the file type is correct
            if (isValidFileType(file)) {
                validFiles.push(file);
                //if so
                //put name and size in a list item

                para.textContent = `File name: ${file.name}, File size: ${returnFileSize(file.size)}`;

                 //create thumbnail preview of image by calling URL.createObjectURL(currentFiles[i])
                const image = document.createElement('img');
                image.src = URL.createObjectURL(file);

                listItem.appendChild(para);
                listItem.appendChild(image);

            }else {
                //if not display message in a list item, telling user to select a different file
                para.textContent = "Choose a different image File type must be .png, .jpg, or .jpeg"
                listItem.appendChild(para);
            }
            list.appendChild(listItem);
            //progress.textContent = "upload complete";
        }
    }
}

