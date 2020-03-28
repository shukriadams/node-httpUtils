const 
    fs = require('fs-extra'),
    request = require('request'),
    http = require('http');


/**
 * Downloads a file and saves it locally.
 */    
const downloadFile = async function (url, filePath){
    return new Promise(async function(resolve, reject){
        const file = fs.createWriteStream(savePath);

        http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(function(){
                    resolve();
                });  
            });
        }).on('error', function(error) {
            // if download fails, delete file
            fs.unlink(filePath);
            reject(error);
        });

    });
}


/** 
 * Async request. 
 */
const downloadString = async (options)=>{
    return new Promise((resolve, reject)=>{
        request( options, 
            (error, response) =>{
                if (error)
                    return reject(error);

                resolve(response);
            }
        )
    });
}


/**
 * Downloads the target url as JSON.
 */
const downloadJSON = async (url)=>{
    let raw = await downloadString(url);
    return JSON.parse(raw.body);
}


/**
 * 
 */
const postUrlString = async function(remoteUrl, body, requestOptions = {}){
    return new Promise(function(resolve, reject) {
        try {
            requestOptions.url = remoteUrl;
            requestOptions.method = 'POST';
            requestOptions.body = body;
            requestOptions.headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            request(requestOptions, 
                function(err, resp, body){
                    if (err)
                        return reject(err);
                        
                    resolve({ raw: resp, body : body});
                }
            );
           
        } catch(ex) {
            reject(ex);
        }
     });
};


module.exports = {
    postUrlString,
    downloadFile,
    downloadString,
    downloadJSON
}
